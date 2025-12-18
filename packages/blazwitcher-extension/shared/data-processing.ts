import {
	DEFAULT_HISTORY_MAX_DAYS,
	DEFAULT_HISTORY_MAX_RESULTS,
	DefaultWindowConfig,
	EXTENSION_STORAGE_DEBUG_MODE,
	EXTENSION_STORAGE_DISPLAY_MODE,
	EXTENSION_STORAGE_HISTORY_MAX_DAYS,
	EXTENSION_STORAGE_HISTORY_MAX_RESULTS,
	EXTENSION_STORAGE_THEME,
	EXTENSION_STORAGE_WINDOW_HEIGHT,
	EXTENSION_STORAGE_WINDOW_WIDTH,
	ONE_DAY_MILLISECONDS,
	type WindowConfig,
} from './constants'
import {
	getBookmarksById,
	getBookmarksTree,
	getTabGroupById,
	historySearch,
	storageGetLocal,
	tabsQuery,
} from './promisify'
import { getCompositeSourceAndHost } from './text-search-pinyin'
import { type BookmarkItemType, ItemType } from './types'
import { faviconURL } from './utils'

export async function tabsProcessing() {
	const processedTabs = await tabsQuery({})
	// filter the tabs that start with chrome://
	const filteredTabs = processedTabs.filter((item) => !(item.url.startsWith('chrome://') || !item.url || !item.title))
	return await Promise.all(
		filteredTabs.map(async (tab) => ({ itemType: ItemType.Tab, data: await processTabItem(tab) }))
	)
}

async function processTabItem(tab: chrome.tabs.Tab) {
	return {
		...tab,
		tabGroup: await tabGroupProcessing(tab.groupId),
		...getCompositeSourceAndHost(tab.title, tab.url),
		favIconUrl: faviconURL(tab.url),
	}
}

function tabGroupProcessing(groupId: number) {
	if (groupId === -1) return null
	return getTabGroupById(groupId)
}

export function bookmarksProcessing() {
	let processedBookmarks: BookmarkItemType[] = []
	getBookmarksTree().then((bookmarks) => {
		processedBookmarks = traversalBookmarkTreeNode(bookmarks)
	})

	chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
		const index = processedBookmarks.findIndex((bookmark) => bookmark.id === id)
		// only update when bookmark are changed, not folder
		if (~index && changeInfo.url) {
			processedBookmarks[index].url = changeInfo.url
			processedBookmarks[index] = processedBookmarkItem(processedBookmarks[index])
		}
	})

	chrome.bookmarks.onCreated.addListener(async (_, bookmark) => {
		if (bookmark.url) {
			let folderName = ''
			if (bookmark.parentId) {
				const parentBookmark = await getBookmarksById(bookmark.parentId)
				folderName = parentBookmark[0].title
			}
			processedBookmarks.push(processedBookmarkItem(bookmark, folderName))
		}
	})

	chrome.bookmarks.onRemoved.addListener((id) => {
		const index = processedBookmarks.findIndex((bookmark) => bookmark.id === id)
		index && processedBookmarks.splice(index, 1)
	})

	return () =>
		processedBookmarks.map((bookmark) => ({
			itemType: ItemType.Bookmark,
			data: bookmark,
		}))
}

function processHistoryItem(history: chrome.history.HistoryItem) {
	return {
		...history,
		...getCompositeSourceAndHost(history.title, history.url),
		favIconUrl: faviconURL(history.url),
	}
}

function processedBookmarkItem(bookmark: chrome.bookmarks.BookmarkTreeNode, folderName = '') {
	return {
		...bookmark,
		...getCompositeSourceAndHost(bookmark.title, bookmark.url),
		favIconUrl: faviconURL(bookmark.url),
		folderName,
	}
}

/**
 *
 * @param count the max number of results
 * @param maxDays the max number of days we would retrieve
 * @returns
 */
async function retrieveRecentHistories(count = DEFAULT_HISTORY_MAX_RESULTS, maxDays = DEFAULT_HISTORY_MAX_DAYS) {
	if (count <= 0 || maxDays <= 0) return []
	const endTime = Date.now()
	const startTime = endTime - maxDays * ONE_DAY_MILLISECONDS

	// Query history in a single operation
	const rawData = await historySearch({
		startTime,
		endTime,
		maxResults: count,
		text: '',
	})

	// Process the results
	const historyProcessed = rawData
		// filter the history that is not a valid url or is a chrome-extension url
		.filter((item) => item.url && !item.url.startsWith('chrome-extension:'))
		.map((item) => processHistoryItem(item))

	// Return up to count results
	return historyProcessed.slice(0, count)
}

export async function historyProcessing() {
	// 通过 extension storage 来获取 historyMaxResults 和 historyMaxDays
	const { historyMaxResults, historyMaxDays } = await getExtensionStorageSearchConfig()
	const processedHistory = await retrieveRecentHistories(historyMaxResults, historyMaxDays)
	return processedHistory.map((item) => ({
		itemType: ItemType.History,
		data: item,
	}))
}

export const traversalBookmarkTreeNode = (
	bookmarks: chrome.bookmarks.BookmarkTreeNode[],
	result: BookmarkItemType[] = [],
	parentFolderName?: string
) => {
	for (const bookmark of bookmarks) {
		const { children, ...rest } = bookmark
		if (children) {
			traversalBookmarkTreeNode(children, result, parentFolderName ? `${parentFolderName} / ${rest.title}` : rest.title)
		}
		if (rest.url) {
			// get favicon from chrome://favicon/ + url ,from https://stackoverflow.com/questions/10301636/how-can-i-get-the-bookmark-icon-in-chrome
			result.push(processedBookmarkItem(rest, parentFolderName))
		}
	}
	return result
}

export async function getExtensionStorageSearchConfig() {
	const extensionLocalStorage = await storageGetLocal()

	const {
		[EXTENSION_STORAGE_HISTORY_MAX_DAYS]: historyMaxDays = DEFAULT_HISTORY_MAX_DAYS,
		[EXTENSION_STORAGE_HISTORY_MAX_RESULTS]: historyMaxResults = DEFAULT_HISTORY_MAX_RESULTS,
	} = extensionLocalStorage ?? {}

	return {
		historyMaxDays: Number(historyMaxDays),
		historyMaxResults: Number(historyMaxResults),
	}
}

export async function getWindowConfig(): Promise<WindowConfig> {
	const extensionLocalStorage = await storageGetLocal()

	const {
		[EXTENSION_STORAGE_DISPLAY_MODE]: displayMode = DefaultWindowConfig.displayMode,
		[EXTENSION_STORAGE_WINDOW_WIDTH]: width = DefaultWindowConfig.width,
		[EXTENSION_STORAGE_WINDOW_HEIGHT]: height = DefaultWindowConfig.height,
		[EXTENSION_STORAGE_THEME]: theme = DefaultWindowConfig.theme,
		[EXTENSION_STORAGE_DEBUG_MODE]: debugMode = DefaultWindowConfig.debugMode,
	} = extensionLocalStorage ?? {}

	return { displayMode, width, height, theme, debugMode }
}

export function dataProcessing() {
	// Just don't effect the main thread
	// Since the bookmarks may be too large, we should use async callback to get.
	const getBookmarks = bookmarksProcessing()
	return async () => {
		// because the tabs data not really too large, so we can use sync calculation.
		// And it would be changed very frequently so listening the update of it is not a good idea.
		const bookmarks = getBookmarks()
		const tabs = await tabsProcessing()
		const history = await historyProcessing()
		// prioritize tabs over history、history over bookmarks
		return [...tabs, ...history, ...bookmarks]
	}
}
