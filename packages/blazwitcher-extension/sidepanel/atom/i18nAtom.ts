import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { lang as translations } from '~i18n/lang'
import { LanguageType, PAGE_STORAGE_LANGUAGE_KEY } from '~shared/constants'
import { createChromeSyncStorage } from './common'

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

export const defaultLanguage = navigator.language.toLowerCase().startsWith('zh') ? LanguageType.zh : LanguageType.en

// 语言设置使用 sync，随 Chrome 账号跨设备同步
export const languageAtom = atomWithStorage<LanguageType>(
	PAGE_STORAGE_LANGUAGE_KEY,
	defaultLanguage,
	createChromeSyncStorage<LanguageType>()
)

export const i18nAtom = atom((get) => <K extends TranslationKeys>(key: K, args?: any) => {
	const currentLanguage = get(languageAtom)
	const defaultLang = currentLanguage instanceof Promise ? defaultLanguage : currentLanguage
	const translation = translations[key]?.[defaultLang] || translations[key]?.en

	if (typeof translation === 'function') {
		return translation(args)
	}

	if (typeof translation === 'string') {
		return translation
	}

	return key
})
