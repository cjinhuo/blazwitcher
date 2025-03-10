import { atom } from 'jotai'
import { atomWithStorage } from '~node_modules/jotai/utils'
import {
	DEFAULT_HISTORY_MAX_DAYS,
	DEFAULT_HISTORY_MAX_RESULTS,
	DEFAULT_SEARCH_CONFIG,
	DefaultSearchConfig,
	ES_HISTORY_MAX_DAYS,
	ES_HISTORY_MAX_RESULTS,
} from '~shared/constants'
import { storageGetLocal } from '~shared/promisify'
import { createStorageAtom } from './common'

export const historyMaxDaysAtom = createStorageAtom(ES_HISTORY_MAX_DAYS, DEFAULT_HISTORY_MAX_DAYS)
export const historyMaxResultsAtom = createStorageAtom(ES_HISTORY_MAX_RESULTS, DEFAULT_HISTORY_MAX_RESULTS)

export const searchConfigAtom = atomWithStorage(`${DEFAULT_SEARCH_CONFIG}`, DefaultSearchConfig)

export type SearchConfigAtomType = typeof DefaultSearchConfig

export const resetSearchConfigAtom = atom(null, (_, set) => {
	set(historyMaxDaysAtom, DEFAULT_HISTORY_MAX_DAYS)
	set(historyMaxResultsAtom, DEFAULT_HISTORY_MAX_RESULTS)
	set(searchConfigAtom, DefaultSearchConfig)
})

export const getExtensionStorageSearchConfig = async () => {
	const extensionLocalStorage = await storageGetLocal()
	return {
		historyMaxDays: Number(extensionLocalStorage?.[ES_HISTORY_MAX_DAYS] || DEFAULT_HISTORY_MAX_DAYS),
		historyMaxResults: Number(extensionLocalStorage?.[ES_HISTORY_MAX_RESULTS] || DEFAULT_HISTORY_MAX_RESULTS),
	}
}
