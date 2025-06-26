import { changelog } from '~popup/config/changelog'
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

async function main() {
	weakUpWindowIfActiveByUser()
	appendContextMenus()

	// It can not be an sync calculation, since maybe the bookmarks data of user is way too large.
	const getProcessedData = dataProcessing()
	chrome.runtime.onConnect.addListener(async (port) => {
		port.onDisconnect.addListener(() => {
			// 关闭popup（update notification）时
			if (port.name !== MAIN_WINDOW) {
				chrome.action.setPopup({ popup: '' })
				chrome.action.setBadgeText({ text: '' })
			}
		})
		if (port.name === MAIN_WINDOW) {
			// 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
			port.postMessage(await getProcessedData())
			port.onMessage.addListener((message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})

	// update notification
	chrome.runtime.onInstalled.addListener(async (details) => {
		const { reason } = details
		const manifest = chrome.runtime.getManifest()
		const currentVersion = manifest.version
		// 每次更新的feature数量
		const featureLength = changelog.find((item) => item.version === currentVersion)?.features.length
		if (reason === 'update' || reason === 'install') {
			// 仅在扩展版本更新或第一次安装后展示update notification
			chrome.action.setBadgeText({ text: featureLength?.toString() })
			const lastFocusedWindow = await chrome.windows.getLastFocused()
			if (lastFocusedWindow.id)
				await chrome.windows.update(lastFocusedWindow.id, {
					focused: true,
				})
			chrome.action.setPopup({ popup: 'popup.html' })
			chrome.action.openPopup()
		}
	})
}

main()
