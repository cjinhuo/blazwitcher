import { createStore, Provider } from 'jotai'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DefaultSearchConfig, LanguageType, LIST_ITEM_ACTIVE_CLASS } from '~shared/constants'
import { getCompositeSourceAndHost } from '~shared/text-search-pinyin'
import { ItemType, type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import {
	activeItemAtom,
	compositionAtom,
	languageAtom,
	originalListAtom,
	searchConfigAtom,
	shortcutMappingsAtom,
} from '~sidepanel/atom'
import SidePanel from '~sidepanel/index'
import { lang } from '../../i18n/lang'

const input = vi.hoisted(() => ({ search: (_value: string) => {} }))

// Keep the real List, search row, keyboard hook and operations; isolate storage,
// unrelated panels and Plasmo SVG imports from this sidepanel integration test.
vi.mock('~sidepanel/atom', async () => {
	const { atom } = await import('jotai')
	const { DefaultSearchConfig, LanguageType } = await import('~shared/constants')
	const { lang } = await import('../../i18n/lang')
	const languageAtom = atom(LanguageType.en)
	const shortcutMappingsAtom = atom<Record<string, string>>({ searchOpen: '↵', searchOpenHere: 'Shift + ↵' })
	return {
		languageAtom,
		shortcutMappingsAtom,
		i18nAtom: atom((get) => (key: keyof typeof lang, argument?: string) => {
			const translation = lang[key][get(languageAtom)]
			return typeof translation === 'function' ? (translation as (argument?: string) => string)(argument) : translation
		}),
		searchConfigAtom: atom(DefaultSearchConfig),
		originalListAtom: atom<ListItemType[]>([]),
		activeItemAtom: atom<ListItemType | undefined>(undefined),
		compositionAtom: atom(false),
		searchValueAtom: atom({ value: '' }),
		pluginContextAtom: atom({}),
		shortcutsAtom: atom((get) => Object.entries(get(shortcutMappingsAtom)).map(([id, shortcut]) => ({ id, shortcut }))),
	}
})

vi.mock('@douyinfe/semi-ui', async () => ({
	Empty: (await import('@douyinfe/semi-ui/lib/es/empty')).default,
	List: (await import('@douyinfe/semi-ui/lib/es/list')).default,
	Layout: (await import('@douyinfe/semi-ui/lib/es/layout')).default,
	Popover: (await import('@douyinfe/semi-ui/lib/es/popover')).default,
}))
vi.mock('@douyinfe/semi-illustrations', () => ({
	IllustrationNoResult: () => null,
	IllustrationNoResultDark: () => null,
}))
vi.mock('~shared/promisify', () => ({
	storageGet: vi.fn().mockResolvedValue({}),
	storageRemove: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('~sidepanel/hooks/useBookmarkDelete', () => ({ useBookmarkDelete: () => vi.fn() }))
vi.mock('~sidepanel/hooks/useTheme', async () => {
	const { TabGroupColorMap } = await import('~shared/constants')
	return { useTheme: () => {}, useColorMap: () => TabGroupColorMap.light }
})
vi.mock('~sidepanel/hooks/useLanguage', () => ({ useLanguage: () => {} }))
vi.mock('~sidepanel/hooks/useEscapeKey', () => ({ useEscapeKey: () => {} }))
vi.mock('~sidepanel/hooks/usePerformanceReport', () => ({ usePerformanceReport: () => {} }))
vi.mock('~sidepanel/utils/startup', () => ({ startup: () => {} }))
vi.mock('~sidepanel/hooks/useOriginalList', async () => {
	const { useAtomValue } = await import('jotai')
	const { originalListAtom } = await import('~sidepanel/atom')
	return { default: () => useAtomValue(originalListAtom) }
})
vi.mock('~sidepanel/search', () => ({
	default: ({ onSearch }: { onSearch: (value: string) => void }) => {
		input.search = onSearch
		return null
	},
}))
vi.mock('~sidepanel/footer', () => ({ default: () => null }))
vi.mock('~sidepanel/list-item', () => ({ RenderItem: () => null }))
vi.mock('~sidepanel/operation', () => ({ RenderSearchActionOperation: () => null }))
vi.mock('~plugins', async () => {
	const { matchPlugin } = await import('~plugins/match-plugin')
	const { SearchEngineCommand } = await import('~plugins/ui/search-engine-command')
	return {
		matchPlugin,
		default: () => [
			{
				itemType: ItemType.Plugin,
				data: { command: '/e', render: (value: string) => <SearchEngineCommand searchValue={value} /> },
			},
			{
				itemType: ItemType.Plugin,
				data: { command: '/s', render: (value: string) => <div>settings:{value}</div> },
			},
		],
	}
})

describe('/e sidepanel search', () => {
	let store: ReturnType<typeof createStore>
	let root: Root
	let container: HTMLDivElement

	beforeEach(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		vi.clearAllMocks()
		vi.useFakeTimers()
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }))
		)
		store = createStore()
		store.set(searchConfigAtom, { ...DefaultSearchConfig, defaultSearchEngineId: 'bing' })
		container = document.createElement('div')
		document.body.append(container)
		root = createRoot(container)
		act(() =>
			root.render(
				<Provider store={store}>
					<SidePanel />
				</Provider>
			)
		)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
		vi.useRealTimers()
		vi.unstubAllGlobals()
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
	})

	function search(value: string) {
		act(() => input.search(value))
	}

	function rows() {
		return Array.from(container.querySelectorAll<HTMLElement>('.semi-list-item'))
	}

	function seedOriginalList() {
		act(() =>
			store.set(originalListAtom, [
				{
					itemType: ItemType.Tab,
					data: {
						id: 1,
						title: 'Other',
						url: 'https://other.example/',
						...getCompositeSourceAndHost('Other', 'https://other.example/'),
					},
				},
			])
		)
	}

	async function press(code: string, modifiers: KeyboardEventInit = {}) {
		act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: code, code, bubbles: true, ...modifiers })))
		await act(async () => vi.advanceTimersByTime(120))
	}

	it.each(['/e', '/e   ', '/e\t'])('shows guidance for %s without an active search row', async (value) => {
		search(value)
		expect(container.textContent).toContain(lang.searchEngineInputHint.en)
		expect(container.textContent).toContain(lang.searchEngineKeyboardHint.en)
		expect(container.querySelector('.semi-icon-search')).not.toBeNull()
		expect(rows()).toHaveLength(0)
		expect(store.get(activeItemAtom)).toBeUndefined()
		await press('Enter')
		expect(chrome.tabs.create).not.toHaveBeenCalled()
	})

	it('renders every configured engine, default first, without reordering the config', () => {
		const engines = store.get(searchConfigAtom).searchEngines
		search('/e GitHub')
		expect(rows().map((row) => row.textContent)).toEqual([
			'Search\u00a0GitHub\u00a0on Bing',
			'Search\u00a0GitHub\u00a0on Google',
			'Search\u00a0GitHub\u00a0on Baidu',
		])
		expect(store.get(activeItemAtom)?.data.id).toBe('search-bing')
		expect(store.get(searchConfigAtom).searchEngines).toBe(engines)
		expect(engines.map((engine) => engine.id)).toEqual(['google', 'baidu', 'bing'])
	})

	it.each([
		['/e useState', 'useState'],
		['/eGitHub', 'GitHub'],
		['/E GitHub', 'GitHub'],
		['/e   中文 useState + & # %  ', '中文 useState + & # %'],
		['/e\tGitHub', 'GitHub'],
	])('preserves the query through the entrypoint: %s', (value, query) => {
		search(value)
		expect(store.get(activeItemAtom)?.data.value).toBe(query)
		expect(store.get(activeItemAtom)?.data.url).toBe(`https://www.bing.com/search?q=${encodeURIComponent(query)}`)
	})

	it('keeps URL input as searches without a direct navigation row', () => {
		search('/e https://example.com/Case?x=A&B=C')
		expect(rows()).toHaveLength(3)
		expect(store.get(activeItemAtom)?.data.actionType).toBe('search')
		expect(container.textContent).not.toContain('Go to')
	})

	it('searches the selected engine after arrow navigation and uses the same URL on click', async () => {
		search('/e useState')
		await press('ArrowUp')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-baidu')
		await press('ArrowDown')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-bing')
		await press('ArrowDown')
		expect(rows()[1].classList.contains(LIST_ITEM_ACTIVE_CLASS)).toBe(true)
		await press('Enter')
		expect(chrome.tabs.create).toHaveBeenCalledTimes(1)
		expect(chrome.tabs.create).toHaveBeenLastCalledWith({
			url: 'https://www.google.com/search?q=useState',
			windowId: undefined,
		})
		await act(async () => rows()[1].click())
		expect(chrome.tabs.create).toHaveBeenCalledTimes(2)
		expect(vi.mocked(chrome.tabs.create).mock.calls[1]).toEqual(vi.mocked(chrome.tabs.create).mock.calls[0])
	})

	it('ignores navigation and Enter during composition, then resumes searching', async () => {
		search('/e 测试')
		act(() => store.set(compositionAtom, true))
		await press('ArrowDown')
		await press('Enter')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-bing')
		expect(chrome.tabs.create).not.toHaveBeenCalled()
		act(() => store.set(compositionAtom, false))
		await press('Enter')
		expect(chrome.tabs.create).toHaveBeenCalledWith({
			url: `https://www.bing.com/search?q=${encodeURIComponent('测试')}`,
			windowId: undefined,
		})
	})

	it('continues to honor a customized search shortcut', async () => {
		act(() => store.set(shortcutMappingsAtom, { [OperationItemPropertyTypes.searchOpen]: 'Ctrl + ↵' }))
		search('/e GitHub')
		await press('Enter')
		expect(chrome.tabs.create).not.toHaveBeenCalled()
		await press('Enter', { ctrlKey: true })
		expect(chrome.tabs.create).toHaveBeenCalledTimes(1)
	})

	it.each([
		['/e useState', 'useState'],
		['unmatchedQuery', 'unmatchedQuery'],
	])('uses the selected engine in the current browser tab for %s', async (value, query) => {
		seedOriginalList()
		vi.mocked(chrome.tabs.query).mockResolvedValueOnce([{ id: 9 } as chrome.tabs.Tab])
		search(value)
		await press('ArrowDown')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-google')
		await press('Enter', { shiftKey: true })
		expect(chrome.tabs.update).toHaveBeenCalledWith(9, {
			url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
		})
		expect(chrome.tabs.create).not.toHaveBeenCalled()
	})

	it('refreshes rows after adding, removing and changing the default engine', () => {
		search('/e GitHub')
		act(() =>
			store.set(searchConfigAtom, {
				...DefaultSearchConfig,
				searchEngines: [
					DefaultSearchConfig.searchEngines[0],
					{ id: 'custom', name: 'Custom', queryTemplate: 'https://custom.example/?q=%s' },
				],
				defaultSearchEngineId: 'custom',
			})
		)
		expect(rows()).toHaveLength(2)
		expect(store.get(activeItemAtom)?.data.id).toBe('search-custom')
		expect(store.get(activeItemAtom)?.data.url).toBe('https://custom.example/?q=GitHub')
		expect(container.textContent).not.toContain('Bing')
	})

	it('shows the configuration hint with no engines and clears the previous selection', async () => {
		search('/e GitHub')
		act(() => store.set(searchConfigAtom, { ...DefaultSearchConfig, searchEngines: [], defaultSearchEngineId: '' }))
		expect(container.textContent).toContain(lang.searchEngineNotConfigured.en)
		expect(rows()).toHaveLength(0)
		expect(store.get(activeItemAtom)).toBeUndefined()
		await press('Enter')
		expect(chrome.tabs.create).not.toHaveBeenCalled()
	})

	it('opens the suggested search settings when the source list and engines are empty', () => {
		act(() => store.set(searchConfigAtom, { ...DefaultSearchConfig, searchEngines: [], defaultSearchEngineId: '' }))
		search('/e GitHub')
		expect(container.textContent).toContain(lang.searchEngineNotConfigured.en)
		search('/s search')
		expect(container.textContent).toContain('settings: search')
	})

	it('clears the active item when returning from a query to the input hint', async () => {
		search('/e GitHub')
		search('/e ')
		expect(store.get(activeItemAtom)).toBeUndefined()
		await press('Enter')
		expect(chrome.tabs.create).not.toHaveBeenCalled()
	})

	it('renders Chinese guidance and engine labels', () => {
		act(() => store.set(languageAtom, LanguageType.zh))
		search('/e')
		expect(container.textContent).toContain(lang.searchEngineInputHint.zh)
		expect(container.textContent).toContain(lang.searchEngineKeyboardHint.zh)
		search('/e 测试')
		expect(rows()[0].textContent).toBe('用 Bing 搜索\u00a0测试')
	})

	it('offers every engine for ordinary unmatched input and executes the selected row', async () => {
		seedOriginalList()
		const query = 'unmatchedQuery 中文 + & # %'
		const displayedQuery = query.replaceAll(' ', '\u00a0')
		search(`  ${query}  `)
		expect(
			rows()
				.filter((row) => row.textContent?.includes('Search'))
				.map((row) => row.textContent)
		).toEqual([
			`Search\u00a0${displayedQuery}\u00a0on Bing`,
			`Search\u00a0${displayedQuery}\u00a0on Google`,
			`Search\u00a0${displayedQuery}\u00a0on Baidu`,
		])
		expect(store.get(activeItemAtom)?.data.id).toBe('search-bing')
		await press('ArrowDown')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-google')
		await press('Enter')
		expect(chrome.tabs.create).toHaveBeenCalledWith({
			url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
			windowId: undefined,
		})
		const googleRow = rows().filter((row) => row.textContent?.includes('on Google'))[0]
		await act(async () => googleRow.click())
		expect(chrome.tabs.create).toHaveBeenCalledTimes(2)
		expect(vi.mocked(chrome.tabs.create).mock.calls[1]).toEqual(vi.mocked(chrome.tabs.create).mock.calls[0])
	})

	it('keeps direct navigation before the engine searches for ordinary unmatched URL input', async () => {
		seedOriginalList()
		const query = 'https://unmatched.example/Case?x=A&B=C'
		search(query)
		expect(rows().filter((row) => row.textContent?.includes('Search'))).toHaveLength(3)
		expect(store.get(activeItemAtom)?.data.id).toBe('go-to-url')
		expect(store.get(activeItemAtom)?.data.url).toBe(query)
		await press('ArrowDown')
		expect(store.get(activeItemAtom)?.data.id).toBe('search-bing')
		await press('Enter')
		expect(chrome.tabs.create).toHaveBeenCalledWith({
			url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
			windowId: undefined,
		})
	})

	it('keeps matching list results and other command arguments unchanged', () => {
		seedOriginalList()
		search('Other')
		expect(store.get(activeItemAtom)?.itemType).toBe(ItemType.Tab)
		expect(rows().filter((row) => row.textContent?.includes('Search'))).toHaveLength(0)
		search('/s SEARCH')
		expect(container.textContent).toContain('settings: search')
	})
})
