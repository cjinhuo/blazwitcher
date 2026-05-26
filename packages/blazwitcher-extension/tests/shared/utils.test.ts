import {
	isConsecutiveForChar as mockIsConsecutive,
	isStrictnessSatisfied as mockIsStrictness,
	mergeSpacesWithRanges as mockMergeSpaces,
	searchSentenceByBoundaryMapping as mockSearchSentence,
} from 'text-search-engine'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('text-search-engine', () => ({
	extractBoundaryMapping: vi.fn((s) => ({
		pinyinString: s,
		boundary: [],
		originalIndices: [],
		originalString: s,
		originalLength: s.length,
	})),
	searchSentenceByBoundaryMapping: vi.fn(),
	isConsecutiveForChar: vi.fn(),
	mergeSpacesWithRanges: vi.fn(),
	isStrictnessSatisfied: vi.fn(),
}))

vi.mock('~shared/promisify', () => ({
	storageGet: vi.fn().mockResolvedValue({}),
	storageRemove: vi.fn().mockResolvedValue(undefined),
}))

import { storageGet, storageRemove } from '~shared/promisify'
import { ItemType, type ListItemType, type Matrix } from '~shared/types'
import {
	closeCurrentWindowAndClearStorage,
	closeTab,
	compareForHitRangeLength,
	deleteItem,
	getActiveTabInUserWindow,
	getExecuteActionShortcuts,
	handleItemClick,
	isBookmarkItem,
	isDarkMode,
	isDivideItem,
	isHistoryItem,
	isLikelyUrl,
	isPluginItem,
	isSearchActionItem,
	isSystemDarkMode,
	isTabItem,
	navigateCurrentTab,
	orderList,
	queryInNewTab,
	safeSendMessage,
	scrollIntoViewIfNeeded,
	searchWithList,
	sleep,
	splitCompositeHitRanges,
	splitToGroup,
	throttle,
	toNavigableUrl,
} from '~shared/utils'

const makeItem = (itemType: ItemType, data: any = {}): ListItemType => ({
	itemType,
	data: { title: '', url: '', host: '', compositeSource: '', ...data },
})

describe('type guard functions', () => {
	it('isTabItem returns true for tab items', () => {
		expect(isTabItem(makeItem(ItemType.Tab))).toBe(true)
		expect(isTabItem(makeItem(ItemType.Bookmark))).toBe(false)
	})

	it('isBookmarkItem returns true for bookmark items', () => {
		expect(isBookmarkItem(makeItem(ItemType.Bookmark))).toBe(true)
		expect(isBookmarkItem(makeItem(ItemType.Tab))).toBe(false)
	})

	it('isHistoryItem returns true for history items', () => {
		expect(isHistoryItem(makeItem(ItemType.History))).toBe(true)
		expect(isHistoryItem(makeItem(ItemType.Divide))).toBe(false)
	})

	it('isDivideItem returns true for divide items', () => {
		expect(isDivideItem(makeItem(ItemType.Divide))).toBe(true)
		expect(isDivideItem(makeItem(ItemType.Tab))).toBe(false)
	})

	it('isPluginItem returns true for plugin items', () => {
		expect(isPluginItem(makeItem(ItemType.Plugin))).toBe(true)
		expect(isPluginItem(makeItem(ItemType.History))).toBe(false)
	})

	it('isSearchActionItem returns true for searchAction items', () => {
		expect(isSearchActionItem(makeItem(ItemType.SearchAction))).toBe(true)
		expect(isSearchActionItem(makeItem(ItemType.Tab))).toBe(false)
	})
})

