import { FOOTER_DESCRIPTION_I18N_MAP, LanguageType } from '~shared/constants'

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
	searchOpenTab: {
		[LanguageType.zh]: '在打开的标签页中搜索',
		[LanguageType.en]: 'Search from Opened Tabs',
	},
	searchBookmark: {
		[LanguageType.zh]: '在书签中搜索',
		[LanguageType.en]: 'Search from Bookmarks',
	},
	searchHistory: {
		[LanguageType.zh]: '在历史记录中搜索',
		[LanguageType.en]: 'Search from History',
	},
	setting: {
		[LanguageType.zh]: '设置',
		[LanguageType.en]: 'Setting',
	},
	settingPage: {
		[LanguageType.zh]: '设置页',
		[LanguageType.en]: 'Setting Page',
	},
	WeChatWithRemark: {
		[LanguageType.zh]: 'WeChat(备注: Blazwitcher)',
		[LanguageType.en]: 'WeChat(Remark: Blazwitcher)',
	},
	// 配置页的多语言
	// 外观设置页
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
	contact: {
		[LanguageType.zh]: '联系',
		[LanguageType.en]: 'Contact',
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
	windowMode: {
		[LanguageType.zh]: '窗口模式',
		[LanguageType.en]: 'Window Mode',
	},
	isolatedWindow: {
		[LanguageType.zh]: '独立窗口',
		[LanguageType.en]: 'Isolated Window',
	},
	iframeTooltipDesc: {
		[LanguageType.zh]: '以内嵌iframe的形式打开，失败时会以独立窗口形式打开',
		[LanguageType.en]: 'Open in iframe mode, if failed, it will open in a isolated window',
	},
	isolatedWindowTooltipDesc: {
		[LanguageType.zh]: '非全屏状态下会新开一个独立全屏窗口，全屏状态下优先以 iframe 形式打开',
		[LanguageType.en]:
			'In non-fullscreen mode, it will open a new isolated fullscreen window, and in fullscreen mode, it will open in iframe mode',
	},
	iframeMode: {
		[LanguageType.zh]: '内嵌iframe',
		[LanguageType.en]: 'IFrame',
	},
	windowSize: {
		[LanguageType.zh]: '窗口大小',
		[LanguageType.en]: 'Window Size',
	},
	iframeWidth: {
		[LanguageType.zh]: '宽度',
		[LanguageType.en]: 'Width',
	},
	iframeHeight: {
		[LanguageType.zh]: '高度',
		[LanguageType.en]: 'Height',
	},
	restartRequired: {
		[LanguageType.zh]: '重启扩展后生效',
		[LanguageType.en]: 'Takes effect after restarting the extension',
	},
	language: {
		[LanguageType.zh]: '语言',
		[LanguageType.en]: 'Language',
	},
	// 快捷键设置页
	keyboardSettings: {
		[LanguageType.zh]: '快捷键设置',
		[LanguageType.en]: 'Keyboard Settings',
	},
	deleteFromHistory: {
		[LanguageType.zh]: '从历史记录中删除',
		[LanguageType.en]: 'Delete from History',
	},
	closeTab: {
		[LanguageType.zh]: '关闭当前标签页',
		[LanguageType.en]: 'Close current tab',
	},
	openCurrentTab: {
		[LanguageType.zh]: '打开当前标签',
		[LanguageType.en]: 'Open current tab',
	},
	startExtension: {
		[LanguageType.zh]: '启动扩展',
		[LanguageType.en]: 'Start Extension',
	},
	query: {
		[LanguageType.zh]: '查询',
		[LanguageType.en]: 'Query',
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
	shortcutRequired: {
		[LanguageType.zh]: '请输入快捷键',
		[LanguageType.en]: 'Please input shortcut',
	},
	invalidShortcut: {
		[LanguageType.zh]: '无效的快捷键组合，请至少包含一个修饰键和一个普通键',
		[LanguageType.en]: 'Invalid shortcut combination, must contain at least one modifier key and one regular key',
	},
	duplicateShortcut: {
		[LanguageType.zh]: '该快捷键已被使用',
		[LanguageType.en]: 'This shortcut is already in use',
	},
	unknownOperation: {
		[LanguageType.zh]: '未知按键',
		[LanguageType.en]: 'unknown operation',
	},
	// 搜索参数配置页
	searchSettings: {
		[LanguageType.zh]: '搜索参数设置',
		[LanguageType.en]: 'Search Settings',
	},
	restoreDefaults: {
		[LanguageType.zh]: '恢复默认',
		[LanguageType.en]: 'Restore Defaults',
	},
	historyMaxResults: {
		[LanguageType.zh]: '最多历史记录条数',
		[LanguageType.en]: 'Maximum number of history records',
	},
	historyMaxDays: {
		[LanguageType.zh]: '最长历史记录回溯时间（天）',
		[LanguageType.en]: 'Maximum historical record period(days)',
	},
	bookmarkDisplayCount: {
		[LanguageType.zh]: '书签展示数量',
		[LanguageType.en]: 'Bookmark Display Count',
	},
	historyDisplayCount: {
		[LanguageType.zh]: '历史记录展示数量',
		[LanguageType.en]: 'History Display Count',
	},
	topSuggestionsCount: {
		[LanguageType.zh]: '最优建议数量',
		[LanguageType.en]: 'Top Suggestions Count',
	},
	enableConsecutiveSearch: {
		[LanguageType.zh]: '严格搜索(英文单词要求连续)',
		[LanguageType.en]: 'Strict Search(English words require consecutive)',
	},
	enableConsecutiveSearchDesc: {
		[LanguageType.zh]: '搜索时要求单词连续匹配，如搜索 "hello"，则 "heo" 不会被匹配',
		[LanguageType.en]:
			'Require consecutive word matching when searching, e.g. searching "hello", "heo" will not be matched',
	},
	// footer icon
	settingTooltip: {
		[LanguageType.zh]: '进入设置页面，可自定义外观、搜索参数和快捷键等',
		[LanguageType.en]: 'Enter settings page to customize appearance, search settings, and shortcuts,etc.',
	},
	issueTooltip: {
		[LanguageType.zh]: '提交问题反馈',
		[LanguageType.en]: 'Submit issue feedback',
	},
	githubTooltip: {
		[LanguageType.zh]: '访问 GitHub 获取更多信息',
		[LanguageType.en]: 'Visit GitHub page for more information',
	},
	// footer
	[FOOTER_DESCRIPTION_I18N_MAP.tab]: {
		[LanguageType.zh]: '切换标签页',
		[LanguageType.en]: 'Switch To Tab',
	},
	[FOOTER_DESCRIPTION_I18N_MAP.bookmark]: {
		[LanguageType.zh]: '打开书签',
		[LanguageType.en]: 'Open Bookmark',
	},
	[FOOTER_DESCRIPTION_I18N_MAP.history]: {
		[LanguageType.zh]: '打开历史记录',
		[LanguageType.en]: 'Open History',
	},
	[FOOTER_DESCRIPTION_I18N_MAP.plugin]: {
		[LanguageType.zh]: '启动命令',
		[LanguageType.en]: 'Open Command',
	},
}
