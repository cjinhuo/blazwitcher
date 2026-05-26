import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('text-search-engine', () => ({
	extractBoundaryMapping: vi.fn((source: string) => ({
		pinyinString: source,
		boundary: [],
		originalIndices: [],
		originalString: source,
		originalLength: source.length,
	})),
}))

vi.mock('~shared/promisify', () => ({
	tabsQuery: vi.fn().mockResolvedValue([]),
	getBookmarksTree: vi.fn().mockResolvedValue([]),
	getBookmarksById: vi.fn().mockResolvedValue([]),
	getTabGroupById: vi.fn().mockResolvedValue(null),
	historySearch: vi.fn().mockResolvedValue([]),
	storageGetSync: vi.fn().mockResolvedValue({}),
	storageGetLocal: vi.fn().mockResolvedValue({}),
	storageSetSync: vi.fn().mockResolvedValue(undefined),
	getSyncValueWithLocalFallback: vi.fn(),
}))

import {
	bookmarksProcessing,
	bookmarksProcessingOnce,
	chunkArray,
	filterValidTabs,
	getExtensionStorageSearchConfig,
	getWindowConfig,
	historyProcessing,
	tabsProcessing,
	traversalBookmarkTreeNode,
} from '~shared/data-processing'
import {
	getBookmarksTree,
	getSyncValueWithLocalFallback,
	getTabGroupById,
	historySearch,
	tabsQuery,
} from '~shared/promisify'

describe('chunkArray', () => {
	it('should return [arr] when size <= 0', () => {
		const arr = [1, 2, 3]
		expect(chunkArray(arr, 0)).toEqual([[1, 2, 3]])
		expect(chunkArray(arr, -1)).toEqual([[1, 2, 3]])
	})

	it('should return [] when arr is empty', () => {
		expect(chunkArray([], 3)).toEqual([])
	})

	it('should chunk array into correct sizes', () => {
		expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
	})

	it('should return single chunk when size >= arr.length', () => {
		expect(chunkArray([1, 2, 3], 5)).toEqual([[1, 2, 3]])
		expect(chunkArray([1, 2, 3], 3)).toEqual([[1, 2, 3]])
	})
})

describe('filterValidTabs', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should filter out tabs starting with chrome://', () => {
		const tabs = [
			{ url: 'chrome://settings', title: 'Settings', id: 1 },
			{ url: 'https://example.com', title: 'Example', id: 2 },
		] as chrome.tabs.Tab[]
		const result = filterValidTabs(tabs)
		expect(result).toHaveLength(1)
		expect(result[0].url).toBe('https://example.com')
	})

	it('should filter out tabs containing runtime id', () => {
		const tabs = [
			{ url: 'chrome-extension://test-extension-id/sidepanel.html', title: 'Self', id: 1 },
			{ url: 'https://example.com', title: 'Example', id: 2 },
		] as chrome.tabs.Tab[]
		const result = filterValidTabs(tabs)
		expect(result).toHaveLength(1)
		expect(result[0].url).toBe('https://example.com')
	})

	it('should filter out tabs without url or title', () => {
		const tabs = [
			{ url: '', title: 'No URL', id: 1 },
			{ url: 'https://example.com', title: '', id: 2 },
			{ url: 'https://valid.com', title: 'Valid', id: 3 },
		] as chrome.tabs.Tab[]
		const result = filterValidTabs(tabs)
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe(3)
	})

	it('should keep all valid tabs', () => {
		const tabs = [
			{ url: 'https://a.com', title: 'A', id: 1 },
			{ url: 'https://b.com', title: 'B', id: 2 },
		] as chrome.tabs.Tab[]
		const result = filterValidTabs(tabs)
		expect(result).toHaveLength(2)
	})
})