describe('isLikelyUrl', () => {
	it('returns false for empty string', () => {
		expect(isLikelyUrl('')).toBe(false)
		expect(isLikelyUrl('   ')).toBe(false)
	})

	it('returns false for string with spaces', () => {
		expect(isLikelyUrl('hello world')).toBe(false)
		expect(isLikelyUrl('some query string')).toBe(false)
	})

	it('returns false for string with angle brackets', () => {
		expect(isLikelyUrl('<script>')).toBe(false)
		expect(isLikelyUrl('test>value')).toBe(false)
	})

	it('returns false for mailto: prefix', () => {
		expect(isLikelyUrl('mailto:test@example.com')).toBe(false)
	})

	it('returns true for valid http URL', () => {
		expect(isLikelyUrl('http://example.com')).toBe(true)
	})

	it('returns true for valid https URL', () => {
		expect(isLikelyUrl('https://example.com')).toBe(true)
	})

	it('returns true for ftp URL', () => {
		expect(isLikelyUrl('ftp://files.example.com')).toBe(true)
	})

	it('returns false for unsupported protocol', () => {
		expect(isLikelyUrl('file:///tmp/test')).toBe(false)
		expect(isLikelyUrl('chrome://settings')).toBe(false)
	})

	it('returns true for localhost', () => {
		expect(isLikelyUrl('localhost')).toBe(true)
		expect(isLikelyUrl('localhost:3000')).toBe(true)
	})

	it('returns true for valid IP address', () => {
		expect(isLikelyUrl('192.168.1.1')).toBe(true)
		expect(isLikelyUrl('http://10.0.0.1:8080')).toBe(true)
	})

	it('returns false for invalid IP address', () => {
		expect(isLikelyUrl('999.999.999.999')).toBe(false)
		expect(isLikelyUrl('256.1.1.1')).toBe(false)
	})

	it('returns true for IP with leading zeros (URL normalizes them)', () => {
		// URL API normalizes 192.168.01.1 -> 192.168.1.1
		expect(isLikelyUrl('192.168.01.1')).toBe(true)
	})

	it('returns false for domain without dot', () => {
		expect(isLikelyUrl('example')).toBe(false)
	})

	it('returns true for partial IP notation (URL normalizes them)', () => {
		// URL API normalizes 192.168.1 -> 192.168.0.1
		expect(isLikelyUrl('192.168.1')).toBe(true)
	})

	it('returns false for domain with numeric-only TLD', () => {
		// Not a valid IP and TLD is all digits
		expect(isLikelyUrl('foo.123')).toBe(false)
	})

	it('returns true for valid domain', () => {
		expect(isLikelyUrl('example.com')).toBe(true)
		expect(isLikelyUrl('sub.example.org')).toBe(true)
		expect(isLikelyUrl('my-site.co.uk')).toBe(true)
	})

	it('returns true for valid port', () => {
		expect(isLikelyUrl('example.com:8080')).toBe(true)
		expect(isLikelyUrl('example.com:1')).toBe(true)
		expect(isLikelyUrl('example.com:65535')).toBe(true)
	})

	it('returns false for invalid port', () => {
		expect(isLikelyUrl('example.com:99999')).toBe(false)
		expect(isLikelyUrl('example.com:0')).toBe(false)
	})

	it('returns true for IPv6 address', () => {
		expect(isLikelyUrl('http://[::1]')).toBe(true)
		expect(isLikelyUrl('http://[2001:db8::1]')).toBe(true)
	})

	it('returns true for URL with path and query', () => {
		expect(isLikelyUrl('https://example.com/path?q=test&page=1')).toBe(true)
		expect(isLikelyUrl('example.com/path/to/resource')).toBe(true)
	})

	it('returns true for international TLD', () => {
		expect(isLikelyUrl('example.中国')).toBe(true)
	})

	it('returns false for domain with invalid label', () => {
		expect(isLikelyUrl('-invalid.com')).toBe(false)
		expect(isLikelyUrl('invalid-.com')).toBe(false)
	})
})

describe('toNavigableUrl', () => {
	it('returns empty string for empty input', () => {
		expect(toNavigableUrl('')).toBe('')
		expect(toNavigableUrl('   ')).toBe('')
	})

	it('returns as-is when explicit protocol exists', () => {
		expect(toNavigableUrl('https://example.com')).toBe('https://example.com')
		expect(toNavigableUrl('http://example.com')).toBe('http://example.com')
		expect(toNavigableUrl('ftp://files.example.com')).toBe('ftp://files.example.com')
	})

	it('prepends https:// when no protocol', () => {
		expect(toNavigableUrl('example.com')).toBe('https://example.com')
		expect(toNavigableUrl('localhost:3000')).toBe('https://localhost:3000')
	})

	it('trims whitespace before processing', () => {
		expect(toNavigableUrl('  example.com  ')).toBe('https://example.com')
	})
})

