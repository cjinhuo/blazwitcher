import { atom } from 'jotai'
import { atomWithReset, atomWithStorage } from 'jotai/utils'
import { PAGE_STORAGE_SHOW_UPDATE_NOTIFICATION, PAGE_STORAGE_THEME_COLOR, ThemeColor } from '~shared/constants'
import type { CommandPlugin, ListItemType, WindowData } from '~shared/types'
import { createSyncStorage } from './common'
import { defaultLanguage, languageAtom } from './i18nAtom'
import { restoreWindowConfigAtom } from './windowAtom'

export * from './shortcutAtom'
export * from './i18nAtom'
export * from './searchConfigAtom'
export * from './windowAtom'

export const themeAtom = atomWithStorage<ThemeColor>(
	PAGE_STORAGE_THEME_COLOR,
	ThemeColor.System,
	createSyncStorage<ThemeColor>(),
	{ getOnInit: true }
)
export const activeItemAtom = atomWithReset<ListItemType | null>(null)
export const originalListAtom = atomWithReset<ListItemType[]>([])
export const windowDataListAtom = atomWithReset<WindowData[]>([])
export const compositionAtom = atomWithReset<boolean>(false)
export const hitPluginAtom = atomWithReset<CommandPlugin | null>(null)
export const searchValueAtom = atomWithReset<{ value: string }>({ value: '' })
// 存储用户最后查看的版本号，用于控制更新通知的显示
export const lastViewedVersionAtom = atomWithStorage<string>(PAGE_STORAGE_SHOW_UPDATE_NOTIFICATION, '')

// restore appearance panel settings、
export const restoreAppearanceSettingsAtom = atom(
	null, // 读取函数返回 null，因为这个 atom 不需要存储值
	(_, set) => {
		set(themeAtom, ThemeColor.System)
		set(languageAtom, defaultLanguage)
		set(restoreWindowConfigAtom)
	}
)