describe('traversalBookmarkTreeNode', () => {
	it('should return empty array for empty input', () => {
		expect(traversalBookmarkTreeNode([])).toEqual([])
	})

	it('should extract leaf nodes with url', () => {
		const bookmarks = [{ id: '1', title: 'Bookmark 1', url: 'https://a.com' }] as chrome.bookmarks.BookmarkTreeNode[]
		const result = traversalBookmarkTreeNode(bookmarks)
		expect(result).toHaveLength(1)
		expect(result[0].url).toBe('https://a.com')
	})

	it('should skip folder nodes without url', () => {
		const bookmarks = [{ id: '1', title: 'Folder', children: [] }] as chrome.bookmarks.BookmarkTreeNode[]
		const result = traversalBookmarkTreeNode(bookmarks)
		expect(result).toHaveLength(0)
	})

	it('should traverse nested folders and concatenate folder names', () => {
		const bookmarks = [
			{
				id: '1',
				title: 'Root Folder',
				children: [
					{
						id: '2',
						title: 'Sub Folder',
						children: [{ id: '3', title: 'Deep Bookmark', url: 'https://deep.com' }],
					},
					{ id: '4', title: 'Direct Bookmark', url: 'https://direct.com' },
				],
			},
		] as chrome.bookmarks.BookmarkTreeNode[]
		const result = traversalBookmarkTreeNode(bookmarks)
		expect(result).toHaveLength(2)

		const deepBookmark = result.find((b) => b.url === 'https://deep.com')
		expect(deepBookmark?.folderName).toBe('Root Folder / Sub Folder')

		const directBookmark = result.find((b) => b.url === 'https://direct.com')
		expect(directBookmark?.folderName).toBe('Root Folder')
	})

	it('should handle parentFolderName parameter', () => {
		const bookmarks = [{ id: '1', title: 'Bookmark', url: 'https://test.com' }] as chrome.bookmarks.BookmarkTreeNode[]
		const result = traversalBookmarkTreeNode(bookmarks, [], 'Parent')
		expect(result[0].folderName).toBe('Parent')
	})
})

describe('getExtensionStorageSearchConfig', () => {
	const mockedGetSyncValue = vi.mocked(getSyncValueWithLocalFallback)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return default values when storage is empty', async () => {
		mockedGetSyncValue.mockResolvedValueOnce(14).mockResolvedValueOnce(1000)
		const result = await getExtensionStorageSearchConfig()
		expect(result).toEqual({ historyMaxDays: 14, historyMaxResults: 1000 })
	})

	it('should return custom values from storage', async () => {
		mockedGetSyncValue.mockResolvedValueOnce(30).mockResolvedValueOnce(500)
		const result = await getExtensionStorageSearchConfig()
		expect(result).toEqual({ historyMaxDays: 30, historyMaxResults: 500 })
	})

	it('should convert string values to numbers', async () => {
		mockedGetSyncValue.mockResolvedValueOnce('7' as any).mockResolvedValueOnce('200' as any)
		const result = await getExtensionStorageSearchConfig()
		expect(result).toEqual({ historyMaxDays: 7, historyMaxResults: 200 })
	})

	it('should call getSyncValueWithLocalFallback with correct keys', async () => {
		mockedGetSyncValue.mockResolvedValue(10)
		await getExtensionStorageSearchConfig()
		expect(mockedGetSyncValue).toHaveBeenCalledTimes(2)
		expect(mockedGetSyncValue).toHaveBeenCalledWith('historyMaxDays', 14, expect.any(Object))
		expect(mockedGetSyncValue).toHaveBeenCalledWith('historyMaxResults', 1000, expect.any(Object))
	})
})