describe('splitCompositeHitRanges', () => {
	it('returns [compositeHitRanges] when hitRanges is empty', () => {
		const emptyRanges: Matrix = []
		const result = splitCompositeHitRanges(emptyRanges, [5, 10])
		expect(result).toEqual([emptyRanges])
	})

	it('splits single range within first source', () => {
		const hitRanges: Matrix = [[0, 2]]
		const sourceLengths = [5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		expect(result[0]).toEqual([[0, 2]])
	})

	it('splits range spanning two sources', () => {
		const hitRanges: Matrix = [[2, 7]]
		const sourceLengths = [5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		// First source gets [2, 4], second source gets [0, 2]
		expect(result[0]).toEqual([[2, 4]])
		expect(result[1]).toEqual([[0, 2]])
	})

	it('handles multiple ranges across sources', () => {
		const hitRanges: Matrix = [
			[0, 2],
			[6, 8],
		]
		const sourceLengths = [5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		expect(result[0]).toEqual([[0, 2]])
		expect(result[1]).toEqual([[1, 3]])
	})

	it('handles range ending exactly at source boundary', () => {
		const hitRanges: Matrix = [[0, 4]]
		const sourceLengths = [5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		expect(result[0]).toEqual([[0, 4]])
	})

	it('returns undefined for sources without hits', () => {
		const hitRanges: Matrix = [[6, 8]]
		const sourceLengths = [5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		expect(result[0]).toBeUndefined()
		expect(result[1]).toEqual([[1, 3]])
	})

	it('handles three sources', () => {
		const hitRanges: Matrix = [[0, 2]]
		const sourceLengths = [5, 5, 5]
		const result = splitCompositeHitRanges(hitRanges, sourceLengths)
		expect(result[0]).toEqual([[0, 2]])
		expect(result[1]).toBeUndefined()
		expect(result[2]).toBeUndefined()
	})
})

describe('compareForHitRangeLength', () => {
	it('returns 0 when both items have no compositeHitRanges', () => {
		const a = makeItem(ItemType.Tab, {})
		const b = makeItem(ItemType.Tab, {})
		expect(compareForHitRangeLength(a, b)).toBe(0)
	})

	it('returns 0 when one item has no compositeHitRanges', () => {
		const a = makeItem(ItemType.Tab, { compositeHitRanges: [[0, 2]] })
		const b = makeItem(ItemType.Tab, {})
		expect(compareForHitRangeLength(a, b)).toBe(0)
	})

	it('compares by hit range length when both have compositeHitRanges', () => {
		const a = makeItem(ItemType.Tab, {
			compositeHitRanges: [
				[0, 2],
				[3, 5],
			],
		})
		const b = makeItem(ItemType.Tab, { compositeHitRanges: [[0, 3]] })
		expect(compareForHitRangeLength(a, b)).toBe(1) // 2 - 1
	})

	it('returns negative when a has fewer ranges than b', () => {
		const a = makeItem(ItemType.Tab, { compositeHitRanges: [[0, 2]] })
		const b = makeItem(ItemType.Tab, {
			compositeHitRanges: [
				[0, 2],
				[3, 5],
				[6, 8],
			],
		})
		expect(compareForHitRangeLength(a, b)).toBe(-2) // 1 - 3
	})
})

describe('splitToGroup', () => {
	it('returns empty groups for empty list', () => {
		const result = splitToGroup([])
		expect(result).toEqual({ tabs: [], bookmarks: [], histories: [] })
	})

	it('splits items into correct groups', () => {
		const list = [
			makeItem(ItemType.Tab, { id: 1 }),
			makeItem(ItemType.Bookmark, { id: 'b1' }),
			makeItem(ItemType.History, { id: 'h1' }),
			makeItem(ItemType.Tab, { id: 2 }),
			makeItem(ItemType.Bookmark, { id: 'b2' }),
		]
		const result = splitToGroup(list)
		expect(result.tabs).toHaveLength(2)
		expect(result.bookmarks).toHaveLength(2)
		expect(result.histories).toHaveLength(1)
	})

	it('ignores divide and plugin items', () => {
		const list = [
			makeItem(ItemType.Tab, { id: 1 }),
			makeItem(ItemType.Divide),
			makeItem(ItemType.Plugin),
			makeItem(ItemType.SearchAction),
		]
		const result = splitToGroup(list)
		expect(result.tabs).toHaveLength(1)
		expect(result.bookmarks).toHaveLength(0)
		expect(result.histories).toHaveLength(0)
	})
})

describe('throttle', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('executes immediately on first call', () => {
		const fn = vi.fn()
		const throttled = throttle(100)
		throttled(fn, 'arg1')
		expect(fn).toHaveBeenCalledTimes(1)
		expect(fn).toHaveBeenCalledWith('arg1')
	})

	it('throttles subsequent calls', () => {
		const fn = vi.fn()
		const throttled = throttle(100)
		throttled(fn)
		throttled(fn) // should be ignored (timer is set)
		throttled(fn) // should be ignored (timer still set)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('executes again after delay', () => {
		const fn = vi.fn()
		const throttled = throttle(100)
		throttled(fn)
		expect(fn).toHaveBeenCalledTimes(1)

		vi.advanceTimersByTime(100)
		// The setTimeout callback fires fn again
		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('allows new call after timer expires', () => {
		const fn = vi.fn()
		const throttled = throttle(100)
		throttled(fn)
		expect(fn).toHaveBeenCalledTimes(1)

		vi.advanceTimersByTime(100)
		expect(fn).toHaveBeenCalledTimes(2)

		// After timer resets to null, next call should schedule again
		throttled(fn)
		vi.advanceTimersByTime(100)
		expect(fn).toHaveBeenCalledTimes(3)
	})
})

describe('isDarkMode', () => {
	it('returns true when theme is Dark', () => {
		expect(isDarkMode('dark' as any)).toBe(true)
	})

	it('returns false when theme is Light', () => {
		expect(isDarkMode('light' as any)).toBe(false)
	})

	it('returns true when theme is System and system is dark', () => {
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockReturnValue({ matches: true }),
		})
		expect(isDarkMode('system' as any)).toBe(true)
	})

	it('returns false when theme is System and system is light', () => {
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockReturnValue({ matches: false }),
		})
		// Also need to ensure no URL param
		Object.defineProperty(window, 'location', {
			writable: true,
			value: { search: '' },
		})
		expect(isDarkMode('system' as any)).toBe(false)
	})

	it('returns true when theme is System and URL has dark param', () => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: { search: '?is_system_dark=1' },
		})
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockReturnValue({ matches: false }),
		})
		expect(isDarkMode('system' as any)).toBe(true)
	})
})

