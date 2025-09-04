import { ADD_TO_EXISTING_GROUPS_MARK, AI_TAB_GROUP_MESSAGE_TYPE, CREATE_NEW_GROUPS_MARK, SSE_DONE_MARK, STATISTICS_MARK, chunkSize } from "~shared/constants";
import type { AiGroupingProgress, TabGroupOperationResult, WindowData } from "~shared/types";
import { ProgressManager } from "./progress-manager";

export class TabGroupManager {
  private progressManager: ProgressManager
  private processedGroups: Set<string>
  private streamState: TabGroupOperationResult & { jsonBuffer: string }

  constructor() {
    this.processedGroups = new Set()
    this.streamState = {
      statistics: null, // 分组统计，用于计算进度
      addToExistingGroups: [],
      createNewGroups: [],
      jsonBuffer: ''
    }
    this.progressManager = new ProgressManager((progress) => {
      chrome.runtime.sendMessage({
        type: AI_TAB_GROUP_MESSAGE_TYPE,
        progress,
      }).catch(() => { })
    })
  }

  getProgress(): AiGroupingProgress {
    return this.progressManager.getProgress()
  }

  private sendErrorMessage(error?: any) {
    // TODO：区分error type

    // 发送错误消息到前端
    chrome.runtime.sendMessage({
      type: AI_TAB_GROUP_MESSAGE_TYPE,
      error: {
        message: error || 'sry, server is error...',
      }
    }).catch(() => { })
  }

  // 执行 AI 分组 (stream)
  async execute(currentWindowData: WindowData, language?: string) {
    try {
      this.progressManager.startProcessing()

      // TODO: @Shanks 部署后修改域名
      const response = await fetch('http://localhost:3000/ark/categorize-tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: currentWindowData,
          language,
        }),
      })

      // server异常
      if (!response.ok) {
        this.sendErrorMessage()
      }

      await this.processStreamResponse(response.body)
    } catch (error) {
      console.error('流式处理 tabGroup 操作失败:', error)
      this.sendErrorMessage(error)
    } finally {
      this.cleanup()
    }
  }

  private async processStreamResponse(responseBody) {
    const reader = responseBody?.getReader() // fetch api: get ReadableStream
    const decoder = new TextDecoder() // 二进制 => 字符串
    let eventCount = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // 去掉data:
          eventCount++

          if (data === SSE_DONE_MARK) {
            console.log('🏁 流式数据接收完毕')
            break
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''

            if (content) {
              this.streamState.jsonBuffer += content

              // 每10个chunk处理一次
              if (eventCount % chunkSize === 0) {
                await this.processStreamData()
              }
            }
          } catch (e) {
            // 统一处理error
          }
        }
      }
    }

  }

  private async processStreamData() {
    const jsonBuffer = this.streamState.jsonBuffer

    // 1. 解析统计信息（用于显示进度）
    if (!this.streamState.statistics && jsonBuffer.includes(STATISTICS_MARK)) {
      const statsMatch = jsonBuffer.match(/"statistics":\s*({[^}]+})/)
      if (statsMatch) {
        try {
          const statsData = JSON.parse(statsMatch[1])
          this.streamState.statistics = statsData
          // totalOperations 是所有需要处理的操作数量
          // 添加到现有组：每个标签页算1个操作
          // 创建新组：每个组算1个操作（不管组内有多少标签页）
          this.progressManager.setTotalOperations(
            (statsData?.tabsToAddToExisting || 0) + (statsData?.newGroupsToCreate || 0)
          )
          console.log(
            `📊 统计信息: 添加现有组 ${statsData?.tabsToAddToExisting} 个标签页, 创建新组 ${statsData?.newGroupsToCreate} 个, 总操作数: ${this.progressManager.progress.totalOperations}`
          )
        } catch (error) {
          console.error('解析统计信息失败:', error)
        }
      }
    }

    // 2. 解析addToExistingGroups - 直接提取tabId和groupId
    if (jsonBuffer.includes(ADD_TO_EXISTING_GROUPS_MARK)) {
      const existingMatch = jsonBuffer.match(/"addToExistingGroups":\s*(\[[\s\S]*?\])/)
      if (existingMatch) {
        try {
          const existingData = JSON.parse(existingMatch[1])
          if (existingData.length !== this.streamState.addToExistingGroups.length) {
            for (let i = 0; i < existingData.length; i++) {
              const item = existingData[i]
              if (item.tabId && item.groupId) {
                const key = `existing_${item.tabId}_${item.groupId}`
                if (!this.processedGroups.has(key)) {
                  this.processedGroups.add(key)
                  // 添加到现有group中
                  try {
                    await chrome.tabs.group({ tabIds: [item.tabId], groupId: item.groupId })
                    console.log('✅添加到现有组')
                    // 等待操作完全执行完毕后再更新进度
                    this.progressManager.incrementCompleted()
                  } catch (error) {
                    console.error(`❌ 添加tab到组失败: ${item.tabId} -> ${item.groupId}`, error)
                  }
                }
              }
            }
            this.streamState.addToExistingGroups = existingData
          }
        } catch (error) {
          console.error('解析添加到现有组数据失败:', error)
        }
      }
    }

    // 3. 解析createNewGroups - 使用正则表达式匹配完整的组对象
    if (jsonBuffer.includes(CREATE_NEW_GROUPS_MARK)) {
      // 查找完整的组对象模式：{"groupTitle": "...", "groupColor": "...", "tabIds": [...]}
      const groupPattern = /\{[^}]*"groupTitle"[^}]*"groupColor"[^}]*"tabIds"[^}]*\}/g
      const matches = jsonBuffer.match(groupPattern)

      if (matches && matches.length > 0) {
        for (const match of matches) {
          try {
            const group = JSON.parse(match)
            if (group.groupTitle && group.groupColor && group.tabIds) {
              const key = `new_${group.groupTitle}_${group.groupColor}`
              if (!this.processedGroups.has(key)) {
                this.processedGroups.add(key)
                console.log(
                  `🚀 流式执行: 创建新组 "${group.groupTitle}" (${group.groupColor}) 包含tabs ${group.tabIds.join(', ')}`
                )

                // 新建组
                const groupId = await chrome.tabs.group({
                  tabIds: group.tabIds,
                })
                await chrome.tabGroups.update(groupId, {
                  title: group.groupTitle,
                  color: group.groupColor,
                })

                this.progressManager.incrementCompleted()
                console.log(`✅ 流式创建新组成功: ${group.groupTitle}`)

              }
            }
          } catch (error) {
            console.error('解析创建新组数据失败:', error)
          }
        }
      }
    }
  }

  private cleanup() {
    this.processedGroups.clear()
    this.streamState = {
      statistics: null,
      addToExistingGroups: [],
      createNewGroups: [],
      jsonBuffer: ''
    }
    this.progressManager.destroy()
  }
}