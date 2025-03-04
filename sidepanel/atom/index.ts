import { atomWithReset, atomWithStorage } from 'jotai/utils'
import { DEFAULT_THEME_COLOR } from '~shared/constants'
import type { CommandPlugin, ListItemType } from '~shared/types'

export * from './shortcutAtom'
export * from './i18nAtom'
export const themeAtom = atomWithStorage<'dark' | 'light' | 'system'>(DEFAULT_THEME_COLOR, 'system')
export const activeItemAtom = atomWithReset<ListItemType>(null)
export const originalListAtom = atomWithReset<ListItemType[]>([])
export const compositionAtom = atomWithReset<boolean>(false)
export const hitPluginAtom = atomWithReset<CommandPlugin | null>(null)
export const searchValueAtom = atomWithReset<{ value: string }>({ value: '' })