describe('sleep', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('resolves after specified milliseconds', async () => {
		const promise = sleep(500)
		let resolved = false
		promise.then(() => {
			resolved = true
		})

		vi.advanceTimersByTime(499)
		await Promise.resolve()
		expect(resolved).toBe(false)

		vi.advanceTimersByTime(1)
		await Promise.resolve()
		expect(resolved).toBe(true)
	})

	it('resolves immediately for 0ms', async () => {
		const promise = sleep(0)
		let resolved = false
		promise.then(() => {
			resolved = true
		})

		vi.advanceTimersByTime(0)
		await Promise.resolve()
		expect(resolved).toBe(true)
	})
})

describe('orderList', () => {
	const searchConfig = {
		bookmarkDisplayCount: 10,
		historyDisplayCount: 10,
		topSuggestionsCount: 2,
		enableConsecutiveSearch: false,
		searchEngines: [],
		defaultSearchEngineId: 'google',
	}

	const makeTabItem = (id: number, opts: any = {}): ListItemType<ItemType.Tab> => ({
		itemType: ItemType.Tab,
		data: {
			id,
			windowId: 1,
			title: `Tab ${id}`,
			url: `https://tab${id}.com`,
			host: `tab${id}.com`,
			compositeSource: `tab ${id}tab${id}.com`,
			compositeBoundaryMapping: {
				pinyinString: '',
				boundary: [],
				originalIndices: [],
				originalString: '',
				originalLength: 0,
			},
			active: false,
			lastAccessed: Date.now(),
			...opts,
		},
	})

	const makeBookmarkItem = (id: string, url: string): ListItemType<ItemType.Bookmark> => ({
		itemType: ItemType.Bookmark,
		data: {
			id,
			title: `Bookmark ${id}`,
			url,
			host: new URL(url).host,
			compositeSource: `bookmark ${id}${new URL(url).host}`,
			compositeBoundaryMapping: {
				pinyinString: '',
				boundary: [],
				originalIndices: [],
				originalString: '',
				originalLength: 0,
			},
			folderName: '',
			favIconUrl: '',
		},
	})

	const makeHistoryItem = (id: string, url: string): ListItemType<ItemType.History> => ({
		itemType: ItemType.History,
		data: {
			id,
			title: `History ${id}`,
			url,
			host: new URL(url).host,
			compositeSource: `history ${id}${new URL(url).host}`,
			compositeBoundaryMapping: {
				pinyinString: '',
				boundary: [],
				originalIndices: [],
				originalString: '',
				originalLength: 0,
			},
			favIconUrl: '',
			lastVisitTime: Date.now(),
		},
	})

	it('returns empty array for empty list', () => {
		expect(orderList([], searchConfig)).toEqual([])
	})

	it('filters out self-extension tabs', () => {
		const list = [makeTabItem(1, { url: `chrome-extension://test-extension-id/sidepanel.html` })]
		const result = orderList(list, searchConfig)
		expect(result).toHaveLength(0)
	})

	it('sorts tabs with active tab first', () => {
		const list = [
			makeTabItem(1, { active: false, lastAccessed: 100 }),
			makeTabItem(2, { active: true, lastAccessed: 50 }),
		]
		const result = orderList(list, searchConfig)
		expect(result[0].data.id).toBe(2)
	})

	it('deduplicates bookmarks that share title/url with tabs', () => {
		const list = [
			makeTabItem(1, { title: 'Shared', url: 'https://shared.com' }),
			makeBookmarkItem('b1', 'https://shared.com'),
		]
		const result = orderList(list, searchConfig)
		// Only the tab should be in result, bookmark deduped
		const bookmarks = result.filter((item) => item.itemType === ItemType.Bookmark)
		expect(bookmarks).toHaveLength(0)
	})

	it('deduplicates histories that share title/url with tabs', () => {
		const list = [
			makeTabItem(1, { title: 'Shared', url: 'https://shared.com' }),
			makeHistoryItem('h1', 'https://shared.com'),
		]
		const result = orderList(list, searchConfig)
		const histories = result.filter((item) => item.itemType === ItemType.History)
		expect(histories).toHaveLength(0)
	})

	it('respects historyDisplayCount limit', () => {
		const config = { ...searchConfig, historyDisplayCount: 2 }
		const list = [
			makeHistoryItem('h1', 'https://a.com'),
			makeHistoryItem('h2', 'https://b.com'),
			makeHistoryItem('h3', 'https://c.com'),
		]
		const result = orderList(list, config)
		const histories = result.filter((item) => item.itemType === ItemType.History)
		expect(histories).toHaveLength(2)
	})

	it('respects bookmarkDisplayCount limit', () => {
		const config = { ...searchConfig, bookmarkDisplayCount: 1 }
		const list = [makeBookmarkItem('b1', 'https://a.com'), makeBookmarkItem('b2', 'https://b.com')]
		const result = orderList(list, config)
		expect(result).toHaveLength(1)
	})
})

