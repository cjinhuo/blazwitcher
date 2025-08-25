import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { PAGE_STORAGE_THEME_COLOR, TabGroupColorMap } from '~shared/constants'
import { storageSetLocal } from '~shared/promisify'
import { isDarkMode } from '~shared/utils'
import { themeAtom } from '~sidepanel/atom'

export const setThemeClass = (isDark: boolean) => {
	if (isDark) {
		// 控制 skin.css 变量
		document.body.classList.add('dark')
		// 控制 semi 的主题
		document.body.setAttribute('theme-mode', 'dark')
	} else {
		document.body.removeAttribute('theme-mode')
		document.body.classList.remove('dark')
	}
	// 这时候的 --color-normal-bg 变量才有 dark 模式的值
	document.body.style.background = 'var(--color-normal-bg)'
	document.body.style.backgroundImage =
		'linear-gradient(var(--color-linear-bg-start) 0%, var(--color-linear-bg-end) 100%)'
}

export const useTheme = () => {
	const themeColor = useAtomValue(themeAtom)

	useEffect(() => {
		// 同步到 chrome.storage.local
		storageSetLocal({
			[PAGE_STORAGE_THEME_COLOR]: themeColor,
		})
		setThemeClass(isDarkMode(themeColor))
	}, [themeColor])
}

export const useColorMap = () => {
	const themeColor = useAtomValue(themeAtom)
	const colorMap = useMemo(
		() => (isDarkMode(themeColor) ? TabGroupColorMap.dark : TabGroupColorMap.light),
		[themeColor]
	)
	return colorMap
}
