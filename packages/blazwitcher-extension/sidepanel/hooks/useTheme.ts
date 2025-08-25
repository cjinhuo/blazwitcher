import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { TabGroupColorMap } from '~shared/constants'
import { themeAtom } from '~sidepanel/atom'

const isSystemDarkMode = () => {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

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
}

export const isDarkMode = (theme: 'light' | 'dark' | 'system') =>
	theme === 'dark' || (theme === 'system' && isSystemDarkMode())

export const useTheme = () => {
	const themeColor = useAtomValue(themeAtom)

	useEffect(() => {
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
