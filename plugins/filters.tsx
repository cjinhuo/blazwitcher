import BookmarkSvg from 'react:~assets/bookmark.svg'
import HistorySvg from 'react:~assets/history.svg'
import TabSvg from 'react:~assets/tab.svg'
import type { CommandPlugin } from '~shared/types'
import { isBookmarkItem, isHistoryItem, isTabItem } from '~shared/utils'
export const filterByBookmarkPlugin: CommandPlugin = {
	command: '/b',
	icon: <BookmarkSvg width={24} height={24} />,
	description: 'Search from bookmarks',
	dataProcessing: (originalData) => originalData.filter(isBookmarkItem),
}

export const filterByHistoryPlugin: CommandPlugin = {
	command: '/h',
	icon: <HistorySvg width={24} height={24} />,
	description: 'Search from histories',
	dataProcessing: (originalData) => originalData.filter(isHistoryItem),
}

export const filterByTabPlugin: CommandPlugin = {
	command: '/t',
	icon: <TabSvg width={24} height={24} />,
	description: 'Search from opened tabs',
	dataProcessing: (originalData) => originalData.filter(isTabItem),
}
