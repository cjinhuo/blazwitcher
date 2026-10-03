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

	it.each(['/se', '/SE'])('preserves keyword case through %s routing and URL generation', (command) => {
		act(() => harness.onSearch?.(`${command} "useState"`))
		expect(harness.list).toHaveLength(1)
		expect(harness.list[0].data.value).toBe('"useState"')
		expect(harness.list[0].data.url).toBe('https://github.com/search?q=%22useState%22')
	})

	it('preserves the case of URL paths and query parameters and only offers search', () => {
		act(() => harness.onSearch?.('/se https://example.com/CaseSensitive?q=AbC'))
		expect(harness.list).toHaveLength(1)
		expect(harness.list[0].data.actionType).toBe('search')
		expect(new URL(harness.list[0].data.url).searchParams.get('q')).toBe('https://example.com/CaseSensitive?q=AbC')
	})

	it('preserves non-ASCII keyword case', () => {
		act(() => harness.onSearch?.('/se İstanbul 大小写'))
		expect(new URL(harness.list[0].data.url).searchParams.get('q')).toBe('İstanbul 大小写')
	})

	it('shows the usage hint when the search term is empty', () => {
		act(() => harness.onSearch?.('/se   '))
		expect(harness.list).toEqual([])
		expect(harness.emptyDescription).toBe('searchEngineInputHint')
	})

	it.each(['/s', '/S'])('keeps %s settings panel names case-insensitive', (command) => {
		act(() => harness.onSearch?.(`${command} SEARCH`))
		expect(harness.settingPanel).toBe(SettingPanelKey.SEARCH)
	})

	it.each([
		['/B', ItemType.Bookmark],
		['/H', ItemType.History],
		['/T', ItemType.Tab],
	])('keeps %s filtering case-insensitive', (command, itemType) => {
		act(() => harness.onSearch?.(`${command} GITHUB`))
		const results = harness.list.filter((item) => item.itemType !== ItemType.Divide)
		expect(results).toHaveLength(1)
		expect(results[0].itemType).toBe(itemType)
		expect(results[0].data.title).toBe('GitHub')
	})
})