describe('searchWithList', () => {
	const searchConfig = {
		bookmarkDisplayCount: 10,
		historyDisplayCount: 10,
		topSuggestionsCount: 2,
		enableConsecutiveSearch: false,
		searchEngines: [],
		defaultSearchEngineId: 'google',
	}

	const makeSearchableItem = (itemType: ItemType, title: string, host: string): ListItemType => ({
		itemType,
		data: {
			title,
			url: `https://${host}`,
			host,
			compositeSource: `${title}${host}`,
			compositeBoundaryMapping: {
				pinyinString: `${title}${host}`,
				boundary: [],
				originalIndices: [],
				originalString: `${title}${host}`,
				originalLength: title.length + host.length,
			},
		},
	})

	beforeEach(() => {
		vi.mocked(mockSearchSentence).mockReset()
		vi.mocked(mockMergeSpaces).mockReset()
		vi.mocked(mockIsStrictness).mockReset()
		vi.mocked(mockIsConsecutive).mockReset()
	})

	it('returns full list when search value is empty', () => {
		const list = [makeSearchableItem(ItemType.Tab, 'Test', 'test.com')]
		expect(searchWithList(list, '', searchConfig)).toEqual(list)
	})

	it('filters items based on search sentence results', () => {
		const list = [
			makeSearchableItem(ItemType.Tab, 'Hello', 'hello.com'),
			makeSearchableItem(ItemType.Tab, 'World', 'world.com'),
		]

		vi.mocked(mockSearchSentence)
			.mockReturnValueOnce({ hitRanges: [[0, 4]], wordHitRangesMapping: [] })
			.mockReturnValueOnce({ hitRanges: null, wordHitRangesMapping: [] })

		vi.mocked(mockMergeSpaces).mockReturnValue([[0, 4]])
		vi.mocked(mockIsStrictness).mockReturnValue(true)

		const result = searchWithList(list, 'hello', searchConfig)
		expect(result).toHaveLength(1)
		expect(result[0].data.title).toBe('Hello')
	})

	it('respects enableConsecutiveSearch config', () => {
		const list = [makeSearchableItem(ItemType.Tab, 'Hello', 'hello.com')]
		const configWithConsecutive = { ...searchConfig, enableConsecutiveSearch: true }

		vi.mocked(mockSearchSentence).mockReturnValue({ hitRanges: [[0, 4]], wordHitRangesMapping: [] })
		vi.mocked(mockIsConsecutive).mockReturnValue(false)
		vi.mocked(mockMergeSpaces).mockReturnValue([[0, 4]])
		vi.mocked(mockIsStrictness).mockReturnValue(true)

		const result = searchWithList(list, 'hello', configWithConsecutive)
		expect(result).toHaveLength(0)
	})

	it('filters by strictness', () => {
		const list = [makeSearchableItem(ItemType.Tab, 'Hello', 'hello.com')]

		vi.mocked(mockSearchSentence).mockReturnValue({ hitRanges: [[0, 1]], wordHitRangesMapping: [] })
		vi.mocked(mockMergeSpaces).mockReturnValue([[0, 1]])
		vi.mocked(mockIsStrictness).mockReturnValue(false)

		const result = searchWithList(list, 'hello', searchConfig)
		expect(result).toHaveLength(0)
	})
})

