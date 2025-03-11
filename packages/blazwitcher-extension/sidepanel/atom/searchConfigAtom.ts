import { atom } from 'jotai'
import { atomWithStorage } from '~node_modules/jotai/utils'
import {
	DEFAULT_HISTORY_MAX_DAYS,
	DEFAULT_HISTORY_MAX_RESULTS,
	DefaultSearchConfig,
	EXTENSION_STORAGE_HISTORY_MAX_DAYS,
	EXTENSION_STORAGE_HISTORY_MAX_RESULTS,
	PAGE_STORAGE_SEARCH_CONFIG,
} from '~shared/constants'
import { createStorageAtom } from './common'

export const historyMaxDaysAtom = createStorageAtom(EXTENSION_STORAGE_HISTORY_MAX_DAYS, DEFAULT_HISTORY_MAX_DAYS)
export const historyMaxResultsAtom = createStorageAtom(
	EXTENSION_STORAGE_HISTORY_MAX_RESULTS,
	DEFAULT_HISTORY_MAX_RESULTS
)

export const searchConfigAtom = atomWithStorage(`${PAGE_STORAGE_SEARCH_CONFIG}`, DefaultSearchConfig)

export type SearchConfigAtomType = typeof DefaultSearchConfig

export const resetSearchConfigAtom = atom(null, (_, set) => {
	set(historyMaxDaysAtom, DEFAULT_HISTORY_MAX_DAYS)
	set(historyMaxResultsAtom, DEFAULT_HISTORY_MAX_RESULTS)
	set(searchConfigAtom, DefaultSearchConfig)
})
