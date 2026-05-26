import { describe, expect, it } from 'vitest'
import {
	buildSearchUrl,
	getSearchEngineIconUrl,
	isValidSearchEngineQueryTemplate,
	parseSearchEngineQueryTemplate,
	resolveSearchInput,
} from '~shared/search-engine'

describe('buildSearchUrl', () => {
	it('should build a search URL with encoded query', () => {
		const result = buildSearchUrl('hello world', 'https://google.com/search?q=%s')
		expect(result).toBe('https://google.com/search?q=hello%20world')
	})

	it('should encode special characters in query', () => {
		const result = buildSearchUrl('a&b=c', 'https://google.com/search?q=%s')
		expect(result).toBe('https://google.com/search?q=a%26b%3Dc')
	})

	it('should replace all occurrences of placeholder', () => {
		const result = buildSearchUrl('test', 'https://example.com?q=%s&ref=%s')
		expect(result).toBe('https://example.com?q=test&ref=test')
	})

	it('should trim query and template', () => {
		const result = buildSearchUrl(' hello ', '  https://google.com/search?q=%s  ')
		expect(result).toBe('https://google.com/search?q=hello')
	})
})

describe('parseSearchEngineQueryTemplate', () => {
	it('should return undefined if no placeholder found', () => {
		expect(parseSearchEngineQueryTemplate('https://google.com/search?q=test')).toBeUndefined()
	})

	it('should return undefined for non http/https protocol', () => {
		expect(parseSearchEngineQueryTemplate('ftp://example.com?q=%s')).toBeUndefined()
	})

	it('should return undefined for invalid URL', () => {
		expect(parseSearchEngineQueryTemplate('not a url %s')).toBeUndefined()
	})

	it('should return URL for valid template', () => {
		const result = parseSearchEngineQueryTemplate('https://google.com/search?q=%s')
		expect(result).toBeInstanceOf(URL)
		expect(result?.hostname).toBe('google.com')
	})

	it('should handle template with trimming', () => {
		const result = parseSearchEngineQueryTemplate('  https://bing.com/search?q=%s  ')
		expect(result).toBeInstanceOf(URL)
	})
})

describe('isValidSearchEngineQueryTemplate', () => {
	it('should return true for valid templates', () => {
		expect(isValidSearchEngineQueryTemplate('https://google.com/search?q=%s')).toBe(true)
	})

	it('should return false for invalid templates', () => {
		expect(isValidSearchEngineQueryTemplate('not a url')).toBe(false)
		expect(isValidSearchEngineQueryTemplate('ftp://example.com?q=%s')).toBe(false)
	})
})

describe('getSearchEngineIconUrl', () => {
	it('should return favicon URL for valid template', () => {
		const result = getSearchEngineIconUrl('https://google.com/search?q=%s')
		expect(result).toContain('pageUrl=')
		expect(result).toContain('size=24')
	})

	it('should return undefined for invalid template', () => {
		const result = getSearchEngineIconUrl('invalid')
		expect(result).toBeUndefined()
	})
})

describe('resolveSearchInput', () => {
	const engines = [
		{ id: 'google', name: 'Google', queryTemplate: 'https://google.com/search?q=%s' },
		{ id: 'bing', name: 'Bing', queryTemplate: 'https://bing.com/search?q=%s' },
	]
	const isUrl = (v: string) => v.includes('.')
	const toUrl = (v: string) => `https://${v}`

	it('should return openUrl when input is a URL', () => {
		const result = resolveSearchInput('example.com', engines, 'google', isUrl, toUrl)
		expect(result.openUrl).toBe('https://example.com')
	})

	it('should not return openUrl when input is not a URL', () => {
		const result = resolveSearchInput('hello world', engines, 'google', isUrl, toUrl)
		expect(result.openUrl).toBeUndefined()
	})

	it('should return searchEngine and searchUrl when engine matches', () => {
		const result = resolveSearchInput('test', engines, 'google', isUrl, toUrl)
		expect(result.searchEngine).toEqual(engines[0])
		expect(result.searchUrl).toBe('https://google.com/search?q=test')
	})

	it('should return undefined searchEngine when no engine matches', () => {
		const result = resolveSearchInput('test', engines, 'yahoo', isUrl, toUrl)
		expect(result.searchEngine).toBeUndefined()
		expect(result.searchUrl).toBeUndefined()
	})
})
