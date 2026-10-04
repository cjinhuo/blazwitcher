import { createStore, Provider } from 'jotai'
import type { PropsWithChildren } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingPanelKey } from '~shared/constants'
import { ItemType, type ListItemType } from '~shared/types'
import SidePanel from '~sidepanel/index'

const harness = vi.hoisted(() => ({
	onSearch: undefined as undefined | ((value: string) => void),
	list: [] as ListItemType[],
	emptyDescription: undefined as string | undefined,
	settingPanel: undefined as SettingPanelKey | undefined,
}))

// Keep the real SidePanel, command registry, matcher and search URL builder.
// Replace presentation and browser services so the test exercises their integration.
vi.mock('@douyinfe/semi-ui', () => {
	const Box = ({ children }: PropsWithChildren) => <div>{children}</div>
	return { Layout: Object.assign(Box, { Header: Box, Content: Box }), Empty: () => <div>Empty</div> }
})
vi.mock('~sidepanel/atom', async () => {
	const { atom } = await import('jotai')
	return {
		i18nAtom: atom(() => (key: string) => key),
		searchConfigAtom: atom({
			bookmarkDisplayCount: 10,
			historyDisplayCount: 10,
			topSuggestionsCount: 2,
			enableConsecutiveSearch: false,
			searchEngines: [{ id: 'github', name: 'GitHub', queryTemplate: 'https://github.com/search?q=%s' }],
			defaultSearchEngineId: 'github',
		}),
	}
})
vi.mock('~plugins/ui/render-item', () => ({ RenderPluginItem: () => null, usePluginClickItem: () => vi.fn() }))
vi.mock('~plugins/ui/setting-panels', () => ({
	SettingPanels: ({ initialPanel }: { initialPanel?: SettingPanelKey }) => {
		harness.settingPanel = initialPanel
		return null
	},
}))
vi.mock('~sidepanel/hooks/useOriginalList', async () => {
	const { getCompositeSourceAndHost } = await import('~shared/text-search-pinyin')
	const list = [ItemType.Tab, ItemType.Bookmark, ItemType.History].map((itemType) => ({
		itemType,
		data: {
			id: itemType,
			title: 'GitHub',
			url: 'https://github.com',
			...getCompositeSourceAndHost('GitHub', 'https://github.com'),
		},
	}))
	return { default: () => list }
})
vi.mock('~sidepanel/hooks/useTheme', () => ({ useTheme: () => {} }))
vi.mock('~sidepanel/hooks/useLanguage', () => ({ useLanguage: () => {} }))
vi.mock('~sidepanel/hooks/useEscapeKey', () => ({ useEscapeKey: () => {} }))
vi.mock('~sidepanel/hooks/usePerformanceReport', () => ({ usePerformanceReport: () => {} }))
vi.mock('~sidepanel/utils/startup', () => ({ startup: () => {} }))
vi.mock('~sidepanel/footer', () => ({ default: () => null }))
vi.mock('~sidepanel/search', () => ({
	default: ({ onSearch }: { onSearch: (value: string) => void }) => {
		harness.onSearch = onSearch
		return null
	},
}))
vi.mock('~sidepanel/list', () => ({
	default: ({ list, emptyDescription }: { list: ListItemType[]; emptyDescription?: string }) => {
		harness.list = list
		harness.emptyDescription = emptyDescription
		return null
	},
}))
vi.mock('~sidepanel/list-item', () => ({ RenderItem: () => null }))
vi.mock('~sidepanel/search-action-item', () => ({ RenderSearchActionItem: () => null }))

describe('sidepanel search commands', () => {
	let root: Root
	let container: HTMLDivElement

	beforeEach(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		harness.settingPanel = undefined
		container = document.createElement('div')
		document.body.append(container)
		root = createRoot(container)
		act(() =>
			root.render(
				<Provider store={createStore()}>
					<SidePanel />
				</Provider>
			)
		)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
	})

	it.each([
		['/se ', 'GitHub'],
		['/SE ', '"useState"'],
		['/se', 'https://example.com/CaseSensitive?q=AbC'],
		['/se ', 'İstanbul 大小写'],
	])('searches the original keyword via %s even when local results exist: %s', (command, query) => {
		act(() => harness.onSearch?.(`${command}${query}`))
		expect(harness.list).toHaveLength(1)
		expect(harness.list[0].data.actionType).toBe('search')
		expect(harness.list[0].data.value).toBe(query)
		expect(harness.list[0].data.url).toBe(`https://github.com/search?q=${encodeURIComponent(query)}`)
	})

	it('shows the usage hint when the search term is empty', () => {
		act(() => harness.onSearch?.('/se   '))
		expect(harness.list).toEqual([])
		expect(harness.emptyDescription).toBe('searchEngineInputHint')
	})

	it.each(['/s SEARCH', '/S SEARCH', '/sSEARCH'])('keeps settings arguments working for %s', (input) => {
		act(() => harness.onSearch?.(input))
		expect(harness.settingPanel).toBe(SettingPanelKey.SEARCH)
	})

	it.each([
		['/B GITHUB', ItemType.Bookmark],
		['/H GITHUB', ItemType.History],
		['/T GITHUB', ItemType.Tab],
		['/BGITHUB', ItemType.Bookmark],
		['/HGITHUB', ItemType.History],
		['/TGITHUB', ItemType.Tab],
	])('keeps filter arguments working for %s', (input, itemType) => {
		act(() => harness.onSearch?.(input))
		const results = harness.list.filter((item) => item.itemType !== ItemType.Divide)
		expect(results).toHaveLength(1)
		expect(results[0].itemType).toBe(itemType)
		expect(results[0].data.title).toBe('GitHub')
	})

	it.each([
		['/p', ['/pin']],
		['/unknown', []],
	])('keeps plugin suggestions for %s', (input, commands) => {
		act(() => harness.onSearch?.(input))
		expect(harness.list.map((item) => item.data.command)).toEqual(commands)
	})
})
