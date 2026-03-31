import { useEffect, useState } from 'react'
import { getFontList } from '~shared/promisify'
import type { FontOption } from '~shared/types'
import useI18n from './useI18n'

export default function useFontOptions() {
	const i18n = useI18n()
	const [fontOptions, setFontOptions] = useState<FontOption[]>([])

	useEffect(() => {
		const fetchFonts = async () => {
			const options = [
				{ label: i18n('fontDefault'), value: '' },
				{ label: i18n('fontSystem'), value: 'system-ui' },
			]

			try {
				// Use Chrome Extension API to get system fonts - this won't trigger a permission prompt blur
				const fonts = await getFontList()
				if (fonts.length > 0) {
					const systemFonts = fonts
						.map((f) => ({ label: f.displayName, value: f.fontId }))
						.sort((a, b) => a.label.localeCompare(b.label))

					setFontOptions([...options, ...systemFonts])
				} else {
					setFontOptions(options)
				}
			} catch (e) {
				console.error('Failed to get font list:', e)
				setFontOptions(options)
			}
		}
		fetchFonts()
	}, [i18n])

	return fontOptions
}
