import { AI_GROUPING_RESET_COUNTDOWN_SECONDS, AI_TAB_GROUP_MESSAGE_TYPE, ERROR_MESSAGE_TYPE } from '~shared/constants'
import type { TabGroupOperationResult, WindowData } from '~shared/types'
import { safeSendMessage } from '~shared/utils'

const REMOTE_SERVER_URL = 'https://blazwitcher-server.vercel.app'
const LOCAL_SERVER_URL = 'http://localhost:3000'
const SERVER_URL = process.env.NODE_ENV === 'development' ? LOCAL_SERVER_URL : REMOTE_SERVER_URL

export class TabGroupManager {
	private streamState: TabGroupOperationResult
	originalWindowData?: WindowData
	originalWindowId?: number
	private countdownTimer?: NodeJS.Timeout
	private groupingStartedAt?: number
	private groupingDurationTimer?: NodeJS.Timeout

	constructor() {
		this.streamState = {
			progress: 0,
			showReset: false,
			isProcessing: false,
			effectExistingGroups: [],
			newGroups: [],
		}
		this.originalWindowData = undefined
		this.originalWindowId = undefined
		this.countdownTimer = undefined
	}

	setOriginalWindowData(windowData: WindowData) {
		this.originalWindowData = windowData
		this.originalWindowId = windowData.windowId
	}

	getProgress() {
		return {
			progress: this.streamState.progress,
			isProcessing: this.streamState.isProcessing,
			showReset: this.streamState.showReset,
			countdown: this.streamState.countdown,
			...(process.env.NODE_ENV === 'development' ? { durationMs: this.streamState.durationMs } : {}),
		}
	}

	private showResetButton() {
		// 清除之前的定时器
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
		}

		// 开始倒计时
		this.streamState.countdown = AI_GROUPING_RESET_COUNTDOWN_SECONDS
		this.sendProgressMessage({
			showReset: true,
			isProcessing: false,
		})