describe('getWindowConfig', () => {
	const mockedGetSyncValue = vi.mocked(getSyncValueWithLocalFallback)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return default config when storage is empty', async () => {
		// displayMode, width, height, theme
		mockedGetSyncValue
			.mockResolvedValueOnce('isolate_window')
			.mockResolvedValueOnce(760)
			.mockResolvedValueOnce(505)
			.mockResolvedValueOnce('system')
		const result = await getWindowConfig()
		expect(result).toEqual({
			displayMode: 'isolate_window',
			width: 760,
			height: 505,
			theme: 'system',
			debugMode: 'off',
		})
	})

	it('should return custom config from storage', async () => {
		mockedGetSyncValue
			.mockResolvedValueOnce('side_panel')
			.mockResolvedValueOnce(800)
			.mockResolvedValueOnce(600)
			.mockResolvedValueOnce('dark')

		const { storageGetLocal: mockStorageGetLocal } = await import('~shared/promisify')
		vi.mocked(mockStorageGetLocal).mockResolvedValueOnce({ debugMode: 'on' })

		const result = await getWindowConfig()
		expect(result.displayMode).toBe('side_panel')
		expect(result.width).toBe(800)
		expect(result.height).toBe(600)
		expect(result.theme).toBe('dark')
	})

	it('should read debugMode from localStorage only', async () => {
		mockedGetSyncValue.mockResolvedValue('default')

		const { storageGetLocal: mockStorageGetLocal } = await import('~shared/promisify')
		vi.mocked(mockStorageGetLocal).mockResolvedValueOnce({ debugMode: 'on' })

		const result = await getWindowConfig()
		expect(result.debugMode).toBe('on')
	})

	it('should call getSyncValueWithLocalFallback with correct keys', async () => {
		mockedGetSyncValue.mockResolvedValue('default')
		await getWindowConfig()
		expect(mockedGetSyncValue).toHaveBeenCalledTimes(4)
		expect(mockedGetSyncValue).toHaveBeenCalledWith('displayMode', expect.anything(), expect.any(Object))
		expect(mockedGetSyncValue).toHaveBeenCalledWith('windowWidth', expect.anything(), expect.any(Object))
		expect(mockedGetSyncValue).toHaveBeenCalledWith('windowHeight', expect.anything(), expect.any(Object))
		expect(mockedGetSyncValue).toHaveBeenCalledWith('theme_color', expect.anything(), expect.any(Object))
	})
})

describe('tabsProcessing', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return empty array when no tabs', async () => {
		vi.mocked(tabsQuery).mockResolvedValue([])
		const result = await tabsProcessing()
		expect(result).toEqual([])
	})

	it('should process valid tabs and return items with itemType Tab', async () => {
		vi.mocked(tabsQuery).mockResolvedValue([
			{ id: 1, url: 'https://example.com', title: 'Example', groupId: -1 },
		] as chrome.tabs.Tab[])
		vi.mocked(getTabGroupById).mockResolvedValue(null)
		const result = await tabsProcessing()
		expect(result).toHaveLength(1)
		expect(result[0].itemType).toBe('tab')
		expect(result[0].data.id).toBe(1)
		expect(result[0].data.url).toBe('https://example.com')
	})

	it('should filter out chrome:// tabs', async () => {
		vi.mocked(tabsQuery).mockResolvedValue([
			{ id: 1, url: 'chrome://settings', title: 'Settings', groupId: -1 },
			{ id: 2, url: 'https://valid.com', title: 'Valid', groupId: -1 },
		] as chrome.tabs.Tab[])
		const result = await tabsProcessing()
		expect(result).toHaveLength(1)
		expect(result[0].data.id).toBe(2)
	})

	it('should include tabGroup info when groupId is not -1', async () => {
		vi.mocked(tabsQuery).mockResolvedValue([
			{ id: 1, url: 'https://test.com', title: 'Test', groupId: 5 },
		] as chrome.tabs.Tab[])
		vi.mocked(getTabGroupById).mockResolvedValue({ id: 5, title: 'Work', color: 'blue' } as any)
		const result = await tabsProcessing()
		expect(result[0].data.tabGroup).toEqual({ id: 5, title: 'Work', color: 'blue' })
	})

	it('should include favIconUrl and host in processed tab', async () => {
		vi.mocked(tabsQuery).mockResolvedValue([
			{ id: 1, url: 'https://www.google.com/search', title: 'Google', groupId: -1 },
		] as chrome.tabs.Tab[])
		const result = await tabsProcessing()
		expect(result[0].data.favIconUrl).toContain('google.com')
		expect(result[0].data.host).toBeDefined()
	})
})

