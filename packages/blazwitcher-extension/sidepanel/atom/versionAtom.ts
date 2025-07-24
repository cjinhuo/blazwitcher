import { atomWithStorage } from 'jotai/utils'
import { PAGE_STORAGE_LAST_SEEN_VERSION } from '~shared/constants'

export const lastSeenVersionAtom = atomWithStorage<string>(PAGE_STORAGE_LAST_SEEN_VERSION, '0.0.0')
