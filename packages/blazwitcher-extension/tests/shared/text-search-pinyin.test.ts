import { describe, expect, it, vi } from 'vitest'

vi.mock('text-search-engine', () => ({
	extractBoundaryMapping: vi.fn((source: string) => ({
		pinyinString: source,
		boundary: [],
		originalIndices: [],
		originalString: source,
		originalLength: source.length,
	})),
}))

import { getCompositeSourceAndHost } from '~shared/text-search-pinyin'

describe('getCompositeSourceAndHost', () => {
	it('should extract host from URL and compose source', () => {
		const result = getCompositeSourceAndHost('Example Page', 'https://example.com/path')
		expect(result.host).toBe('example.com')
		expect(result.compositeSource).toBe('example pageexample.com')
	})

	it('should convert title to lowercase', () => {
		const result = getCompositeSourceAndHost('HELLO WORLD', 'https://test.com')
		expect(result.compositeSource).toBe('hello worldtest.com')
	})

	it('should trim title whitespace', () => {
		const result = getCompositeSourceAndHost('  spaced title  ', 'https://test.com')
		expect(result.compositeSource).toBe('spaced titletest.com')
	})

	it('should return compositeBoundaryMapping from extractBoundaryMapping', () => {
		const result = getCompositeSourceAndHost('Title', 'https://host.com')
		expect(result.compositeBoundaryMapping).toBeDefined()
		expect(result.compositeBoundaryMapping.originalString).toBe('titlehost.com')
	})
})
