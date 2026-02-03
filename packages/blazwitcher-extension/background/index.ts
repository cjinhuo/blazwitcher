import {
	CONTEXT_MENU_HOMEPAGE,
	CONTEXT_MENU_SHORTCUT,
	DATA_TRANSFER_CHUNK_SIZE,
	GITHUB_URL,
	HANDLE_TAB_GROUP_MESSAGE_TYPE,
	INITIAL_TABS_COUNT,
	MAIN_WINDOW,
	RESET_AI_TAB_GROUP_MESSAGE_TYPE,
} from '~shared/constants'
import { bookmarksProcessingOnce, chunkArray, historyProcessing, tabsProcessing } from '~shared/data-processing'
import { weakUpWindowIfActiveByUser } from '~shared/open-window'
import { processTabsForAI } from '~shared/process-tabs-by-window'
import { PortMessageType } from '~shared/types'
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

	// Sidepanel 列表数据传输
	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name !== MAIN_WINDOW) return

		port.onMessage.addListener(async (message) => {
			if (message.type === 'close') {
				closeCurrentWindowAndClearStorage()
			}
		})

		// 1) 首屏支出：仅传输前 INITIAL_TABS_COUNT 条 tab
		const processedTabs = await tabsProcessing()
		const initialTabs = processedTabs.slice(0, INITIAL_TABS_COUNT)
		const remainingProcessedTabs = processedTabs.slice(INITIAL_TABS_COUNT)

		port.postMessage({
			type: PortMessageType.Initial,
			processedList: initialTabs,
			lastTimeTabGroupProgress: tabGroupManager.getProgress(),
		})

		// 2) 剩余tabs、AI分组数据传输
		port.postMessage({ type: PortMessageType.TabChunk, data: remainingProcessedTabs })

		// 3) history / bookmarks 分片传输
		try {
			const [history, bookmarks] = await Promise.all([historyProcessing(), bookmarksProcessingOnce()])
			for (const chunk of chunkArray(history, DATA_TRANSFER_CHUNK_SIZE)) {
				port.postMessage({ type: PortMessageType.HistoryChunk, data: chunk })
			}
			for (const chunk of chunkArray(bookmarks, DATA_TRANSFER_CHUNK_SIZE)) {
				port.postMessage({ type: PortMessageType.BookmarkChunk, data: chunk })
			}
		} catch (error) {
			console.error('Error loading history/bookmarks for sidepanel:', error)
		}

		// 4) AI分组数据传输
		port.postMessage({ type: PortMessageType.WindowDataList, data: processTabsForAI(processedTabs) })
	})

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
}

main()
