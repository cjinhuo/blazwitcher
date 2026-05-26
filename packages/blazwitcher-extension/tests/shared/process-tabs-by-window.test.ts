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

import { processTabsForAI } from '~shared/process-tabs-by-window'
import { ItemType } from '~shared/types'

const makeTab = (id: number, windowId: number, opts: { groupId?: number; tabGroup?: any } = {}) => ({
	itemType: ItemType.Tab,
	data: {
		id,
		windowId,
		title: `Tab ${id}`,
		url: `https://tab${id}.com`,
		host: `tab${id}.com`,
		tabGroup: opts.tabGroup || null,
		groupId: opts.groupId ?? -1,
		compositeSource: `tab ${id}tab${id}.com`,
		compositeBoundaryMapping: {
			pinyinString: '',
			boundary: [],
			originalIndices: [],
			originalString: '',
			originalLength: 0,
		},
	},
})

describe('processTabsForAI', () => {
	it('should return empty array for empty input', () => {
		expect(processTabsForAI([])).toEqual([])
	})

	it('should filter out non-tab items', () => {
		const items = [
			makeTab(1, 100),
			{ itemType: ItemType.Bookmark, data: { title: 'BM', url: 'https://bm.com', host: 'bm.com' } },
			{ itemType: ItemType.History, data: { title: 'H', url: 'https://h.com', host: 'h.com' } },
		]
		const result = processTabsForAI(items as any)
		expect(result).toHaveLength(1)
		expect(result[0].windowId).toBe(100)
	})

	it('should group tabs by window', () => {
		const items = [makeTab(1, 100), makeTab(2, 100), makeTab(3, 200)]
		const result = processTabsForAI(items as any)
		expect(result).toHaveLength(2)
		const win100 = result.find((w) => w.windowId === 100)
		const win200 = result.find((w) => w.windowId === 200)
		expect(win100?.summary.totalTabs).toBe(2)
		expect(win200?.summary.totalTabs).toBe(1)
	})

	it('should separate grouped and ungrouped tabs', () => {
		const tabGroup = { id: 10, title: 'Group A', color: 'blue' }
		const items = [makeTab(1, 100, { tabGroup }), makeTab(2, 100, { tabGroup }), makeTab(3, 100)]
		const result = processTabsForAI(items as any)
		expect(result).toHaveLength(1)
		const win = result[0]
		expect(win.existingGroups).toHaveLength(1)
		expect(win.existingGroups[0].memberCount).toBe(2)
		expect(win.existingGroups[0].title).toBe('Group A')
		expect(win.ungroupedTabs).toHaveLength(1)
		expect(win.ungroupedTabs[0].data.id).toBe(3)
	})

	it('should collect unique hosts in existing groups', () => {
		const tabGroup = { id: 10, title: 'Group', color: 'red' }
		const items = [
			{ ...makeTab(1, 100, { tabGroup }), data: { ...makeTab(1, 100, { tabGroup }).data, host: 'a.com' } },
			{ ...makeTab(2, 100, { tabGroup }), data: { ...makeTab(2, 100, { tabGroup }).data, host: 'a.com' } },
			{ ...makeTab(3, 100, { tabGroup }), data: { ...makeTab(3, 100, { tabGroup }).data, host: 'b.com' } },
		]
		const result = processTabsForAI(items as any)
		const group = result[0].existingGroups[0]
		expect(group.hosts).toEqual(['a.com', 'b.com'])
	})

	it('should provide correct summary', () => {
		const tabGroup = { id: 10, title: 'G', color: 'green' }
		const items = [makeTab(1, 100, { tabGroup }), makeTab(2, 100), makeTab(3, 100)]
		const result = processTabsForAI(items as any)
		const win = result[0]
		expect(win.summary.totalTabs).toBe(3)
		expect(win.summary.ungroupedTabs).toBe(2)
		expect(win.summary.existingGroupsCount).toBe(1)
	})
})
