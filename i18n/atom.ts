import { atom } from 'jotai'
import { lang } from './lang'

// 支持的语言类型
type Language = 'cn' | 'en'

interface Translations {
	[key: string]: {
		[lang in Language]: string | ((args: any) => string)
	}
}

export const languageAtom = atom<Language>('en')
export const translationsAtom = atom<Translations>(lang)
export type i18nFunction = (key: string, args?: any, lang?: Language) => string

export const i18nAtom = atom((get) => (key: string, args?: any, lang?: Language) => {
	const language = lang || get(languageAtom)
	const translations = get(translationsAtom)
	const translation = translations[key]?.[language] || translations[key]?.en

	if (typeof translation === 'function') {
		return translation(args)
	}

	if (typeof translation === 'string') {
		return translation
	}

	return key
})
