import { LAST_ACTIVE_WINDOW_ID_KEY, SELF_WINDOW_ID_KEY, SELF_WINDOW_STATE } from './constants'
import { storageGet, storageRemove } from './promisify'
import { ItemType, type ListItemType, type Matrix } from './types'

export function isChineseChar(char) {
	const chineseCharRegex = /[\u4E00-\u9FFF]/
	return chineseCharRegex.test(char)
}

export function isTabItem(item: ListItemType): item is ListItemType<ItemType.Tab> {
	return item.itemType === ItemType.Tab
}

export function isBookmarkItem(item: ListItemType): item is ListItemType<ItemType.Bookmark> {
	return item.itemType === ItemType.Bookmark
}

export function isHistoryItem(item: ListItemType): item is ListItemType<ItemType.History> {
	return item.itemType === ItemType.History
}

// todo 需要做一个每次首次都不需要等待的节流函数
export function throttle(delay: number) {
	let timer = undefined
	return function (fn: (args: any) => void, ...args) {
		if (timer) return
		if (timer === undefined) {
			fn.apply(this, args)
			timer = null
		}
		timer = setTimeout(() => {
			fn.apply(this, args)
			timer = null
		}, delay)
	}
}

export const closeCurrentWindowAndClearStorage = async () => {
	const storage = await storageGet()
	const selfWindowId = storage[SELF_WINDOW_ID_KEY]
	const selfWindowState = storage[SELF_WINDOW_STATE]
	await storageRemove(LAST_ACTIVE_WINDOW_ID_KEY)
	if (selfWindowId) {
		// repair the problem that switching in full-screen state cannot switch to the correct window
		selfWindowState === 'fullscreen' && (await sleep(100))
		await storageRemove(SELF_WINDOW_ID_KEY)
		try {
			// the target window may not exist, then throw an error
			await chrome.windows.remove(selfWindowId)
		} catch (error) {}
	}
}

export const activeTab = async (item: ListItemType<ItemType.Tab>) => {
	await chrome.windows.update(item.data.windowId, { focused: true })
	await chrome.tabs.update(item.data.id, { active: true })
	closeCurrentWindowAndClearStorage()
}

export const createTabWithUrl = async (url: string) => {
	const storage = await storageGet()
	const lastActiveWindowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
	// need to focus the last active window to fix the bug of switching abort in arc browser
	await chrome.windows.update(lastActiveWindowId, { focused: true })
	await chrome.tabs.create({ url, windowId: lastActiveWindowId })
	closeCurrentWindowAndClearStorage()
}

export const handleClickItem = async (item: ListItemType) => {
	isTabItem(item) ? await activeTab(item) : await createTabWithUrl(item.data.url)
}

export const closeTab = async (item: ListItemType<ItemType.Tab>) => {
	await chrome.tabs.remove(item.data.id)
}

export const deleteItem = async (item: ListItemType) => {
	if (isHistoryItem(item)) {
		return await chrome.history.deleteUrl({ url: item.data.url })
	}
}

export const queryInNewTab = async (item: ListItemType) => {
	const q = item.data.url || item.data.title
	let url = ''
	if (isBookmarkItem(item)) {
		url = `chrome://bookmarks/?q=${q}`
	} else if (isHistoryItem(item)) {
		url = `chrome://history/?q=${q}`
	}
	await createTabWithUrl(url)
}

export function faviconURL(u: string) {
	const url = new URL(chrome.runtime.getURL('/_favicon/'))
	url.searchParams.set('pageUrl', u)
	url.searchParams.set('size', '24')
	return url.toString()
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isDarkMode() {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}
