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
	// 配置页的多语言
	appearance: {
		[LanguageType.zh]: '外观',
		[LanguageType.en]: 'Appearance',
	},
	keyboard: {
		[LanguageType.zh]: '快捷键',
		[LanguageType.en]: 'Keyboard',
	},
	search: {
		[LanguageType.zh]: '搜索',
		[LanguageType.en]: 'Search',
	},
	themeSettings: {
		[LanguageType.zh]: '主题设置',
		[LanguageType.en]: 'Theme Settings',
	},
	appearanceMode: {
		[LanguageType.zh]: '外观模式',
		[LanguageType.en]: 'Appearance Mode',
	},
	light: {
		[LanguageType.zh]: '浅色',
		[LanguageType.en]: 'Light',
	},
	dark: {
		[LanguageType.zh]: '深色',
		[LanguageType.en]: 'Dark',
	},
	followSystem: {
		[LanguageType.zh]: '跟随系统',
		[LanguageType.en]: 'Follow System',
	},
	windowSize: {
		[LanguageType.zh]: '窗口大小',
		[LanguageType.en]: 'Window Size',
	},
	small: {
		[LanguageType.zh]: '小',
		[LanguageType.en]: 'Small',
	},
	medium: {
		[LanguageType.zh]: '中',
		[LanguageType.en]: 'Medium',
	},
	large: {
		[LanguageType.zh]: '大',
		[LanguageType.en]: 'Large',
	},
	language: {
		[LanguageType.zh]: '语言',
		[LanguageType.en]: 'Language',
	},
	keyboardSettings: {
		[LanguageType.zh]: '快捷键设置',
		[LanguageType.en]: 'Keyboard Settings',
	},
	openExtension: {
		[LanguageType.zh]: '打开扩展',
		[LanguageType.en]: 'Open Extension',
	},
	openExtensionDesc: {
		[LanguageType.zh]: '快速打开扩展面板',
		[LanguageType.en]: 'Quickly open the extension panel',
	},
	deleteTab: {
		[LanguageType.zh]: '删除标签',
		[LanguageType.en]: 'Delete Tab',
	},
	deleteTabDesc: {
		[LanguageType.zh]: '关闭当前标签页',
		[LanguageType.en]: 'Close current tab',
	},
	openInNewWindow: {
		[LanguageType.zh]: '在新窗口打开标签',
		[LanguageType.en]: 'Open in New Window',
	},
	openInNewWindowDesc: {
		[LanguageType.zh]: '在新窗口中打开标签',
		[LanguageType.en]: 'Open tab in new window',
	},
	searchHistory: {
		[LanguageType.zh]: '在历史记录中搜索',
		[LanguageType.en]: 'Search in History',
	},
	searchHistoryDesc: {
		[LanguageType.zh]: '搜索浏览历史',
		[LanguageType.en]: 'Search browsing history',
	},
	edit: {
		[LanguageType.zh]: '编辑',
		[LanguageType.en]: 'Edit',
	},
	editShortcut: {
		[LanguageType.zh]: '编辑快捷键',
		[LanguageType.en]: 'Edit Shortcut',
	},
	currentAction: {
		[LanguageType.zh]: '当前操作',
		[LanguageType.en]: 'Current Action',
	},
	functionDescription: {
		[LanguageType.zh]: '功能说明',
		[LanguageType.en]: 'Function Description',
	},
	shortcut: {
		[LanguageType.zh]: '快捷键',
		[LanguageType.en]: 'Shortcut',
	},
	pressShortcut: {
		[LanguageType.zh]: '请按下快捷键组合',
		[LanguageType.en]: 'Press shortcut combination',
	},
	pleaseInputShortcut: {
		[LanguageType.zh]: '请输入快捷键',
		[LanguageType.en]: 'Please input shortcut',
	},
	shortcutAlreadyUsed: {
		[LanguageType.zh]: '该快捷键已被使用',
		[LanguageType.en]: 'This shortcut is already in use',
	},
	searchSettings: {
		[LanguageType.zh]: '搜索参数设置',
		[LanguageType.en]: 'Search Settings',
	},
	searchHistoryCount: {
		[LanguageType.zh]: '可回溯搜索的条数',
		[LanguageType.en]: 'Number of searchable history items',
	},
	searchHistoryDays: {
		[LanguageType.zh]: '回溯历史记录时间（天）',
		[LanguageType.en]: 'History search time range (days)',
	},
	searchSourceConfig: {
		[LanguageType.zh]: '搜索源配置',
		[LanguageType.en]: 'Search Source Configuration',
	},
	defaultSearchType: {
		[LanguageType.zh]: '默认检索类型',
		[LanguageType.en]: 'Default Search Type',
	},
}
