import BookmarkSvg from 'react:~assets/bookmark.svg'
import DuplicateSvg from 'react:~assets/duplicate.svg'
import HistorySvg from 'react:~assets/history.svg'
import PinSvg from 'react:~assets/pin.svg'
import TabSvg from 'react:~assets/tab.svg'
import type { CommandPlugin } from '~shared/types'
import { duplicateCurrentTab, isBookmarkItem, isHistoryItem, isTabItem, pinCurrentTab } from '~shared/utils'
import type { i18nFunction } from '~sidepanel/atom'

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

export const pinCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/pin',
	icon: <PinSvg width={24} height={24} />,
	description: i18n('pinCurrentTab'),
	render: () => {
		pinCurrentTab()
		return null
	},
})

export const duplicateCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/duplicate',
	icon: <DuplicateSvg width={24} height={24} />,
	description: i18n('duplicateCurrentTab'),
	render: () => {
		duplicateCurrentTab()
		return null
	},
})
