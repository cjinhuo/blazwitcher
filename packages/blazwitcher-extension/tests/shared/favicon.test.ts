import { describe, expect, it } from 'vitest'
import { faviconURL } from '~shared/favicon'

describe('faviconURL', () => {
	it('should build a favicon URL with pageUrl and size params', () => {
		const result = faviconURL('https://example.com')
		expect(result).toBe('chrome-extension://test-extension-id/_favicon/?pageUrl=https%3A%2F%2Fexample.com&size=24')
	})

	it('should handle URLs with query parameters', () => {
		const result = faviconURL('https://example.com/path?foo=bar&baz=1')
		expect(result).toContain('pageUrl=')
		expect(result).toContain('size=24')
		expect(result).toContain(encodeURIComponent('https://example.com/path?foo=bar&baz=1'))
	})

	it('should handle URLs with special characters', () => {
		const result = faviconURL('https://example.com/path with spaces')
		expect(result).toContain('pageUrl=')
		expect(result).toContain('size=24')
	})
})
