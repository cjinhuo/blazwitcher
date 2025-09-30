import { AI_TAB_GROUP_MESSAGE_TYPE, ERROR_MESSAGE_TYPE } from '~shared/constants'
import type { TabGroupOperationResult, WindowData } from '~shared/types'

export class TabGroupManager {
	private streamState: TabGroupOperationResult

	constructor() {
		this.streamState = {
			process: 0,
			effectExistingGroups: [],
			newGroups: [],
		}
	}

	getProgress() {
		return this.streamState.process
	}

	private sendErrorMessage(error?: string | Error) {
		let errorMessage = 'Oops, the server is having a coffee break... ☕️🤖'

		if (error) {
			if (typeof error === 'string') {
				errorMessage = error
			} else if (error instanceof Error || (typeof error === 'object' && 'message' in error)) {
				errorMessage = error.message || error.toString()
			} else {
				errorMessage = String(error)
			}
		}

		// 发送错误消息到sidepanel
		chrome.runtime
			.sendMessage({
				type: ERROR_MESSAGE_TYPE,
				error: errorMessage,
			})
			.catch(() => {})
	}

	// 执行 AI 分组 (stream)
	async execute(currentWindowData: WindowData) {
		try {
			// TODO: @Shanks 部署后修改域名
			const response = await fetch('http://localhost:3000/ark/categorize-tabs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					data: currentWindowData,
				}),
			})

			if (!response.ok) {
				return this.sendErrorMessage(response.statusText)
			}

			await this.processStreamResponse(response.body)
		} catch (error) {
			this.sendErrorMessage(error)
		} finally {
			this.cleanup()
			chrome.runtime.sendMessage({
				type: AI_TAB_GROUP_MESSAGE_TYPE,
				isProcessing: false,
			})
		}
	}

	private async processStreamResponse(responseBody: ReadableStream) {
		const reader = responseBody.getReader() // fetch api: get ReadableStream
		const decoder = new TextDecoder() // 二进制 => 字符串

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			const chunk = decoder.decode(value)
			const lines = chunk.split('\n').filter((line) => line.trim())

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const data = line.slice(6) // 去掉data:

					try {
						const parsed = JSON.parse(data)
						if (parsed.content && parsed.status) {
							this.streamState = parsed.content
							chrome.runtime.sendMessage({
								type: AI_TAB_GROUP_MESSAGE_TYPE,
								progress: parsed.content.process,
								isProcessing: true,
							})
							// 如果状态为finished，退出循环
							if (parsed.status === 'finished') {
								console.log('📡 流式处理完成，一次性分组', this.streamState)
								this.groupTabs()
								break
							}
						} else if (parsed.error) {
							console.error('❌ 服务器返回错误:', parsed.error)
							this.sendErrorMessage(parsed.error)
							break
						}
					} catch (error) {
						console.error('解析流式数据失败:', error)
					}
				}
			}
		}
	}

	private async groupTabs(): Promise<void> {
		console.log('🔍 开始分组', this.streamState)
		// 处理现有分组的更新
		const existingGroupPromises = this.streamState.effectExistingGroups.map(async (item) => {
			try {
				await chrome.tabs.group({ tabIds: item.tabIds, groupId: item.groupId })
			} catch (error) {
				console.error('更新现有分组失败:', error)
			}
		})

		// 处理新分组的创建
		const newGroupPromises = this.streamState.newGroups.map(async (item) => {
			try {
				const groupId = await chrome.tabs.group({
					tabIds: item.tabIds,
				})
				await chrome.tabGroups.update(groupId, {
					title: item.groupTitle,
					color: item.groupColor as chrome.tabGroups.ColorEnum,
				})
			} catch (error) {
				console.error('创建新分组失败:', error)
			}
		})

		// 等待所有操作完成，即使某些操作失败也不影响其他操作
		await Promise.allSettled([...existingGroupPromises, ...newGroupPromises])
	}

	private cleanup() {
		this.streamState = {
			process: 0,
			effectExistingGroups: [],
			newGroups: [],
		}
	}
}
