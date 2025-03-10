import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { TabGroupColorMap } from '~shared/constants'
import { themeAtom } from '~sidepanel/atom'

const isSystemDarkMode = () => {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

const setThemeClass = (isDark: boolean) => {
	document.body.classList.toggle('dark', isDark)
	if (isDark) {
		document.body.setAttribute('theme-mode', 'dark')
	} else {
		document.body.removeAttribute('theme-mode')
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
