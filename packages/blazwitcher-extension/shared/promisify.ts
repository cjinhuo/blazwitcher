/* global chrome */

const hasStoredValue = (storage: Record<string, unknown>, key: string) => Object.hasOwn(storage, key)

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

export const storageGetLocal = promisifyChromeMethod<{ [key: string]: any }>(
	chrome.storage.local.get.bind(chrome.storage.local)
)

export const storageSetLocal = promisifyChromeMethod(chrome.storage.local.set.bind(chrome.storage.local))

/** Chrome Storage Sync API：随 Chrome 账号跨设备自动同步，用于 Setting Panel 配置 */
export const storageGetSync = promisifyChromeMethod<{ [key: string]: any }>(
	chrome.storage.sync.get.bind(chrome.storage.sync)
)
export const storageSetSync = promisifyChromeMethod(chrome.storage.sync.set.bind(chrome.storage.sync))
export const storageRemoveSync = promisifyChromeMethod(chrome.storage.sync.remove.bind(chrome.storage.sync))

export async function getSyncValueWithLocalFallback<T>(
	key: string,
	defaultValue: T,
	options?: {
		syncStorage?: Record<string, unknown>
		localStorage?: Record<string, unknown>
	}
): Promise<T> {
	// 读取优先级：sync > local > default。
	// 这样可以保证新版本统一读云端，同时兼容老版本只写 local 的历史数据。
	const syncStorage = options?.syncStorage ?? (await storageGetSync(key))
	if (hasStoredValue(syncStorage, key)) {
		return syncStorage[key] as T
	}

	const localStorage = options?.localStorage ?? (await storageGetLocal(key))
	if (hasStoredValue(localStorage, key)) {
		const legacyValue = localStorage[key] as T
		// 懒迁移：仅在命中 local 旧值时回写 sync，不做全量迁移，避免启动阶段额外开销。
		await storageSetSync({ [key]: legacyValue })
		return legacyValue
	}

	// 两端都不存在时使用调用方默认值，保持函数幂等且无副作用。
	return defaultValue
}

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
