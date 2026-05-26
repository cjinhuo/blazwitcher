import { atom } from 'jotai'
import {
	DEFAULT_HISTORY_MAX_DAYS,
	DEFAULT_HISTORY_MAX_RESULTS,
	DefaultSearchConfig,
	EXTENSION_STORAGE_HISTORY_MAX_DAYS,
	EXTENSION_STORAGE_HISTORY_MAX_RESULTS,
	PAGE_STORAGE_SEARCH_CONFIG,
	SEARCH_ENGINE_PRESETS,
	type SearchEngineConfig,
} from '~shared/constants'
import { storageGetLocal, storageGetSync, storageSetSync } from '~shared/promisify'
import { isValidSearchEngineQueryTemplate } from '~shared/search-engine'
import { createSyncStorageAtom } from './common'

// 历史/搜索相关配置使用 sync，随 Chrome 账号跨设备同步
export const historyMaxDaysAtom = createSyncStorageAtom(EXTENSION_STORAGE_HISTORY_MAX_DAYS, DEFAULT_HISTORY_MAX_DAYS)
export const historyMaxResultsAtom = createSyncStorageAtom(
	EXTENSION_STORAGE_HISTORY_MAX_RESULTS,
	DEFAULT_HISTORY_MAX_RESULTS
)

export type SearchConfigAtomType = typeof DefaultSearchConfig

type StoredSearchConfig = Partial<SearchConfigAtomType> & {
	searchEngineQueryTemplate?: string
}

const getLocalStorageSearchConfig = (): StoredSearchConfig | undefined => {
	try {
		const rawValue = localStorage.getItem(PAGE_STORAGE_SEARCH_CONFIG)
		return rawValue ? (JSON.parse(rawValue) as StoredSearchConfig) : undefined
	} catch {
		return undefined
	}
}

const isSameSearchConfig = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const normalizeSearchEngines = (value: StoredSearchConfig): SearchEngineConfig[] => {
	if (Array.isArray(value.searchEngines)) {
		return value.searchEngines
			.filter(
				(engine) =>
					engine?.id &&
					engine?.name?.trim() &&
					engine?.queryTemplate &&
					isValidSearchEngineQueryTemplate(engine.queryTemplate)
			)
			.map((engine) => ({
				id: engine.id,
				name: engine.name.trim(),
				queryTemplate: engine.queryTemplate.trim(),
			}))
	}

	if (value.searchEngineQueryTemplate && isValidSearchEngineQueryTemplate(value.searchEngineQueryTemplate)) {
		return [
			{
				...SEARCH_ENGINE_PRESETS[0],
				queryTemplate: value.searchEngineQueryTemplate.trim(),
			},
		]
	}

	return DefaultSearchConfig.searchEngines
}

const normalizeSearchConfig = (value: StoredSearchConfig): SearchConfigAtomType => {
	const searchEngines = normalizeSearchEngines(value)
	const defaultSearchEngineId = searchEngines.some((engine) => engine.id === value.defaultSearchEngineId)
		? value.defaultSearchEngineId || ''
		: searchEngines[0]?.id || ''

	return {
		...DefaultSearchConfig,
		historyDisplayCount: value.historyDisplayCount ?? DefaultSearchConfig.historyDisplayCount,
		bookmarkDisplayCount: value.bookmarkDisplayCount ?? DefaultSearchConfig.bookmarkDisplayCount,
		topSuggestionsCount: value.topSuggestionsCount ?? DefaultSearchConfig.topSuggestionsCount,
		enableConsecutiveSearch: value.enableConsecutiveSearch ?? DefaultSearchConfig.enableConsecutiveSearch,
		searchEngines,
		defaultSearchEngineId,
	}
}

const storedSearchConfigAtom = atom<SearchConfigAtomType>(DefaultSearchConfig)

// 搜索引擎配置需要在插件窗口关闭后仍可靠保存。
// 这里不用 atomWithStorage 的隐式异步写入，改为显式读 sync、兼容旧存储并在写入时 await chrome.storage.sync。
storedSearchConfigAtom.onMount = (setValue) => {
	void (async () => {
		const [syncStorage, chromeLocalStorage] = await Promise.all([
			storageGetSync(PAGE_STORAGE_SEARCH_CONFIG),
			storageGetLocal(),
		])
		const syncValue = syncStorage[PAGE_STORAGE_SEARCH_CONFIG]
		const storedValue =
			syncValue ??
			chromeLocalStorage[PAGE_STORAGE_SEARCH_CONFIG] ??
			getLocalStorageSearchConfig() ??
			DefaultSearchConfig
		const normalizedValue = normalizeSearchConfig(storedValue as StoredSearchConfig)
		if (!isSameSearchConfig(syncValue, normalizedValue)) {
			await storageSetSync({ [PAGE_STORAGE_SEARCH_CONFIG]: normalizedValue })
		}
		setValue(normalizedValue)
	})()
}

export const searchConfigAtom = atom(
	(get) => get(storedSearchConfigAtom),
	async (get, set, update: SearchConfigAtomType | ((prev: SearchConfigAtomType) => SearchConfigAtomType)) => {
		const previousValue = get(storedSearchConfigAtom)
		const nextValue = typeof update === 'function' ? update(previousValue) : update
		const normalizedValue = normalizeSearchConfig(nextValue)
		set(storedSearchConfigAtom, normalizedValue)
		await storageSetSync({ [PAGE_STORAGE_SEARCH_CONFIG]: normalizedValue })
	}
)

export const resetSearchConfigAtom = atom(null, (_, set) => {
	set(historyMaxDaysAtom, DEFAULT_HISTORY_MAX_DAYS)
	set(historyMaxResultsAtom, DEFAULT_HISTORY_MAX_RESULTS)
	set(searchConfigAtom, DefaultSearchConfig)
})
