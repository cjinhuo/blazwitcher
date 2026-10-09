import { describe, expect, it, vi } from 'vitest'

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

const multipleEngineConfig = {
	...defaultSearchConfig,
	searchEngines: [
		...defaultSearchConfig.searchEngines,
		{ id: 'baidu', name: 'Baidu', queryTemplate: 'https://www.baidu.com/s?wd=%s' },
		{ id: 'bing', name: 'Bing', queryTemplate: 'https://www.bing.com/search?q=%s' },
	],
	defaultSearchEngineId: 'bing',
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

	it('should not include search items when no engines are configured', () => {
		const config = { ...defaultSearchConfig, searchEngines: [], defaultSearchEngineId: '' }
		const result = buildSearchActionItems('test', config, mockI18n)
		expect(result).toEqual([])
	})

	it('should put the default engine first without changing configured order', () => {
		const result = buildSearchActionItems('test', multipleEngineConfig, mockI18n)
		expect(result.map((item) => item.data.id)).toEqual(['search-bing', 'search-google', 'search-baidu'])
		expect(multipleEngineConfig.searchEngines.map((engine) => engine.id)).toEqual(['google', 'baidu', 'bing'])
	})

	it('should encode the original query for each engine template', () => {
		const query = '中文 useState + & # %'
		const result = buildSearchActionItems(`  ${query}  `, multipleEngineConfig, mockI18n)
		expect(result.map((item) => item.data.value)).toEqual([query, query, query])
		expect(result.map((item) => item.data.url)).toEqual([
			`https://www.bing.com/search?q=${encodeURIComponent(query)}`,
			`https://google.com/search?q=${encodeURIComponent(query)}`,
			`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
		])
	})

	it('should keep configured order when the default engine is missing', () => {
		const config = { ...multipleEngineConfig, defaultSearchEngineId: 'unknown' }
		const result = buildSearchActionItems('test', config, mockI18n)
		expect(result.map((item) => item.data.id)).toEqual(['search-google', 'search-baidu', 'search-bing'])
	})

	it('should include one direct navigation item before every engine for URL-like input', () => {
		const result = buildSearchActionItems('example.com', multipleEngineConfig, mockI18n)
		expect(result.map((item) => item.data.id)).toEqual(['go-to-url', 'search-bing', 'search-google', 'search-baidu'])
		expect(result[0].data.url).toBe('https://example.com')
	})

	it('should still offer direct navigation with no configured engines', () => {
		const config = { ...defaultSearchConfig, searchEngines: [], defaultSearchEngineId: '' }
		const result = buildSearchActionItems('example.com', config, mockI18n)
		expect(result.map((item) => item.data.actionType)).toEqual(['open'])
	})
})
