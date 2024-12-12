import BookmarkSvg from 'react:~assets/bookmark.svg'
import HistorySvg from 'react:~assets/history.svg'
import TabSvg from 'react:~assets/tab.svg'
import type { i18nFunction } from '~i18n/atom'
import type { CommandPlugin } from '~shared/types'
import { isBookmarkItem, isHistoryItem, isTabItem } from '~shared/utils'

export const filterByBookmarkPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/b',
	icon: <BookmarkSvg width={24} height={24} />,
	description: i18n('searchBookmark'),
	dataProcessing: (originalData) => originalData.filter(isBookmarkItem),
})

export const filterByHistoryPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/h',
	icon: <HistorySvg width={24} height={24} />,
	description: i18n('searchHistory'),
	dataProcessing: (originalData) => originalData.filter(isHistoryItem),
})

export const filterByTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/t',
	icon: <TabSvg width={24} height={24} />,
	description: i18n('searchOpenTab'),
	dataProcessing: (originalData) => originalData.filter(isTabItem),
})
