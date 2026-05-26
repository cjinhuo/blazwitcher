import { describe, expect, it, vi } from 'vitest'

vi.mock('text-search-engine', () => ({
	extractBoundaryMapping: vi.fn((s: string) => ({
		pinyinString: s,
		boundary: [],
		originalIndices: [],
		originalString: s,
		originalLength: s.length,
	})),
}))

import { ItemType } from '~shared/types'
import { buildSearchActionItems } from '~sidepanel/utils/buildSearchActionItems'

const mockI18n = vi.fn((key: string, ...args: any[]) => `${key}${args.length ? `:${args.join(',')}` : ''}`)

const defaultSearchConfig = {
	bookmarkDisplayCount: 10,
	historyDisplayCount: 10,
	topSuggestionsCount: 2,
	enableConsecutiveSearch: false,
	searchEngines: [{ id: 'google', name: 'Google', queryTemplate: 'https://google.com/search?q=%s' }],
	defaultSearchEngineId: 'google',
}

describe('buildSearchActionItems', () => {
	it('should return empty array for empty input', () => {
		expect(buildSearchActionItems('', defaultSearchConfig, mockI18n)).toEqual([])
	})

	it('should return empty array for whitespace-only input', () => {
		expect(buildSearchActionItems('   ', defaultSearchConfig, mockI18n)).toEqual([])
	})

	it('should include open item when input is a URL', () => {
		const result = buildSearchActionItems('https://example.com', defaultSearchConfig, mockI18n)
		const openItem = result.find((item) => item.data.actionType === 'open')
		expect(openItem).toBeDefined()
		expect(openItem?.data.url).toBe('https://example.com')
		expect(openItem?.itemType).toBe(ItemType.SearchAction)
	})

	it('should not include open item when input is not a URL', () => {
		const result = buildSearchActionItems('hello world', defaultSearchConfig, mockI18n)
		const openItem = result.find((item) => item.data.actionType === 'open')
		expect(openItem).toBeUndefined()
	})

	it('should include search item when search engine matches', () => {
		const result = buildSearchActionItems('test query', defaultSearchConfig, mockI18n)
		const searchItem = result.find((item) => item.data.actionType === 'search')
		expect(searchItem).toBeDefined()
		expect(searchItem?.data.url).toBe('https://google.com/search?q=test%20query')
		expect(searchItem?.data.id).toBe('search-google')
	})

	it('should not include search item when no engine matches', () => {
		const config = { ...defaultSearchConfig, defaultSearchEngineId: 'unknown' }
		const result = buildSearchActionItems('test', config, mockI18n)
		const searchItem = result.find((item) => item.data.actionType === 'search')
		expect(searchItem).toBeUndefined()
	})

	it('should include both open and search items for URL-like input', () => {
		const result = buildSearchActionItems('example.com', defaultSearchConfig, mockI18n)
		const openItem = result.find((item) => item.data.actionType === 'open')
		const searchItem = result.find((item) => item.data.actionType === 'search')
		expect(openItem).toBeDefined()
		expect(searchItem).toBeDefined()
	})
})