describe('scrollIntoViewIfNeeded', () => {
	it('should scroll up when element is above container', () => {
		const container = { getBoundingClientRect: () => ({ top: 100, bottom: 500 }), scrollTop: 200 } as any
		const element = { getBoundingClientRect: () => ({ top: 50, bottom: 80 }) } as any
		scrollIntoViewIfNeeded(element, container)
		expect(container.scrollTop).toBe(150) // 200 - (100-50)
	})

	it('should scroll down when element is below container', () => {
		const container = { getBoundingClientRect: () => ({ top: 100, bottom: 500 }), scrollTop: 0 } as any
		const element = { getBoundingClientRect: () => ({ top: 480, bottom: 520 }) } as any
		scrollIntoViewIfNeeded(element, container)
		expect(container.scrollTop).toBe(24) // 0 + (520 - 500) + 4
	})

	it('should not scroll when element is within view', () => {
		const container = { getBoundingClientRect: () => ({ top: 100, bottom: 500 }), scrollTop: 0 } as any
		const element = { getBoundingClientRect: () => ({ top: 200, bottom: 300 }) } as any
		scrollIntoViewIfNeeded(element, container)
		expect(container.scrollTop).toBe(0)
	})

	it('should account for divideElement', () => {
		const container = { getBoundingClientRect: () => ({ top: 100, bottom: 500 }), scrollTop: 200 } as any
		const element = { getBoundingClientRect: () => ({ top: 120, bottom: 150 }) } as any
		const divideElement = { getBoundingClientRect: () => ({ top: 50, bottom: 60 }) } as any
		scrollIntoViewIfNeeded(element, container, divideElement)
		// divideRect.top(50) < elementTop(120) => elementTop=50
		// elementTop(50) < containerRect.top(100) => scroll up
		expect(container.scrollTop).toBe(150) // 200 - (100-50)
	})
})

