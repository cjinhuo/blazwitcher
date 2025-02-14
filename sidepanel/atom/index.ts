import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { lang as translations } from '~i18n/lang'
import type { CommandPlugin, ListItemType } from '~shared/types'

export const OriginalListAtom = atomWithReset<ListItemType[]>([])
export const CompositionAtom = atomWithReset<boolean>(false)
export const HitPluginAtom = atomWithReset<CommandPlugin | null>(null)
export const SearchValueAtom = atomWithReset<{ value: string }>({ value: '' })

// 定义翻译内容的基础类型
type TranslationValue = string | ((args: any) => string)

// 定义支持的语言类型
type SupportedLanguages = 'en' | 'zh'

// 定义单个翻译项的类型
type TranslationItem = {
	[K in SupportedLanguages]?: TranslationValue
}

// 定义整个翻译字典的类型
export type Translations = {
	[K: string]: TranslationItem
}

// 从翻译字典中提取所有可用的 key
export type TranslationKeys = keyof typeof translations

// 支持的语言类型
type Language = 'cn' | 'en'

export type i18nFunction = (key: string, args?: any, lang?: Language) => string

// 默认语言 english
export const languageAtom = atom<Language>('en')

// 优化后的 i18nAtom
export const i18nAtom = atom((get) => <K extends TranslationKeys>(key: K, args?: any) => {
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
