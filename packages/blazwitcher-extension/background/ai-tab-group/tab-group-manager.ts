import { ADD_TO_EXISTING_GROUPS_MARK, AI_TAB_GROUP_MESSAGE_TYPE, CREATE_NEW_GROUPS_MARK, SSE_DONE_MARK, STATISTICS_MARK, chunkSize } from "~shared/constants";
import type { TabGroupOperationResult, WindowData } from "~shared/types";
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await this.processStreamResponse(response.body)
    } catch (error) {
      console.error('流式处理 tabgroup 操作失败:', error)
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
          const data = line.slice(6)
          eventCount++

          if (data === SSE_DONE_MARK) break

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''

            if (content) {
              jsonBuffer += content

              // 每10个chunk处理一次
              if (eventCount % chunkSize === 0) {
                await this.processStreamData(jsonBuffer)
              }
            }
          } catch (e) {
            // 统一处理error
          }
        }
      }
    }

  }

  private async processStreamData(jsonBuffer: string) {
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

    // 3. 解析createNewGroups (TODO: 看下优化方案)
    if (jsonBuffer.includes(CREATE_NEW_GROUPS_MARK)) {
      // 找到 "createNewGroups" 字段的开始位置
      const startIndex = jsonBuffer.indexOf(CREATE_NEW_GROUPS_MARK)
      // 找到数组开始的 '[' 位置
      const afterColon = jsonBuffer.indexOf('[', startIndex)
      if (afterColon === -1) {
        return // 还没有找到数组开始，继续等待
      }

      // 状态机：找到匹配的数组结束位置 ']'
      let bracketCount = 0 // 跟踪方括号 [] 的嵌套层级
      let inString = false // 是否在字符串内部
      let escapeNext = false // 下一个字符是否被转义
      let endIndex = -1 // 找到的结束位置

      // 从数组开始位置遍历到缓冲区末尾
      for (let i = afterColon; i < jsonBuffer.length; i++) {
        const char = jsonBuffer[i]

        // 处理转义字符
        if (escapeNext) {
          escapeNext = false
          continue // 跳过被转义的字符
        }

        // 检测转义字符
        if (char === '\\') {
          escapeNext = true
          continue
        }

        // 处理字符串边界（忽略转义引号）
        if (char === '"' && !escapeNext) {
          inString = !inString // 切换字符串状态
          continue
        }

        // 只在非字符串状态下处理括号
        if (!inString) {
          if (char === '[')
            bracketCount++ // 进入数组
          else if (char === ']') {
            bracketCount-- // 退出数组
            // 如果回到了最外层数组，找到了结束位置
            if (bracketCount === 0) {
              endIndex = i + 1
              break
            }
          }
        }
      }

      // 如果找到了完整的数组
      if (endIndex !== -1) {
        try {
          // 提取完整的数组字符串
          const newGroupsStr = jsonBuffer.substring(afterColon, endIndex)
          const newGroupsData = JSON.parse(newGroupsStr)

          if (newGroupsData.length !== this.streamState.createNewGroups.length) {
            for (let i = 0; i < newGroupsData.length; i++) {
              const group = newGroupsData[i]
              if (group.groupTitle && group.groupColor) {
                const key = `new_${group.groupTitle}_${group.groupColor}`
                if (!this.processedGroups.has(key)) {
                  this.processedGroups.add(key)
                  console.log(
                    `🚀 立即执行: 创建新组 "${group.groupTitle}" (${group.groupColor}) 包含tabs ${group.tabIds.join(', ')}`
                  )

                  try {
                    // 等待创建组操作完全执行完毕
                    const groupId = await chrome.tabs.group({
                      tabIds: group.tabIds,
                    })

                    // 等待更新组信息操作完全执行完毕
                    await chrome.tabGroups.update(groupId, {
                      title: group.groupTitle,
                      color: group.groupColor,
                    })

                    // 所有操作完成后，再更新进度
                    this.progressManager.incrementCompleted()
                    console.log(`✅ 成功创建新组: ${group.groupTitle}`)
                  } catch (error) {
                    console.error(`❌ 创建新组失败: ${group.groupTitle}`, error)
                  }
                }
              }
            }
            this.streamState.createNewGroups = newGroupsData
          }
        } catch (error) {
          console.error('解析创建新组数据失败:', error)
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