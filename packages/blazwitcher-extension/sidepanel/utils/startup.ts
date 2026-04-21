import { PAGE_STORAGE_LANGUAGE_KEY, PAGE_STORAGE_THEME_COLOR, ThemeColor } from '~shared/constants'
import { isDarkMode } from '~shared/utils'
import { getSyncValueWithWebStorageFallback } from '~sidepanel/atom/common'
import { setThemeClass } from '~sidepanel/hooks/useTheme'

let isStartup = false

/**
 * 启动时初始化主题和语言。
 * 优先从 chrome.storage.sync 读取；若缺失则从旧 localStorage 回退并懒迁移。
 */
export function startup() {
	if (isStartup) return
	isStartup = true
	// 异步读取，不阻塞首屏；useTheme/useLanguage 会在 React 挂载后从 atom 再次应用
	void initThemeAndLang()
}

async function initThemeAndLang() {
	const [themeVal, langVal] = await Promise.all([
		getSyncValueWithWebStorageFallback(PAGE_STORAGE_THEME_COLOR, ThemeColor.System),
		getSyncValueWithWebStorageFallback(PAGE_STORAGE_LANGUAGE_KEY, getDefaultLanguage()),
	])

	setTheme(themeVal)
	setLang(langVal)
}

function setTheme(theme: unknown) {
	const isDark = theme ? isDarkMode(theme as ThemeColor) : false
	setThemeClass(isDark)
	const body = document.body
	body.style.setProperty('background', 'var(--color-normal-bg)', 'important')
	body.style.setProperty(
		'background-image',
		'linear-gradient(var(--color-linear-bg-start) 0%, var(--color-linear-bg-end) 100%)',
		'important'
	)
}

function setLang(lang: unknown) {
	const language = lang === 'zh' || lang === 'en' ? lang : getDefaultLanguage()
	const langCode = language === 'zh' ? 'zh-CN' : 'en'
	document.documentElement.setAttribute('lang', langCode)
}

function getDefaultLanguage() {
	return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
