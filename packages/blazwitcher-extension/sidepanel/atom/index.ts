import { atom } from 'jotai'
import { atomWithReset, atomWithStorage } from 'jotai/utils'
import { PAGE_STORAGE_THEME_COLOR } from '~shared/constants'
import type { CommandPlugin, ListItemType } from '~shared/types'
import { defaultLanguage, languageAtom } from './i18nAtom'
import { restoreWindowConfigAtom } from './windowAtom'

export * from './shortcutAtom'
export * from './i18nAtom'
export * from './searchConfigAtom'
export * from './windowAtom'

export const themeAtom = atomWithStorage<'dark' | 'light' | 'system'>(PAGE_STORAGE_THEME_COLOR, 'system')
export const activeItemAtom = atomWithReset<ListItemType | CommandPlugin | null>(null)
export const originalListAtom = atomWithReset<ListItemType[]>([])
export const compositionAtom = atomWithReset<boolean>(false)
export const hitPluginAtom = atomWithReset<CommandPlugin | null>(null)
export const searchValueAtom = atomWithReset<{ value: string }>({ value: '' })

// restore appearance panel settings、
export const restoreAppearanceSettingsAtom = atom(
	null, // 读取函数返回 null，因为这个 atom 不需要存储值
	(_, set) => {
		set(themeAtom, 'system')
		set(languageAtom, defaultLanguage)
		set(restoreWindowConfigAtom)
	}
)
