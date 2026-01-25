import {
	CONTEXT_MENU_HOMEPAGE,
	CONTEXT_MENU_SHORTCUT,
	GITHUB_URL,
	HANDLE_TAB_GROUP_MESSAGE_TYPE,
	INITIAL_TABS_COUNT,
	MAIN_WINDOW,
	RESET_AI_TAB_GROUP_MESSAGE_TYPE,
} from '~shared/constants'
import { tabsQuery } from '~shared/promisify'
import {
	bookmarksProcessingOnce,
	filterValidTabs,
	historyProcessing,
	sortTabsRawForInitial,
	tabsProcessingFromRawTabs,
} from '~shared/data-processing'
import { weakUpWindowIfActiveByUser } from '~shared/open-window'
import { closeCurrentWindowAndClearStorage } from '~shared/utils'
import { TabGroupManager } from './tab-group-manager'

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

async function main() {
	weakUpWindowIfActiveByUser()
	appendContextMenus()

	// 初始化Tab、History、Bookmark数据，传输给 sidepanel
	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name === MAIN_WINDOW) {
			const startTime = Date.now() // 测试记录时间用

			// 1) 首屏优先：先发送 tabs 的前 INITIAL_TABS_COUNT 条
			// Critical path: only query+sort raw tabs, then process top N only
			const rawTabs = await tabsQuery({})
			const sortedRawTabs = sortTabsRawForInitial(filterValidTabs(rawTabs))
			const initialRawTabs = sortedRawTabs.slice(0, INITIAL_TABS_COUNT)
			const remainingRawTabs = sortedRawTabs.slice(INITIAL_TABS_COUNT)
			const initialTabs = await tabsProcessingFromRawTabs(initialRawTabs)

			port.postMessage({
				type: 'tab_data',
				data: initialTabs,
				isInitial: true,
				startTime,
			})

			port.postMessage({
				type: 'tab_group_progress',
				lastTimeTabGroupProgress: tabGroupManager.getProgress(),
				startTime,
			})

			// 2) 异步补齐：剩余 tabs + history + bookmarks（不分片）
			setTimeout(() => {
				if (remainingRawTabs.length === 0) return
				void (async () => {
					const remainingTabs = await tabsProcessingFromRawTabs(remainingRawTabs)
					port.postMessage({
						type: 'tab_data',
						data: remainingTabs,
						isInitial: false,
						startTime,
					})
				})()
			}, 0)

			void (async () => {
				try {
					const [history, bookmarks] = await Promise.all([historyProcessing(), bookmarksProcessingOnce()])
					port.postMessage({
						type: 'history_data',
						data: history,
						startTime,
					})
					port.postMessage({
						type: 'bookmark_data',
						data: bookmarks,
						startTime,
					})
				} catch (error) {
					console.error('Error processing data for sidepanel:', error)
				}
			})()

			port.onMessage.addListener(async (message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})

	// AI TabGroup 分组 (stream)
	const tabGroupManager = new TabGroupManager()
	chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
		try {
			if (message.type === HANDLE_TAB_GROUP_MESSAGE_TYPE) {
				tabGroupManager.setOriginalWindowData(message.currentWindowData)
				await tabGroupManager.execute(message.currentWindowData)
			} else if (message.type === RESET_AI_TAB_GROUP_MESSAGE_TYPE) {
				await tabGroupManager.resetToOriginalGrouping()
			}
			return sendResponse({ success: true })
		} catch (error) {
			return sendResponse({ success: false, error: error.message })
		}
	})
}

main()
