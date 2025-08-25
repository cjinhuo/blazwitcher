import { PAGE_STORAGE_THEME_COLOR } from '~shared/constants'
import { isDarkMode } from '~shared/utils'
import { setThemeClass } from '~sidepanel/hooks/useTheme'

let isStartup = false
export function startup() {
	if (isStartup) return
	isStartup = true
	setTheme()
	setLang()
}

function setTheme() {
	const theme = localStorage.getItem(PAGE_STORAGE_THEME_COLOR)
	const isDark = theme ? isDarkMode(JSON.parse(theme)) : false
	setThemeClass(isDark)
	// 这时候的 --color-normal-bg 变量才有 dark 模式的值
	const body = document.body
	body.style.background = 'var(--color-normal-bg)'
	body.style.backgroundImage = 'linear-gradient(var(--color-linear-bg-start) 0%, var(--color-linear-bg-end) 100%)'
}

function setLang() {
	const PAGE_STORAGE_LANGUAGE_KEY = 'language'
	// 获取默认语言（基于浏览器语言）
	const getDefaultLanguage = () => {
		return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
	}
	// 从 localStorage 获取用户设置的语言，如果没有则使用默认语言
	const getUserLanguage = () => {
		try {
			const storedLang = localStorage.getItem(PAGE_STORAGE_LANGUAGE_KEY)
			if (storedLang) {
				return storedLang === 'zh' ? 'zh' : 'en'
			}
		} catch (e) {
			console.warn('Failed to parse stored language:', e)
			return getDefaultLanguage()
		}
		return getDefaultLanguage()
	}

	// 设置 HTML lang 属性
	const setHtmlLang = () => {
		const language = getUserLanguage()
		const langCode = language === 'zh' ? 'zh-CN' : 'en'
		document.documentElement.setAttribute('lang', langCode)
	}

	// 立即设置语言
	setHtmlLang()
}
