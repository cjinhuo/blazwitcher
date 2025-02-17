import { LanguageType } from '~shared/constants'
export const lang = {
	emptySearch: {
		[LanguageType.zh]: '搜索无结果',
		[LanguageType.en]: 'No Results Found',
	},
	topSuggestions: {
		[LanguageType.zh]: '最优建议',
		[LanguageType.en]: 'Top Suggestions',
	},
	openedTabs: {
		[LanguageType.zh]: '已打开标签页',
		[LanguageType.en]: 'Opened Tabs',
	},
	recentHistories: {
		[LanguageType.zh]: '最近历史记录',
		[LanguageType.en]: 'Recent Histories',
	},
	bookmarks: {
		[LanguageType.zh]: '书签',
		[LanguageType.en]: 'Bookmarks',
	},
	bookmark: {
		[LanguageType.zh]: '书签',
		[LanguageType.en]: 'Bookmark',
	},
	tab: {
		[LanguageType.zh]: '标签页',
		[LanguageType.en]: 'Tab',
	},
	history: {
		[LanguageType.zh]: '历史记录',
		[LanguageType.en]: 'History',
	},
	active: {
		[LanguageType.zh]: '激活中',
		[LanguageType.en]: 'Active',
	},
	justVisited: {
		[LanguageType.zh]: '刚刚访问过',
		[LanguageType.en]: 'Just visited',
	},
	visitedSecondsAgo: {
		[LanguageType.zh]: (seconds: number) => `${seconds} 秒前访问`,
		[LanguageType.en]: (seconds: number) => `Visited ${seconds} seconds ago`,
	},
	visitedMinutesAgo: {
		[LanguageType.zh]: (minutes: number) => `${minutes} 分钟前访问`,
		[LanguageType.en]: (minutes: number) => `Visited ${minutes} minutes ago`,
	},
	visitedHoursAgo: {
		[LanguageType.zh]: (hours: number) => `${hours} 小时前访问`,
		[LanguageType.en]: (hours: number) => `Visited ${hours} hours ago`,
	},
	visitedDaysAgo: {
		[LanguageType.zh]: (days: number) => `${days} 天前访问`,
		[LanguageType.en]: (days: number) => `Visited ${days} days ago`,
	},
	visitedWeeksAgo: {
		[LanguageType.zh]: (weeks: number) => `${weeks} 周前访问`,
		[LanguageType.en]: (weeks: number) => `Visited ${weeks} weeks ago`,
	},
	placeholder: {
		[LanguageType.zh]: '输入搜索内容',
		[LanguageType.en]: 'Type to search',
	},
	searchBookmark: {
		[LanguageType.zh]: '在书签中搜索',
		[LanguageType.en]: 'Search from bookmarks',
	},
	searchHistory: {
		[LanguageType.zh]: '在历史记录中搜索',
		[LanguageType.en]: 'Search from history',
	},
	searchOpenTab: {
		[LanguageType.zh]: '在打开的标签页中搜索',
		[LanguageType.en]: 'Search from opened tabs',
	},
	setting: {
		[LanguageType.zh]: '设置',
		[LanguageType.en]: 'Setting',
	},
	settingPage: {
		[LanguageType.zh]: '设置页',
		[LanguageType.en]: 'Setting Page',
	},
}
