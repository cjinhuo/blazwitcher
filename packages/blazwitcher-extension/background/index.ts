import { CONTEXT_MENU_HOMEPAGE, CONTEXT_MENU_SHORTCUT, GITHUB_URL, MAIN_WINDOW } from '~shared/constants'
import { dataProcessing } from '~shared/data-processing'
import { weakUpWindowIfActiveByUser } from '~shared/open-window'
import type { AiGroupingProgress, WindowData } from '~shared/types'
import { closeCurrentWindowAndClearStorage } from '~shared/utils'

const appendContextMenus = () => {
	// 先移除所有现有的上下文菜单，避免ID冲突
	chrome.contextMenus.removeAll(() => {
		// 创建快捷键设置菜单
		chrome.contextMenus.create({
			...CONTEXT_MENU_SHORTCUT,
			contexts: ['action'],
		})
		// 创建主页菜单
		chrome.contextMenus.create(
			{
				...CONTEXT_MENU_HOMEPAGE,
				contexts: ['action'],
			},
			() => {
				chrome.contextMenus.onClicked.addListener((info) => {
					if (info.menuItemId === CONTEXT_MENU_SHORTCUT.id) {
						chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
					} else if (info.menuItemId === CONTEXT_MENU_HOMEPAGE.id) {
						chrome.tabs.create({ url: GITHUB_URL })
					}
				})
			}
		)
	})
}

const currentAITabGroupProgress: AiGroupingProgress = {
	isProcessing: false,
	totalOperations: 0,
	completedOperations: 0,
	percentage: 0,
}

const resetProgressState = () => {
	currentAITabGroupProgress.isProcessing = false
	currentAITabGroupProgress.totalOperations = 0
	currentAITabGroupProgress.completedOperations = 0
	currentAITabGroupProgress.percentage = 0
}

// 延迟重置进度状态
let resetTimeoutId: NodeJS.Timeout | null = null
const resetProgressStateWithDelay = (delay = 3000) => {
	if (resetTimeoutId) {
		clearTimeout(resetTimeoutId)
	}

	resetTimeoutId = setTimeout(() => {
		resetProgressState()
		resetTimeoutId = null
	}, delay)
}

