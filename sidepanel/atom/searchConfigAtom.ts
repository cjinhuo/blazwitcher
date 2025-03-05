import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_SEARCH_CONFIG, defaultSearchConfig } from '~shared/constants'

export const searchConfigAtom = atomWithStorage<Record<string, number>>(DEFAULT_SEARCH_CONFIG, defaultSearchConfig)

export const resetSearchConfigAtom = atom(null, (_, set) => {
	set(searchConfigAtom, defaultSearchConfig)
})
