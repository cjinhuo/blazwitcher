import { createContext, useContext } from 'react'

export type VideoLocale = 'zh' | 'en'
export const VideoLocaleContext = createContext<VideoLocale>('zh')

type SceneCopy = { title: [string, string]; description: string }
type VideoCopy = {
	intro: SceneCopy
	search: SceneCopy
	sources: SceneCopy
	settings: SceneCopy
	grouping: SceneCopy
	openSearch: string
	openResult: string
	sourceLabels: [string, string, string]
	settingLabels: [string, string]
	groupingLabels: [string, string, string]
	outro: { title: [string, string]; features: string; cta: string }
}

export const videoCopy: Record<VideoLocale, VideoCopy> = {
	zh: {
		intro: { title: ['标签太多，', '目标太难找。'], description: '打开的页面越来越多。\n你要找的，究竟在哪一个？' },
		search: {
			title: ['想到名字，', '拼音就能找到。'],
			description: '拼音、首字母、中英文混合搜索。\n从你记得的几个字开始。',
		},
		sources: {
			title: ['一个入口，', '三种来源。'],
			description: '标签、书签、历史记录，统一搜索。\n用 / 指令，直达筛选和设置。',
		},
		settings: { title: ['顺手的习惯，', '由你来定。'], description: '主题、语言、搜索范围。\n在 /s 中按习惯调整。' },
		grouping: { title: ['让 AI，', '理清标签。'], description: '智能整理当前窗口的标签页。\n浏览器，终于井然有序。' },
		openSearch: '唤醒搜索',
		openResult: '直达目标',
		sourceLabels: ['标签', '书签', '历史'],
		settingLabels: ['外观与语言', '搜索范围与数量'],
		groupingLabels: ['按内容聚合', '自动归类', '保持条理'],
		outro: {
			title: ['少一点寻找。', '多一点专注。'],
			features: '拼音搜索 · 统一检索 · AI 标签分组',
			cta: '在 Chrome 中体验 Blazwitcher',
		},
	},
	en: {
		intro: {
			title: ['Too many tabs.', 'Where’s that page?'],
			description: 'Pages keep piling up.\nFind the one you had in mind.',
		},
		search: {
			title: ['Think of a name.', 'Find it with Pinyin.'],
			description: 'Type Pinyin, initials, or mixed text.\nStart with the few words you remember.',
		},
		sources: {
			title: ['One search.', 'Three sources.'],
			description: 'Tabs, bookmarks, and history, together.\nUse / commands to filter and configure.',
		},
		settings: {
			title: ['Your workflow.', 'Your way.'],
			description: 'Theme, language, and search scope.\nOpen /s to make it yours.',
		},
		grouping: {
			title: ['Let AI bring', 'order to your tabs.'],
			description: 'Organize the tabs in your current window.\nBring a little order to your browsing.',
		},
		openSearch: 'Open search',
		openResult: 'Open result',
		sourceLabels: ['Tabs', 'Bookmarks', 'History'],
		settingLabels: ['Appearance & language', 'Search scope & limits'],
		groupingLabels: ['By content', 'Auto grouped', 'Stay organized'],
		outro: {
			title: ['Less searching.', 'More focus.'],
			features: 'Pinyin search · Unified search · AI tab grouping',
			cta: 'Try Blazwitcher in Chrome',
		},
	},
}

export const useVideoCopy = () => videoCopy[useContext(VideoLocaleContext)]
