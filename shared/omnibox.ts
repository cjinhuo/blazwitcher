import type { ListItemType } from './types'
import { escapeXml, orderList, searchWithList } from './utils'

const highlightText = (text: string, ranges: [number, number][]) => {
	if (!ranges?.length) return escapeXml(text)

	let result = ''
	let lastIndex = 0

	ranges.forEach(([start, end]) => {
		// Add non-matching text
		result += escapeXml(text.slice(lastIndex, start))
		// Add matching text with highlight
		result += `<match>${escapeXml(text.slice(start, end))}</match>`
		lastIndex = end
	})

	// Add remaining text
	result += escapeXml(text.slice(lastIndex))
	return result
}

export const setupOmnibox = async (getProcessedData: () => Promise<ListItemType[]>) => {
	let data: ListItemType[] = []
	// Set default suggestion
	chrome.omnibox.setDefaultSuggestion({
		description: 'Pinyin Search',
	})

	chrome.omnibox.onInputStarted.addListener(async () => {
		const _data = await getProcessedData()
		console.log('omnibox data', _data)
		data = _data
	})

	// Handle user input
	chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
		console.log('input', text, data)
		const suggestions = orderList(searchWithList(data, text))
			.map(({ data, itemType }) => {
				const { hostHitRanges, titleHitRanges, title, host, url } = data
				return {
					content: url,
					deletable: false,
					description: `${highlightText(title, titleHitRanges)} - <url>${highlightText(host, hostHitRanges)}</url>`,
				}
			})
			.slice(0, 8)
		console.log('suggestions', suggestions)

		suggest(suggestions)
	})

	// Handle when user selects a suggestion
	chrome.omnibox.onInputEntered.addListener((text, disposition) => {
		console.log('disposition', text, disposition)
		// chrome.tabs.create({ url })
	})
}