// AI TabGroup 分组 (stream)
async function handleTabGroupOperationsStream(currentWindowData: WindowData, language?: string) {
	try {
		currentAITabGroupProgress.isProcessing = true
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

		const reader = response.body?.getReader() // fetch api: get ReadableStream
		if (!reader) {
			throw new Error('无法获取 ReadableStream')
		}
		const decoder = new TextDecoder() // 二进制 => 字符串

		let jsonBuffer = ''

		// 存储解析后的stream
		let statistics = null
		let addToExistingGroups = []
		let createNewGroups = []
		const processedGroups = new Set()

		const sendProgressUpdate = (progress: AiGroupingProgress) => {
			chrome.runtime
				.sendMessage({
					type: 'tabGroupProgressUpdate',
					progress,
				})
				.catch(() => {})
		}

		// 检查并发送完成进度
		const checkAndSendCompletion = () => {
			if (currentAITabGroupProgress.completedOperations >= currentAITabGroupProgress.totalOperations) {
				currentAITabGroupProgress.isProcessing = false
				currentAITabGroupProgress.percentage = 100
				sendProgressUpdate(currentAITabGroupProgress)

				// 延迟重置进度状态
				resetProgressStateWithDelay(3000)
			}
		}

		const processStreamData = async (jsonBuffer: string) => {
			try {
				// 1. 解析统计信息（用于显示进度）
				if (!statistics && jsonBuffer.includes('"statistics"')) {
					const statsMatch = jsonBuffer.match(/"statistics":\s*({[^}]+})/)
					if (statsMatch) {
						try {
							const statsData = JSON.parse(statsMatch[1])
							statistics = statsData
							// totalOperations 是所有需要处理的操作数量
							// 添加到现有组：每个标签页算1个操作
							// 创建新组：每个组算1个操作（不管组内有多少标签页）
							currentAITabGroupProgress.totalOperations =
								(statsData.tabsToAddToExisting || 0) + (statsData.newGroupsToCreate || 0)
							console.log(
								`📊 统计信息: 添加现有组 ${statsData.tabsToAddToExisting} 个标签页, 创建新组 ${statsData.newGroupsToCreate} 个, 总操作数: ${currentAITabGroupProgress.totalOperations}`
							)

							// 处理 totalOperations = 0 的场景
							if (currentAITabGroupProgress.totalOperations === 0) {
								currentAITabGroupProgress.isProcessing = true
								currentAITabGroupProgress.completedOperations = 0
								currentAITabGroupProgress.percentage = 100
								sendProgressUpdate(currentAITabGroupProgress)
								resetProgressStateWithDelay(3000)
								return
							}

							sendProgressUpdate(currentAITabGroupProgress)
						} catch (e) {}
					}
				}

				// 2. 解析addToExistingGroups - 直接提取tabId和groupId
				if (jsonBuffer.includes('"addToExistingGroups"')) {
					const existingMatch = jsonBuffer.match(/"addToExistingGroups":\s*(\[[\s\S]*?\])/)
					if (existingMatch) {
						try {
							const existingData = JSON.parse(existingMatch[1])
							// 只处理新的条目
							if (existingData.length !== addToExistingGroups.length) {
								for (let i = 0; i < existingData.length; i++) {
									const item = existingData[i]
									if (item.tabId && item.groupId) {
										const key = `existing_${item.tabId}_${item.groupId}`
										if (!processedGroups.has(key)) {
											processedGroups.add(key)
											// 执行Chrome API调用
											try {
												await chrome.tabs.group({ tabIds: [item.tabId], groupId: item.groupId })
												// 等待操作完全执行完毕后再更新进度
												currentAITabGroupProgress.completedOperations++
												currentAITabGroupProgress.percentage = Math.min(
													100,
													Math.round(
														(currentAITabGroupProgress.completedOperations /
															Math.max(1, currentAITabGroupProgress.totalOperations)) *
															100
													)
												)
												console.log(
													`📈 进度更新: ${currentAITabGroupProgress.completedOperations}/${currentAITabGroupProgress.totalOperations} = ${currentAITabGroupProgress.percentage}%`
												)
												sendProgressUpdate(currentAITabGroupProgress)
											} catch (error) {
												console.error(`❌ 添加tab到组失败: ${item.tabId} -> ${item.groupId}`, error)
											}
										}
									}
								}
								addToExistingGroups = existingData
								checkAndSendCompletion()
							}
						} catch (e) {}
					}
				}

				// 3. 解析createNewGroups
				if (jsonBuffer.includes('"createNewGroups"')) {
					// 找到 "createNewGroups" 字段的开始位置
					const startIndex = jsonBuffer.indexOf('"createNewGroups"')
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

							if (newGroupsData.length !== createNewGroups.length) {
								console.log(`🔄 发现新的createNewGroups数据, 数量: ${newGroupsData.length}`)
								for (let i = 0; i < newGroupsData.length; i++) {
									const group = newGroupsData[i]
									if (group.groupTitle && group.groupColor) {
										const key = `new_${group.groupTitle}_${group.groupColor}`
										if (!processedGroups.has(key)) {
											processedGroups.add(key)
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
												currentAITabGroupProgress.completedOperations += 1
												currentAITabGroupProgress.percentage = Math.min(
													100,
													Math.round(
														(currentAITabGroupProgress.completedOperations /
															Math.max(1, currentAITabGroupProgress.totalOperations)) *
															100
													)
												)
												sendProgressUpdate(currentAITabGroupProgress)
												console.log(`✅ 成功创建新组: ${group.groupTitle}`)
											} catch (error) {
												console.error(`❌ 创建新组失败: ${group.groupTitle}`, error)
											}
										}
									}
								}
								createNewGroups = newGroupsData
								checkAndSendCompletion()
							}
						} catch (error) {}
					}
				}
			} catch (error) {}
		}

		let eventCount = 0

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			const chunk = decoder.decode(value)
			const lines = chunk.split('\n').filter((line) => line.trim())

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const data = line.slice(6)
					eventCount++

					if (data === '[DONE]') {
						break
					}

					try {
						const parsed = JSON.parse(data)
						const content = parsed.choices?.[0]?.delta?.content || ''

						if (content) {
							jsonBuffer += content

							// 每10个chunk处理一次
							if (eventCount % 10 === 0) {
								await processStreamData(jsonBuffer)
							}
						}
					} catch (e) {}
				}
			}
		}

		await processStreamData(jsonBuffer)

		// 流式处理完成
		// console.log('🎉 流式处理完成！完整数据如下：')
		// console.log('📋 添加到现有组的数据:', addToExistingGroups)
		// console.log('🆕 创建新组的数据:', createNewGroups)

		resetProgressStateWithDelay(3000)
		return { success: true, message: 'Tab group 操作完成' }
	} catch (error) {
		// TODO:toast提示error
		resetProgressState()
		console.error('流式处理 tabgroup 操作失败:', error)
		return { success: false, error: error.message }
	}
}

async function main() {
	weakUpWindowIfActiveByUser()
	appendContextMenus()

	const getProcessedData = dataProcessing()

	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name === MAIN_WINDOW) {
			// 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
			port.postMessage({
				processedList: await getProcessedData(),
				currentAITabGroupProgress,
			})
			port.onMessage.addListener(async (message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})

	// 监听 AI分组的按钮点击事件
	chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
		if (message.type === 'handleTabGroupOperations') {
			try {
				const operationResult = await handleTabGroupOperationsStream(message.currentWindowData, message.language)
				sendResponse(operationResult)
			} catch (error) {
				sendResponse({ success: false, error: error.message })
			}
			return true
		}
	})
}

main()
