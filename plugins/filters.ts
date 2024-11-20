import type { CommandPlugin } from '~shared/types'
import { isBookmarkItem, isHistoryItem, isTabItem } from '~shared/utils'

export const filterByBookmarkPlugin: CommandPlugin = {
	command: '/b',
	placeholder: 'Search from bookmarks',
	dataProcessing: (originalData) => originalData.filter(isBookmarkItem),
}

export const filterByHistoryPlugin: CommandPlugin = {
	command: '/h',
	placeholder: 'Search from histories',
	dataProcessing: (originalData) => originalData.filter(isHistoryItem),
}

export const filterByTabPlugin: CommandPlugin = {
	command: '/t',
	placeholder: 'Search from opened tabs',
	dataProcessing: (originalData) => originalData.filter(isTabItem),
}
