import { describe, expect, it } from 'vitest'
import { normalizeSearchValue } from '~sidepanel/utils/normalizeSearchValue'

describe('normalizeSearchValue', () => {
	it('should trim whitespace', () => {
		expect(normalizeSearchValue('  hello  ')).toBe('hello')
	})

	it('should replace leading "、" with "/"', () => {
		expect(normalizeSearchValue('、settings')).toBe('/settings')
	})

	it('should replace leading "、" after trimming', () => {
		expect(normalizeSearchValue('  、b  ')).toBe('/b')
	})

	it('should not replace "、" in the middle', () => {
		expect(normalizeSearchValue('hello、world')).toBe('hello、world')
	})

	it('should return empty string for whitespace-only input', () => {
		expect(normalizeSearchValue('   ')).toBe('')
	})

	it('should return value as-is if no special handling needed', () => {
		expect(normalizeSearchValue('/h')).toBe('/h')
	})
})
