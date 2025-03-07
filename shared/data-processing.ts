import { DEFAULT_HISTORY_MAX_DAYS, DEFAULT_HISTORY_MAX_RESULTS, ONE_DAY_MILLISECONDS } from './constants'
import { getBookmarksById, getBookmarksTree, getTabGroupById, historySearch, tabsQuery } from './promisify'
import { type BookmarkItemType, type HistoryItemType, ItemType } from './types'
import { faviconURL, getCompositeSourceAndHost } from './utils'

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
	const data: HistoryItemType[] = []
	for (let day = 1; day < maxDays; day++) {
		const rawData = await historySearch({
			startTime: Date.now() - day * ONE_DAY_MILLISECONDS,
			endTime: Date.now() - (day - 1) * ONE_DAY_MILLISECONDS,
			maxResults: count - data.length,
			text: '',
		})
		data.push(...rawData.map((item) => processHistoryItem(item)))
		if (data.length >= count) return data
	}
	return data
}

export async function historyProcessing() {
	const processedHistory = await retrieveRecentHistories()
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