describe('historyProcessing', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return empty array when no history', async () => {
		vi.mocked(getSyncValueWithLocalFallback).mockResolvedValue(14)
		vi.mocked(historySearch).mockResolvedValue([])
		const result = await historyProcessing()
		expect(result).toEqual([])
	})

	it('should process history items and return with itemType History', async () => {
		vi.mocked(getSyncValueWithLocalFallback).mockResolvedValue(14)
		vi.mocked(historySearch).mockResolvedValue([
			{ id: '1', url: 'https://example.com', title: 'Example', lastVisitTime: Date.now() },
		] as chrome.history.HistoryItem[])
		const result = await historyProcessing()
		expect(result).toHaveLength(1)
		expect(result[0].itemType).toBe('history')
		expect(result[0].data.url).toBe('https://example.com')
	})

	it('should filter out chrome-extension:// history items', async () => {
		vi.mocked(getSyncValueWithLocalFallback).mockResolvedValue(14)
		vi.mocked(historySearch).mockResolvedValue([
			{ id: '1', url: 'chrome-extension://abc/page.html', title: 'Ext' },
			{ id: '2', url: 'https://valid.com', title: 'Valid' },
		] as chrome.history.HistoryItem[])
		const result = await historyProcessing()
		expect(result).toHaveLength(1)
		expect(result[0].data.url).toBe('https://valid.com')
	})

	it('should filter out items without url', async () => {
		vi.mocked(getSyncValueWithLocalFallback).mockResolvedValue(14)
		vi.mocked(historySearch).mockResolvedValue([
			{ id: '1', url: '', title: 'No URL' },
			{ id: '2', url: 'https://valid.com', title: 'Valid' },
		] as chrome.history.HistoryItem[])
		const result = await historyProcessing()
		expect(result).toHaveLength(1)
	})

	it('should respect maxResults limit', async () => {
		vi.mocked(getSyncValueWithLocalFallback)
			.mockResolvedValueOnce(14) // historyMaxDays
			.mockResolvedValueOnce(2) // historyMaxResults
		vi.mocked(historySearch).mockResolvedValue([
			{ id: '1', url: 'https://a.com', title: 'A' },
			{ id: '2', url: 'https://b.com', title: 'B' },
			{ id: '3', url: 'https://c.com', title: 'C' },
		] as chrome.history.HistoryItem[])
		const result = await historyProcessing()
		expect(result.length).toBeLessThanOrEqual(2)
	})
})

describe('bookmarksProcessingOnce', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return empty array for empty tree', async () => {
		vi.mocked(getBookmarksTree).mockResolvedValue([])
		const result = await bookmarksProcessingOnce()
		expect(result).toEqual([])
	})

	it('should process bookmarks and return with itemType Bookmark', async () => {
		vi.mocked(getBookmarksTree).mockResolvedValue([
			{ id: '1', title: 'My Bookmark', url: 'https://example.com' },
		] as chrome.bookmarks.BookmarkTreeNode[])
		const result = await bookmarksProcessingOnce()
		expect(result).toHaveLength(1)
		expect(result[0].itemType).toBe('bookmark')
		expect(result[0].data.url).toBe('https://example.com')
	})

	it('should handle nested bookmark tree', async () => {
		vi.mocked(getBookmarksTree).mockResolvedValue([
			{
				id: '1',
				title: 'Root',
				children: [{ id: '2', title: 'Child', url: 'https://child.com' }],
			},
		] as chrome.bookmarks.BookmarkTreeNode[])
		const result = await bookmarksProcessingOnce()
		expect(result).toHaveLength(1)
		expect(result[0].data.url).toBe('https://child.com')
		expect(result[0].data.folderName).toBe('Root')
	})
})

describe('bookmarksProcessing', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return a getter function', () => {
		vi.mocked(getBookmarksTree).mockResolvedValue([])
		const getter = bookmarksProcessing()
		expect(typeof getter).toBe('function')
	})

	it('should return processed bookmarks via getter after tree is loaded', async () => {
		vi.mocked(getBookmarksTree).mockResolvedValue([
			{ id: '1', title: 'BM', url: 'https://bm.com' },
		] as chrome.bookmarks.BookmarkTreeNode[])
		const getter = bookmarksProcessing()
		// Wait for the async getBookmarksTree.then to resolve
		await vi.waitFor(() => {
			const result = getter()
			expect(result.length).toBeGreaterThan(0)
		})
		const result = getter()
		expect(result[0].itemType).toBe('bookmark')
		expect(result[0].data.url).toBe('https://bm.com')
	})
})
