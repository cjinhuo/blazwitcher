import type { FontOption } from '~shared/types'

export function formatFontFamily(fontName: string) {
	return fontName.includes(' ') ? `"${fontName}", monospace` : `${fontName}, monospace`
}

export function renderFontItem(item: FontOption) {
	const fontName = item.value
	return (
		<div style={{ fontFamily: fontName ? formatFontFamily(fontName) : 'inherit', fontSize: '14px' }}>
			{item.label}
		</div>
	)
}

export function renderFontOption(item: FontOption) {
	const fontName = item.value
	return (
		<div
			style={{
				fontFamily: fontName ? formatFontFamily(fontName) : 'inherit',
				fontSize: '14px',
				padding: '4px 0',
			}}
		>
			{item.label}
		</div>
	)
}
