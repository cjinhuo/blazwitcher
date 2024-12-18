import { CONTEXT_MENU_HOMEPAGE, CONTEXT_MENU_SHORTCUT, GITHUB_URL } from './constants'

export const appendContextMenus = () => {
	chrome.contextMenus.create({
		...CONTEXT_MENU_SHORTCUT,
		contexts: ['action'],
	})
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
}