		// 每秒发送倒计时更新
		this.countdownTimer = setInterval(() => {
			this.streamState.countdown--
			this.sendProgressMessage()

			// 当倒计时为 0 时隐藏重置按钮
			if (this.streamState.countdown <= 0) {
				this.hideResetButton()
			}
		}, 1000)
	}

	private hideResetButton() {
		// 清除定时器
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
			this.countdownTimer = undefined
		}
		this.sendProgressMessage({
			showReset: false,
			countdown: undefined,
		})
		this.originalWindowData = undefined
		this.originalWindowId = undefined
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
		if (process.env.NODE_ENV === 'development') {
			clearTimeout(this.groupingDurationTimer)
			this.groupingDurationTimer = undefined
			this.streamState.durationMs = undefined
			this.groupingStartedAt = performance.now()
		}

		try {
			const response = await fetch(`${SERVER_URL}/ark/categorize-tabs`, {
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
			// 分成两次清理，第一次清理数据，第二次清理 showReset 状态
			this.sendProgressMessage({
				isProcessing: false,
				progress: 0,
				effectExistingGroups: [],
				newGroups: [],
			})
		}
	}

	private sendProgressMessage(_streamState?: Partial<TabGroupOperationResult>) {
		this.streamState = {
			...this.streamState,
			..._streamState,
		}
		safeSendMessage({
			type: AI_TAB_GROUP_MESSAGE_TYPE,
			...this.getProgress(),
		})
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
							// parsed.content 是 server/src/modules/parser.ts 下的 getStatus，没有包含 isProcessing 和 showReset
							this.sendProgressMessage({
								...this.streamState,
								...parsed.content,
								isProcessing: true,
							})
							// 如果状态为finished，退出循环
							if (parsed.status === 'finished') {
								console.log('📡 流式处理完成，一次性分组', this.streamState)
								// progress 是根据 AI 返回的数据来计算，可能到不了 100，结束时强行设置为 100
								this.sendProgressMessage({
									...this.streamState,
									...parsed.content,
									progress: 100,
								})
								await this.groupTabs()
								if (process.env.NODE_ENV === 'development' && this.groupingStartedAt !== undefined) {
									this.streamState.durationMs = performance.now() - this.groupingStartedAt
									this.groupingDurationTimer = setTimeout(() => {
										this.groupingDurationTimer = undefined
										this.sendProgressMessage({ durationMs: undefined })
									}, 3000)
								}
								// 分组完成后显示重置按钮
								this.showResetButton()
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
		// 开发环境保留弹窗焦点，避免耗时提示在弹窗后面过期。
		if (this.originalWindowId && process.env.NODE_ENV !== 'development') {
			chrome.windows.update(this.originalWindowId, { focused: true })
		}

		// 过滤掉特殊页面的标签页，这些页面不允许分组
		const filterSpecialPages = async (tabIds: number[]) => {
			const validTabIds: number[] = []

			for (const tabId of tabIds) {
				try {
					const tab = await chrome.tabs.get(tabId)
					// 检查是否为特殊页面
					if (tab.url && !this.isSpecialPage(tab.url)) {
						validTabIds.push(tabId)
					}
				} catch (error) {
					console.warn(`获取标签页信息失败: ${tabId}`, error)
				}
			}
			return validTabIds
		}

		// 处理现有分组的更新
		const existingGroupPromises = this.streamState.effectExistingGroups.map(async (item) => {
			try {
				const validTabIds = await filterSpecialPages(item.tabIds)
				if (validTabIds.length > 0) {
					await chrome.tabs.group({ tabIds: validTabIds, groupId: item.groupId })
				}
			} catch (error) {
				console.error('更新现有分组失败:', error)
			}
		})

		// 处理新分组的创建
		const newGroupPromises = this.streamState.newGroups.map(async (item) => {
			try {
				const validTabIds = await filterSpecialPages(item.tabIds)
				if (validTabIds.length > 0) {
					const groupId = await chrome.tabs.group({
						tabIds: validTabIds,
						...(process.env.NODE_ENV === 'development' && this.originalWindowId !== undefined
							? { createProperties: { windowId: this.originalWindowId } }
							: {}),
					})
					await chrome.tabGroups.update(groupId, {
						title: item.groupTitle,
						color: item.groupColor as chrome.tabGroups.ColorEnum,
					})
				}
			} catch (error) {
				console.error('创建新分组失败:', error)
			}
		})

		// 等待所有操作完成，即使某些操作失败也不影响其他操作
		await Promise.allSettled([...existingGroupPromises, ...newGroupPromises])
	}

	// 特殊页面无法进行分组操作
	private isSpecialPage(url: string): boolean {
		const specialPagePatterns = [
			/^chrome:\/\//,
			/^chrome-extension:\/\//,
			/^about:/,
			/^edge:\/\//,
			/^file:\/\//,
			/^data:/,
			/^javascript:/,
		]

		return specialPagePatterns.some((pattern) => pattern.test(url))
	}

	// 复原到 originalWindowData 的分组状态
	async resetToOriginalGrouping(): Promise<void> {
		if (!this.originalWindowData) return

		// 定位
		chrome.windows.update(this.originalWindowId, { focused: true })

		// 1) 还原未分组：将 original 中标记为未分组的 tab 执行 ungroup
		const ungroupTabIds: number[] = []
		for (const u of this.originalWindowData.ungroupedTabs) {
			const maybeId = u.data?.id
			if (typeof maybeId === 'number') ungroupTabIds.push(maybeId)
		}
		if (ungroupTabIds.length > 0) {
			await chrome.tabs.ungroup(ungroupTabIds).catch(() => {})
		}

		// 2) 还原已有分组
		const restoreExistingGroup = async (g: WindowData['existingGroups'][number]) => {
			const candidateTabIds: number[] = []
			for (const t of g.tabs as Array<any>) {
				const id = t?.id
				if (typeof id === 'number') candidateTabIds.push(id)
			}
			if (candidateTabIds.length === 0) return

			try {
				await chrome.tabs.group({ tabIds: candidateTabIds, groupId: g.id })
				await chrome.tabGroups.update(g.id, {
					title: g.title,
					color: g.color as chrome.tabGroups.ColorEnum,
				})
				return
			} catch {}
		}

		await Promise.allSettled(this.originalWindowData.existingGroups.map((g) => restoreExistingGroup(g)))

		// 重置完成后隐藏重置按钮
		this.hideResetButton()
	}
}