describe('safeSendMessage', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('should send message via chrome.runtime', async () => {
		vi.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue(undefined)
		await safeSendMessage({ type: 'test' })
		expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'test' })
	})

	it('should call errorCallback on failure', async () => {
		const error = new Error('send failed')
		vi.spyOn(chrome.runtime, 'sendMessage').mockRejectedValue(error)
		const callback = vi.fn()
		await safeSendMessage({ type: 'test' }, callback)
		expect(callback).toHaveBeenCalledWith(error)
	})

	it('should not throw when sendMessage fails and no callback', async () => {
		vi.spyOn(chrome.runtime, 'sendMessage').mockRejectedValue(new Error('fail'))
		await expect(safeSendMessage({ type: 'test' })).resolves.not.toThrow()
	})
})

describe('closeTab', () => {
	it('should call chrome.tabs.remove with tab id', async () => {
		vi.mocked(chrome.tabs.remove).mockResolvedValue(undefined)
		const item = makeItem(ItemType.Tab, { id: 42, url: 'https://test.com' }) as ListItemType<ItemType.Tab>
		await closeTab(item)
		expect(chrome.tabs.remove).toHaveBeenCalledWith(42)
	})
})

describe('deleteItem', () => {
	it('should call chrome.history.deleteUrl for history item', async () => {
		vi.mocked(chrome.history.deleteUrl).mockResolvedValue(undefined)
		const item = makeItem(ItemType.History, { url: 'https://history.com' })
		await deleteItem(item)
		expect(chrome.history.deleteUrl).toHaveBeenCalledWith({ url: 'https://history.com' })
	})

	it('should not call deleteUrl for non-history item', async () => {
		vi.mocked(chrome.history.deleteUrl).mockClear()
		const item = makeItem(ItemType.Tab, { url: 'https://tab.com' })
		await deleteItem(item)
		expect(chrome.history.deleteUrl).not.toHaveBeenCalled()
	})
})

describe('handleItemClick', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(chrome.windows.update).mockResolvedValue({} as any)
		vi.mocked(chrome.tabs.update).mockResolvedValue({} as any)
		vi.mocked(chrome.tabs.create).mockResolvedValue({} as any)
		vi.mocked(chrome.windows.getAll).mockResolvedValue([])
	})

	it('should activate tab for tab items', async () => {
		const item = makeItem(ItemType.Tab, { id: 10, windowId: 1, url: 'https://a.com' }) as ListItemType<ItemType.Tab>
		await handleItemClick(item)
		expect(chrome.windows.update).toHaveBeenCalledWith(1, { focused: true })
		expect(chrome.tabs.update).toHaveBeenCalledWith(10, { active: true })
	})

	it('should create new tab for bookmark items', async () => {
		const item = makeItem(ItemType.Bookmark, { url: 'https://bookmark.com' })
		await handleItemClick(item)
		expect(chrome.tabs.create).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://bookmark.com' }))
	})
})

describe('getExecuteActionShortcuts', () => {
	it('should return shortcut for _execute_action command', async () => {
		vi.mocked(chrome.commands.getAll).mockImplementation((cb: any) => {
			cb([{ name: '_execute_action', shortcut: 'Ctrl+Shift+K' }])
		})
		const result = await getExecuteActionShortcuts()
		expect(result).toBe('Ctrl+Shift+K')
	})

	it('should return null when no _execute_action command', async () => {
		vi.mocked(chrome.commands.getAll).mockImplementation((cb: any) => {
			cb([{ name: 'other', shortcut: 'Ctrl+A' }])
		})
		const result = await getExecuteActionShortcuts()
		expect(result).toBeNull()
	})

	it('should return null when shortcut is empty', async () => {
		vi.mocked(chrome.commands.getAll).mockImplementation((cb: any) => {
			cb([{ name: '_execute_action', shortcut: '' }])
		})
		const result = await getExecuteActionShortcuts()
		expect(result).toBeNull()
	})
})

describe('isSystemDarkMode', () => {
	it('should return true when URL has dark param', () => {
		Object.defineProperty(window, 'location', {
			value: { search: '?is_system_dark=1' },
			writable: true,
		})
		const result = isSystemDarkMode()
		expect(result).toBe(true)
	})

	it('should check matchMedia when no URL param', () => {
		Object.defineProperty(window, 'location', {
			value: { search: '' },
			writable: true,
		})
		Object.defineProperty(window, 'matchMedia', {
			value: vi.fn().mockReturnValue({ matches: true }),
			writable: true,
		})
		const result = isSystemDarkMode()
		expect(result).toBe(true)
	})
})

