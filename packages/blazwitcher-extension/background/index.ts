import {
	CHUNK_SIZE,
	CONTEXT_MENU_HOMEPAGE,
	CONTEXT_MENU_SHORTCUT,
	GITHUB_URL,
	HANDLE_TAB_GROUP_MESSAGE_TYPE,
	INITIAL_TABS_COUNT,
	MAIN_WINDOW,
	RESET_AI_TAB_GROUP_MESSAGE_TYPE,
} from '~shared/constants'
import { bookmarksProcessingOnce, chunkArray, historyProcessing, tabsProcessing } from '~shared/data-processing'
import { weakUpWindowIfActiveByUser } from '~shared/open-window'
import { processTabsForAI } from '~shared/process-tabs-by-window'
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

	const tabGroupManager = new TabGroupManager()

	// AI TabGroup 分组 (stream)
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

	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name !== MAIN_WINDOW) return

		port.onMessage.addListener(async (message) => {
			if (message.type === 'close') {
				closeCurrentWindowAndClearStorage()
			}
		})

		// 1) 首包：只查 raw tabs、排序、只加工前 INITIAL_TABS_COUNT 条
		const processedTabs = await tabsProcessing()
		const initialTabs = processedTabs.slice(0, INITIAL_TABS_COUNT)
		const remainingProcessedTabs = processedTabs.slice(INITIAL_TABS_COUNT)

		port.postMessage({
			type: 'initial',
			processedList: initialTabs,
			lastTimeTabGroupProgress: tabGroupManager.getProgress(),
		})

		// 2) 剩余tabs、AI分组数据传输
		port.postMessage({ type: 'tab_chunk', data: remainingProcessedTabs })

		// 3) history / bookmarks 分片 (chunk_size = 50)
		try {
			const [history, bookmarks] = await Promise.all([historyProcessing(), bookmarksProcessingOnce()])
			for (const chunk of chunkArray(history, CHUNK_SIZE)) {
				port.postMessage({ type: 'history_chunk', data: chunk })
			}
			for (const chunk of chunkArray(bookmarks, CHUNK_SIZE)) {
				port.postMessage({ type: 'bookmark_chunk', data: chunk })
			}
		} catch (error) {
			console.error('Error loading history/bookmarks for sidepanel:', error)
		}

		// 4) AI分组数据传输
		port.postMessage({ type: 'window_data_list', data: processTabsForAI(processedTabs) })
	})
}

main()
