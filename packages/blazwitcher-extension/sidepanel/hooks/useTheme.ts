import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { formatFontFamily } from '~plugins/ui'
import { TabGroupColorMap } from '~shared/constants'
import { isDarkMode } from '~shared/utils'
import { fontFamilyAtom, themeAtom } from '~sidepanel/atom'

export const setThemeClass = (isDark: boolean) => {
	const body = document.body
	if (isDark) {
		// 控制 skin.css 变量
		body.classList.add('dark')
		// 控制 semi 的主题
		body.setAttribute('theme-mode', 'dark')
	} else {
		body.removeAttribute('theme-mode')
		body.classList.remove('dark')
	}
}

export const setFontFamily = (fontFamily: string) => {
	const body = document.body
	if (!fontFamily) {
		body.style.removeProperty('--font-family')
		return
	}
	body.style.setProperty('--font-family', formatFontFamily(fontFamily))
}

export const useTheme = () => {
	const themeColor = useAtomValue(themeAtom)
	const fontFamily = useAtomValue(fontFamilyAtom)

	useEffect(() => {
		// theme 已由 themeAtom 写入 chrome.storage.sync，无需在此重复写入；getWindowConfig 从 sync 读取
		setThemeClass(isDarkMode(themeColor))
	}, [themeColor])

	useEffect(() => {
		setFontFamily(fontFamily)
	}, [fontFamily])
}

export const useColorMap = () => {
	const themeColor = useAtomValue(themeAtom)
	const colorMap = useMemo(
		() => (isDarkMode(themeColor) ? TabGroupColorMap.dark : TabGroupColorMap.light),
		[themeColor]
	)
	return colorMap
}
