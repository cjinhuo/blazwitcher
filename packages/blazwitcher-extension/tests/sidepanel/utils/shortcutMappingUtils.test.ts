import { describe, expect, it } from 'vitest'
import { ItemType, OperationItemPropertyTypes } from '~shared/types'
import {
	getOpenHereOperationId,
	getOpenOperationId,
	getOpenOperationIds,
	getTypeSpecificOperationIds,
} from '~sidepanel/utils/shortcutMappingUtils'

describe('getOpenOperationId', () => {
	it('should return tabOpen for Tab type', () => {
		expect(getOpenOperationId(ItemType.Tab)).toBe(OperationItemPropertyTypes.tabOpen)
	})

	it('should return historyOpen for History type', () => {
		expect(getOpenOperationId(ItemType.History)).toBe(OperationItemPropertyTypes.historyOpen)
	})

	it('should return bookmarkOpen for Bookmark type', () => {
		expect(getOpenOperationId(ItemType.Bookmark)).toBe(OperationItemPropertyTypes.bookmarkOpen)
	})

	it('should return searchOpen for SearchAction type', () => {
		expect(getOpenOperationId(ItemType.SearchAction)).toBe(OperationItemPropertyTypes.searchOpen)
	})

	it('should return tabOpen for default (Divide/Plugin)', () => {
		expect(getOpenOperationId(ItemType.Divide)).toBe(OperationItemPropertyTypes.tabOpen)
		expect(getOpenOperationId(ItemType.Plugin)).toBe(OperationItemPropertyTypes.tabOpen)
	})
})

describe('getOpenHereOperationId', () => {
	it('should return tabOpenHere for Tab type', () => {
		expect(getOpenHereOperationId(ItemType.Tab)).toBe(OperationItemPropertyTypes.tabOpenHere)
	})

	it('should return historyOpenHere for History type', () => {
		expect(getOpenHereOperationId(ItemType.History)).toBe(OperationItemPropertyTypes.historyOpenHere)
	})

	it('should return bookmarkOpenHere for Bookmark type', () => {
		expect(getOpenHereOperationId(ItemType.Bookmark)).toBe(OperationItemPropertyTypes.bookmarkOpenHere)
	})

	it('should return searchOpenHere for SearchAction type', () => {
		expect(getOpenHereOperationId(ItemType.SearchAction)).toBe(OperationItemPropertyTypes.searchOpenHere)
	})

	it('should return tabOpenHere for default', () => {
		expect(getOpenHereOperationId(ItemType.Divide)).toBe(OperationItemPropertyTypes.tabOpenHere)
	})
})

describe('getOpenOperationIds', () => {
	it('should return both open and openHere ids', () => {
		const result = getOpenOperationIds(ItemType.Tab)
		expect(result.openId).toBe(OperationItemPropertyTypes.tabOpen)
		expect(result.openHereId).toBe(OperationItemPropertyTypes.tabOpenHere)
	})

	it('should work for History type', () => {
		const result = getOpenOperationIds(ItemType.History)
		expect(result.openId).toBe(OperationItemPropertyTypes.historyOpen)
		expect(result.openHereId).toBe(OperationItemPropertyTypes.historyOpenHere)
	})
})

describe('getTypeSpecificOperationIds', () => {
	it('should return Tab-specific operations', () => {
		expect(getTypeSpecificOperationIds(ItemType.Tab)).toEqual([
			OperationItemPropertyTypes.tabOpen,
			OperationItemPropertyTypes.tabOpenHere,
		])
	})

	it('should return History-specific operations', () => {
		expect(getTypeSpecificOperationIds(ItemType.History)).toEqual([
			OperationItemPropertyTypes.historyOpen,
			OperationItemPropertyTypes.historyOpenHere,
		])
	})

	it('should return Bookmark-specific operations', () => {
		expect(getTypeSpecificOperationIds(ItemType.Bookmark)).toEqual([
			OperationItemPropertyTypes.bookmarkOpen,
			OperationItemPropertyTypes.bookmarkOpenHere,
		])
	})

	it('should return SearchAction-specific operations', () => {
		expect(getTypeSpecificOperationIds(ItemType.SearchAction)).toEqual([
			OperationItemPropertyTypes.searchOpen,
			OperationItemPropertyTypes.searchOpenHere,
		])
	})

	it('should return empty array for default types', () => {
		expect(getTypeSpecificOperationIds(ItemType.Divide)).toEqual([])
		expect(getTypeSpecificOperationIds(ItemType.Plugin)).toEqual([])
	})
})
