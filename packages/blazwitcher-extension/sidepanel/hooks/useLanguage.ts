import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { languageAtom } from '~sidepanel/atom'

export const useLanguage = () => {
	const language = useAtomValue(languageAtom)

	// 监听语言变化，动态更新 HTML lang 属性
	useEffect(() => {
		const langValue = language === 'zh' ? 'zh-CN' : 'en'
		document.documentElement.lang = langValue
	}, [language])
}
