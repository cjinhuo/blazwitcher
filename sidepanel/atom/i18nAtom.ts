import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { lang as translations } from '~i18n/lang'
import { DEFAULT_LANGUAGE_KEY, LanguageType } from '~shared/constants'

type TranslationValue = string | ((args: any) => string)
type SupportedLanguages = keyof typeof LanguageType

// 优化后的翻译字典类型
export type Translations = {
	[K: string]: {
		[Lang in SupportedLanguages]?: TranslationValue
	}
}

export type TranslationKeys = keyof typeof translations
export type i18nFunction = (key: TranslationKeys, args?: any) => string

// 默认语言 en
export const languageAtom = atomWithStorage<LanguageType>(
	DEFAULT_LANGUAGE_KEY,
	navigator.language.toLowerCase().startsWith('zh') ? LanguageType.zh : LanguageType.en
)

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
