import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { lang as translations } from '~i18n/lang'
import type { CommandPlugin, ListItemType } from '~shared/types'

export const OriginalListAtom = atomWithReset<ListItemType[]>([])
export const CompositionAtom = atomWithReset<boolean>(false)
export const HitPluginAtom = atomWithReset<CommandPlugin | null>(null)
export const SearchValueAtom = atomWithReset<{ value: string }>({ value: '' })

// 支持的语言类型
type Language = 'cn' | 'en'

export type i18nFunction = (key: string, args?: any, lang?: Language) => string

// 默认语言 english
export const languageAtom = atom<Language>('en')

export const i18nAtom = atom((get) => (key: string, args?: any) => {
	const defaultLang = get(languageAtom)
	const translation = translations[key]?.[defaultLang] || translations[key]?.en

	if (typeof translation === 'function') {
		return translation(args)
	}

	if (typeof translation === 'string') {
		return translation
	}

	return key
})