describe('getActiveTabInUserWindow', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('should return active tab in current window', async () => {
		vi.mocked(chrome.windows.getCurrent).mockResolvedValue({ id: 1, type: 'normal' } as any)
		vi.mocked(chrome.tabs.query).mockResolvedValue([{ id: 5, url: 'https://a.com' }] as any)
		const result = await getActiveTabInUserWindow()
		expect(result).toEqual({ id: 5, url: 'https://a.com' })
	})

	it('should use lastActiveWindowId for popup windows', async () => {
		vi.mocked(chrome.windows.getCurrent).mockResolvedValue({ id: 2, type: 'popup' } as any)
		vi.mocked(storageGet).mockResolvedValue({ lastActiveWindowId: 99 })
		vi.mocked(chrome.tabs.query).mockResolvedValue([{ id: 10 }] as any)
		const result = await getActiveTabInUserWindow()
		expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, windowId: 99 })
		expect(result).toEqual({ id: 10 })
	})

	it('should return null when no tabs found', async () => {
		vi.mocked(chrome.windows.getCurrent).mockResolvedValue({ id: 1, type: 'normal' } as any)
		vi.mocked(chrome.tabs.query).mockResolvedValue([])
		const result = await getActiveTabInUserWindow()
		expect(result).toBeNull()
	})

	it('should return null on error', async () => {
		vi.mocked(chrome.windows.getCurrent).mockRejectedValue(new Error('fail'))
		const result = await getActiveTabInUserWindow()
		expect(result).toBeNull()
	})
})

describe('closeCurrentWindowAndClearStorage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(storageGet).mockResolvedValue({})
		vi.mocked(storageRemove).mockResolvedValue(undefined)
		vi.mocked(chrome.windows.remove).mockResolvedValue(undefined)
	})

	it('should remove lastActiveWindowId from storage', async () => {
		await closeCurrentWindowAndClearStorage()
		expect(storageRemove).toHaveBeenCalledWith('lastActiveWindowId')
	})

	it('should close window when selfWindowId exists', async () => {
		vi.mocked(storageGet).mockResolvedValue({ selfWindowId: 123 })
		await closeCurrentWindowAndClearStorage()
		expect(chrome.windows.remove).toHaveBeenCalledWith(123)
	})

	it('should not throw when window remove fails', async () => {
		vi.mocked(storageGet).mockResolvedValue({ selfWindowId: 999 })
		vi.mocked(chrome.windows.remove).mockRejectedValue(new Error('no window'))
		await expect(closeCurrentWindowAndClearStorage()).resolves.not.toThrow()
	})
})

describe('queryInNewTab', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(chrome.tabs.create).mockResolvedValue({} as any)
		vi.mocked(chrome.windows.getAll).mockResolvedValue([])
	})

	it('should open bookmarks search for bookmark items', async () => {
		const item = makeItem(ItemType.Bookmark, { url: 'https://bm.com', title: 'BM' })
		await queryInNewTab(item)
		expect(chrome.tabs.create).toHaveBeenCalledWith(
			expect.objectContaining({ url: 'chrome://bookmarks/?q=https://bm.com' })
		)
	})

	it('should open history search for history items', async () => {
		const item = makeItem(ItemType.History, { url: 'https://h.com', title: 'H' })
		await queryInNewTab(item)
		expect(chrome.tabs.create).toHaveBeenCalledWith(
			expect.objectContaining({ url: 'chrome://history/?q=https://h.com' })
		)
	})
})

describe('navigateCurrentTab', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(chrome.windows.getAll).mockResolvedValue([])
		vi.mocked(chrome.tabs.query).mockResolvedValue([{ id: 5 }] as any)
		vi.mocked(chrome.tabs.update).mockResolvedValue({} as any)
	})

	it('should update current tab url', async () => {
		await navigateCurrentTab('https://new-url.com')
		expect(chrome.tabs.update).toHaveBeenCalledWith(5, { url: 'https://new-url.com' })
	})
})
