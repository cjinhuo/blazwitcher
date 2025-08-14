import { CONTEXT_MENU_HOMEPAGE, CONTEXT_MENU_SHORTCUT, GITHUB_URL, MAIN_WINDOW } from '~shared/constants'
import { dataProcessing } from '~shared/data-processing'
import { weakUpWindowIfActiveByUser } from '~shared/open-window'
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

// 流式传输
async function handleTabGroupOperationsStream(currentWindowData: any) {
	try {
		const response = await fetch('http://localhost:3000/ark/categorize-tabs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data: currentWindowData }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const reader = response.body?.getReader() // fetch api: get ReadableStream
		if (!reader) {
			throw new Error('无法获取响应流')
		}
		const decoder = new TextDecoder() // 二进制 => 字符串

		let jsonBuffer = ''

		// 存储解析后的stream
		let statistics = null
		let addToExistingGroups = []
		let createNewGroups = []
		let processedGroups = new Set()

		// 进度跟踪
		let totalOperations = 0
		let completedOperations = 0
		let currentOperation = ''
		let hasCompletedAllOperations = false

		// 发送进度更新到前端
		const sendProgressUpdate = (progress: any) => {
			// 获取所有活动的标签页并发送消息
			chrome.tabs.query({ active: true }, (tabs) => {
				tabs.forEach((tab) => {
					if (tab.id) {
						chrome.tabs.sendMessage(tab.id, {
							type: 'tabGroupProgressUpdate',
							progress,
						}).catch(() => {
						})
					}
				})
			})
		}

		// 检查并发送完成进度
		const checkAndSendCompletion = () => {
			if (!hasCompletedAllOperations && completedOperations >= totalOperations) {
				hasCompletedAllOperations = true
				
				// 发送完成进度
				sendProgressUpdate({
					total: totalOperations,
					completed: totalOperations,
					currentOperation: '标签页分组完成！',
					percentage: 100,
				})
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
							// totalOperations 应该是所有需要处理的标签页数量
							// 每个标签页被添加到现有组或创建新组都算一个操作
							totalOperations = (statsData.tabsToAddToExisting || 0) + (statsData.tabsToCreateNewGroups || 0)
							console.log(`📊 统计信息: 添加现有组 ${statsData.tabsToAddToExisting} 个, 创建新组 ${statsData.tabsToCreateNewGroups} 个`)
							
							// 发送初始进度
							sendProgressUpdate({
								total: totalOperations,
								completed: 0,
								currentOperation: '开始处理标签页分组...',
								percentage: 0,
							})
						} catch (e) {
							// 统计信息不完整，继续等待
						}
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
								for (const item of existingData) {
									if (item.tabId && item.groupId) {
										const key = `existing_${item.tabId}_${item.groupId}`
										if (!processedGroups.has(key)) {
											processedGroups.add(key)
											console.log(`🚀 立即执行: 将tab ${item.tabId} 添加到组 ${item.groupId}`)
											
											// 执行Chrome API调用
											try {
												await chrome.tabs.group({ tabIds: [item.tabId], groupId: item.groupId })
												completedOperations++
												
												// 更新进度
												currentOperation = `正在将标签页 ${item.tabId} 添加到现有组...`
												sendProgressUpdate({
													total: totalOperations,
													completed: completedOperations,
													currentOperation,
													percentage: Math.round((completedOperations / totalOperations) * 100),
												})
												
												console.log(`✅ 成功将tab ${item.tabId} 添加到组 ${item.groupId}`)
											} catch (error) {
												console.error(`❌ 添加tab到组失败: ${item.tabId} -> ${item.groupId}`, error)
											}
										}
									}
								}
								addToExistingGroups = existingData
								checkAndSendCompletion()
							}
						} catch (e) {
							// 数据不完整，继续等待
						}
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
					let braceCount = 0    // 跟踪大括号 {} 的嵌套层级
					let bracketCount = 0  // 跟踪方括号 [] 的嵌套层级
					let inString = false  // 是否在字符串内部
					let escapeNext = false // 下一个字符是否被转义
					let endIndex = -1     // 找到的结束位置
					
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
							if (char === '{') braceCount++      // 进入对象
							else if (char === '}') braceCount-- // 退出对象
							else if (char === '[') bracketCount++ // 进入数组
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
							
							// 只处理新的条目（避免重复处理）
							if (newGroupsData.length !== createNewGroups.length) {
								console.log(`🔄 发现新的createNewGroups数据，数量: ${newGroupsData.length}`)
								for (const group of newGroupsData) {
									if (group.groupTitle && group.groupColor && group.tabIds) {
										const key = `new_${group.groupTitle}_${group.tabIds.join('_')}`
										if (!processedGroups.has(key)) {
											processedGroups.add(key)
											console.log(`🚀 立即执行: 创建新组 "${group.groupTitle}" (${group.groupColor}) 包含tabs ${group.tabIds.join(', ')}`)

											try {
												// 1. 创建新的 tab group
												const groupId = await chrome.tabs.group({
													tabIds: group.tabIds,
												})

												// 2. 更新组的标题和颜色
												await chrome.tabGroups.update(groupId, {
													title: group.groupTitle,
													color: group.groupColor as any,
												})

												// 增加这个组中所有标签页的数量
												completedOperations += group.tabIds.length
												
												// 更新进度
												currentOperation = `正在创建新组 "${group.groupTitle}" (${group.tabIds.length} 个标签页)...`
												sendProgressUpdate({
													total: totalOperations,
													completed: completedOperations,
													currentOperation,
													percentage: Math.round((completedOperations / totalOperations) * 100),
												})
												
												console.log(`✅ 成功创建新组: ${group.groupTitle}, ID: ${groupId}`)
											} catch (error) {
												console.error(`❌ 创建新组失败: ${group.groupTitle}`, error)
											}
										}
									}
								}
								createNewGroups = newGroupsData
								checkAndSendCompletion()
							}
						} catch (e) {
							// 解析失败，继续等待更多数据
						}
					}
				}

			} catch (error) {
				// 解析错误，继续等待更多数据
			}
		}

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
					
					if (data === '[DONE]') {
						console.log(`📡 收到 [DONE] 事件，总共 ${eventCount} 个事件`)
						break
					}
					
					try {
						const parsed = JSON.parse(data)
						const content = parsed.choices?.[0]?.delta?.content || ''

						if (content) {
							jsonBuffer += content

							// 每10个chunk处理一次，提高实时性
							if (eventCount % 10 === 0) {
								await processStreamData(jsonBuffer)
							}
						}
					} catch (e) {
						// 静默处理解析错误，不打印无效数据
					}
				}
			}
		}

		// 最终处理，确保不遗漏
		await processStreamData(jsonBuffer)

		// 如果还没有发送完成进度，在这里发送
		if (!hasCompletedAllOperations) {
			sendProgressUpdate({
				total: totalOperations,
				completed: totalOperations,
				currentOperation: '标签页分组完成！',
				percentage: 100,
			})
		}

		return { success: true, message: 'Tab group 操作完成' }
	} catch (error) {
		console.error('流式处理 tabgroup 操作失败:', error)
		return { success: false, error: error.message }
	}
}

