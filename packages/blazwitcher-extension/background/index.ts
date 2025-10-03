import {
	CONTEXT_MENU_HOMEPAGE,
	CONTEXT_MENU_SHORTCUT,
	GITHUB_URL,
	HANDLE_TAB_GROUP_MESSAGE_TYPE,
	MAIN_WINDOW,
	RESET_AI_TAB_GROUP_MESSAGE_TYPE,
} from '~shared/constants'
import { dataProcessing } from '~shared/data-processing'
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

	const getProcessedData = dataProcessing()
	const tabGroupManager = new TabGroupManager()

	// AI TabGroup 分组 (stream)
	chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
		if (message.type === HANDLE_TAB_GROUP_MESSAGE_TYPE) {
			try {
				tabGroupManager.setOriginalWindowData(message.currentWindowData)
				const result = await tabGroupManager.execute(message.currentWindowData)
				sendResponse(result)
			} catch (error) {
				sendResponse({ success: false, error: error.message })
			}
			return true
		}

		if (message.type === RESET_AI_TAB_GROUP_MESSAGE_TYPE) {
			tabGroupManager.resetToOriginalGrouping()
			sendResponse({ success: true })
			return true
		}
	})

	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name === MAIN_WINDOW) {
			// 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
			port.postMessage({
				processedList: await getProcessedData(),
				lastTimeTabGroupProgress: tabGroupManager.getProgress(),
			})
			port.onMessage.addListener(async (message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})
}

main()
