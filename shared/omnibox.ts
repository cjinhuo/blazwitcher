import { ItemType, type ListItemType } from './types'
import { escapeXml, orderList, searchWithList } from './utils'

const highlightText = (text: string, ranges: [number, number][]) => {
	if (!ranges?.length) return escapeXml(text)

	let result = ''
	let lastIndex = 0

	ranges.forEach(([start, end]) => {
		// Add non-matching text
		result += escapeXml(text.slice(lastIndex, start))
		// Add matching text with highlight
		result += '<match>这是中文，将不会被高亮</match><match>this is english, will be highlighted</match>'
		lastIndex = end + 1
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
		data = await getProcessedData()
	})

	// Handle user input
	chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
		console.log('input', text, data)
		const temp = [
			{
				content: 'test_1',
				deletable: false,
				description: '<match>这是中文，将不会被高亮</match>  <match>this is english, will be highlighted</match>',
			},
			{
				content: 'test_2',
				deletable: false,
				description: '<match>这是中文，将不会被高亮</match>  <match>this is english, will be highlighted</match>',
			},
			{
				content: 'test_3',
				deletable: false,
				description: '<match>这是中文，将不会被高亮</match>  <match>this is english, will be highlighted</match>',
			},
		]
		// const suggestions = orderList(searchWithList(data, text))
		// 	.map(({ data, itemType }) => {
		// 		const { hostHitRanges, titleHitRanges, title, host, url } = data
		// 		if (itemType === ItemType.Tab) {
		// 			return {
		// 				content: String(data.id),
		// 				deletable: false,
		// 				description: '<match>这是中文，将不会被高亮</match><match>this is english, will be highlighted</match>',
		// 			}
		// 		}
		// 		return {
		// 			content: url,
		// 			deletable: false,
		// 			description: '<match>这是中文，将不会被高亮</match><match>this is english, will be highlighted</match>',
		// 		}
		// 	})
		// 	.slice(0, 8)
		// console.log('suggestions', suggestions)

		suggest(temp)
	})

	// Handle when user selects a suggestion
	chrome.omnibox.onInputEntered.addListener((text, disposition) => {
		// 将 text 转成 number ，如果能转则表示是 tab，否则表示是 url
		// const id = Number(text)
		// if (!Number.isNaN(id)) {
		// 	chrome.windows.update(id, { focused: true })
		// 	chrome.tabs.update(id, { active: true })
		// } else {
		// 	chrome.tabs.create({ url: text })
		// }
	})
}
