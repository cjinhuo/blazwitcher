import { atomWithReset } from 'jotai/utils'
import type { ListItemType } from '~shared/types'

export const OriginalListAtom = atomWithReset<ListItemType[]>([])
export const CompositionAtom = atomWithReset<boolean>(false)