// 非流式传输
async function handleTabGroupOperations(categorizeResult: any) {
	try {
		const parsedResult = JSON.parse(categorizeResult)
		const { createNewGroups, addToExistingGroups } = parsedResult

		// 处理创建新组
		if (createNewGroups && createNewGroups.length > 0) {
			for (const group of createNewGroups) {
				if (group.tabIds && group.tabIds.length > 0) {
					try {
						// 创建新的 tab group
						const groupId = await chrome.tabs.group({
							tabIds: group.tabIds,
						})

						// 更新组的标题和颜色
						await chrome.tabGroups.update(groupId, {
							title: group.groupTitle,
							color: group.groupColor as any,
						})

					} catch (error) {
						console.error(`创建新组失败: ${group.groupTitle}`, error)
					}
				}
			}
		}

		// 处理添加到现有组
		if (addToExistingGroups && addToExistingGroups.length > 0) {
			console.log('addToExistingGroups')
			for (const group of addToExistingGroups) {
				if (group.tabIds && group.tabIds.length > 0) {
					// 将标签页添加到现有组
					// 注意：这里需要根据 groupTitle 或其他标识找到对应的现有组
					// 由于你的数据结构中没有 groupId，这里需要先查询现有组
					try {
						// 获取所有 tab groups
						const allGroups = await chrome.tabGroups.query({})
						const existingGroup = allGroups.find((g) => g.title === group.groupTitle)

						if (existingGroup) {
							// 将标签页添加到现有组
							await chrome.tabs.group({
								groupId: existingGroup.id,
								tabIds: group.tabIds,
							})
							console.log(`添加到现有组: ${group.groupTitle}`)
						} else {
							console.warn(`未找到现有组: ${group.groupTitle}`)
						}
					} catch (error) {
						console.error(`处理现有组失败: ${group.groupTitle}`, error)
					}
				}
			}
		}

		return { success: true, message: 'Tab group 操作完成' }
	} catch (error) {
		console.error('处理 tabgroup 操作失败:', error)
		return { success: false, error: error.message }
	}
}

async function main() {
	weakUpWindowIfActiveByUser()
	appendContextMenus()

	const getProcessedData = dataProcessing()

	chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
		if (message.type === 'handleTabGroupOperations') {
			try {
				const operationResult = await handleTabGroupOperationsStream(message.currentWindowData)
				sendResponse(operationResult)
			} catch (error) {
				sendResponse({ success: false, error: error.message })
			}
			return true
		}
	})

	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name === MAIN_WINDOW) {
			// 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
			port.postMessage(await getProcessedData())
			port.onMessage.addListener(async (message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})
}

main()
