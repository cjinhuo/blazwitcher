/* global chrome */

export const tabsQuery = promisifyChromeMethod<chrome.tabs.Tab[]>(chrome.tabs.query.bind(chrome.tabs))

export const sendMessageToTab = promisifyChromeMethod(chrome.tabs.sendMessage.bind(chrome.tabs))
export const tabsReload = promisifyChromeMethod(chrome.tabs.reload.bind(chrome.tabs))

export const historySearch = promisifyChromeMethod<chrome.history.HistoryItem[]>(
	chrome.history.search.bind(chrome.history)
)

export const tabsRemove = promisifyChromeMethod(chrome.tabs.remove.bind(chrome.tabs))
export const getPlatformInfo = promisifyChromeMethod<chrome.runtime.PlatformInfo>(
	chrome.runtime.getPlatformInfo.bind(chrome.runtime)
)

export const getDisplayInfo = promisifyChromeMethod<chrome.system.display.DisplayInfo[]>(
	chrome.system.display.getInfo.bind(chrome.system.display)
)
export const actionSetTitle = promisifyChromeMethod(chrome.action.setTitle.bind(chrome.action))
export const getCurrentWindow = promisifyChromeMethod<chrome.windows.Window>(
	chrome.windows.getCurrent.bind(chrome.windows)
)

export const getWindowById = promisifyChromeMethod<chrome.windows.Window>(chrome.windows.get.bind(chrome.windows))

export const storageGet = promisifyChromeMethod<{ [key: string]: any }>(
	chrome.storage.session.get.bind(chrome.storage.session)
)
export const storageSet = promisifyChromeMethod(chrome.storage.session.set.bind(chrome.storage.session))

export const storageRemove = promisifyChromeMethod(chrome.storage.session.remove.bind(chrome.storage.session))

export const getBookmarksTree = promisifyChromeMethod<chrome.bookmarks.BookmarkTreeNode[]>(
	chrome.bookmarks.getTree.bind(chrome.bookmarks)
)

export const getBookmarksById = promisifyChromeMethod<chrome.bookmarks.BookmarkTreeNode[]>(
	chrome.bookmarks.get.bind(chrome.bookmarks.get)
)

export const getTabGroupById = chrome.tabGroups?.get
	? promisifyChromeMethod<chrome.tabGroups.TabGroup>(chrome.tabGroups.get.bind(chrome.tabGroups))
	: () => Promise.resolve(undefined)

function promisifyChromeMethod<T = any>(method: (...args: any[]) => void) {
	return (...args: any[]) =>
		new Promise<T>((resolve, reject) => {
			method(...args, (result) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError)))
				} else {
					resolve(result)
				}
			})
		})
}
