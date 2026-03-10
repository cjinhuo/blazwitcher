import { PAGE_STORAGE_LANGUAGE_KEY, PAGE_STORAGE_THEME_COLOR, ThemeColor } from '~shared/constants'
import { storageGetLocal, storageGetSync } from '~shared/promisify'
import { isDarkMode } from '~shared/utils'
import { setThemeClass } from '~sidepanel/hooks/useTheme'

let isStartup = false

/**
 * 启动时初始化主题和语言。
 * 优先从 chrome.storage.sync 读取（云端同步），若无则从 local / localStorage 回退以兼容旧版本。
 */
export function startup() {
	if (isStartup) return
	isStartup = true
	// 异步读取，不阻塞首屏；useTheme/useLanguage 会在 React 挂载后从 atom 再次应用
	void initThemeAndLang()
}

async function initThemeAndLang() {
	const sync = await storageGetSync()
	const hasSyncTheme = PAGE_STORAGE_THEME_COLOR in sync
	const hasSyncLang = PAGE_STORAGE_LANGUAGE_KEY in sync
	const source = hasSyncTheme || hasSyncLang ? sync : await storageGetLocal()

	const theme = source?.[PAGE_STORAGE_THEME_COLOR]
	const lang = source?.[PAGE_STORAGE_LANGUAGE_KEY]

	// 若 extension storage 都没有，再尝试 localStorage（旧版本遗留）
	const themeVal =
		theme ??
		(() => {
			try {
				const raw = localStorage.getItem(PAGE_STORAGE_THEME_COLOR)
				return raw ? JSON.parse(raw) : null
			} catch {
				return null
			}
		})()
	const langVal =
		lang ??
		(() => {
			try {
				return localStorage.getItem(PAGE_STORAGE_LANGUAGE_KEY) ?? null
			} catch {
				return null
			}
		})()

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
	const getDefaultLanguage = () => (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en')
	const language = lang === 'zh' || lang === 'en' ? lang : getDefaultLanguage()
	const langCode = language === 'zh' ? 'zh-CN' : 'en'
	document.documentElement.setAttribute('lang', langCode)
}
