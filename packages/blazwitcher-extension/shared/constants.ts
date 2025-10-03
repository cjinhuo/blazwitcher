import { ItemType, type TabGroupColorMapType } from './types'

// class name
export const MAIN_CONTENT_CLASS = 'main-content'
export const LIST_ITEM_ACTIVE_CLASS = 'list-item__active'
export const VISIBILITY_CLASS = 'list-visibility'
export const DIVIDE_CLASS = 'divide-item'

// local storage key
export const SELF_WINDOW_ID_KEY = 'selfWindowId'
export const SELF_WINDOW_STATE = 'selfWindowState'
export const LAST_ACTIVE_WINDOW_ID_KEY = 'lastActiveWindowId'

// message type
export const MAIN_WINDOW = 'MAIN_WINDOW'

// context menu
export const CONTEXT_MENU_SHORTCUT = {
	id: 'open_shortcut',
	title: 'Set Keyboard Shortcuts',
}

export const CONTEXT_MENU_HOMEPAGE = {
	id: 'open_homepage',
	title: 'Open Homepage',
}

export enum LanguageType {
	zh = 'zh',
	en = 'en',
}

export const PERSONAL_GITHUB_URL = 'https://github.com/cjinhuo'
export const GITHUB_URL = `${PERSONAL_GITHUB_URL}/blazwitcher`
export const GITHUB_ISSUE_URL = `${GITHUB_URL}/issues/new?template=feature_bug.md`
export const BLOG_URL = 'https://cjinhuo.github.io'
export const EMAIL_URL = 'cjinhuo@qq.com'

export const CHROME_EXTENSIONS_SHORTCUTS_URL = 'chrome://extensions/shortcuts'

export const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000

// store in extension storage
export const SEARCH_WINDOW_WIDTH = 760
export const SEARCH_WINDOW_HEIGHT = 505
export const DEFAULT_HISTORY_MAX_DAYS = 14
export const DEFAULT_HISTORY_MAX_RESULTS = 1000

// store in web storage
export const DEFAULT_BOOKMARK_DISPLAY_COUNT = 10
export const DEFAULT_HISTORY_DISPLAY_COUNT = 10
export const DEFAULT_TOP_SUGGESTIONS_COUNT = 2
export const DEFAULT_ENABLE_CONSECUTIVE_SEARCH = false

export const DefaultSearchConfig = {
	bookmarkDisplayCount: DEFAULT_BOOKMARK_DISPLAY_COUNT,
	historyDisplayCount: DEFAULT_HISTORY_DISPLAY_COUNT,
	topSuggestionsCount: DEFAULT_TOP_SUGGESTIONS_COUNT,
	enableConsecutiveSearch: DEFAULT_ENABLE_CONSECUTIVE_SEARCH,
}

export enum DebugMode {
	OFF = 'off',
	ON = 'on',
}

export enum DisplayMode {
	IFRAME = 'iframe',
	ISOLATE_WINDOW = 'isolateWindow',
}

export enum ThemeColor {
	Light = 'light',
	Dark = 'dark',
	System = 'system',
}

export const URL_DARK_PARAM = 'is_system_dark'

export const BodyBackgroundThemeColorMap = {
	[ThemeColor.Light]: 'rgb(255, 255, 255)',
	[ThemeColor.Dark]: 'rgb(33, 34, 34)',
}

export interface WindowConfig {
	displayMode: DisplayMode
	width: number
	height: number
	theme: ThemeColor
	debugMode: DebugMode
}

export const DefaultWindowConfig: WindowConfig = {
	displayMode: DisplayMode.ISOLATE_WINDOW,
	width: SEARCH_WINDOW_WIDTH,
	height: SEARCH_WINDOW_HEIGHT,
	theme: ThemeColor.System,
	debugMode: DebugMode.OFF,
}

export const TabGroupColorMap: TabGroupColorMapType = {
	light: {
		grey: '#E8EAED',
		blue: '#1A73E8',
		red: '#D93025',
		yellow: '#F9AB00',
		green: '#188038',
		pink: '#E52592',
		purple: '#A142F4',
		cyan: '#01A9B4',
		orange: '#FA903E',
	},
	dark: {
		grey: '#202124',
		blue: '#8AB4F8',
		red: '#F28B82',
		yellow: '#FDD663',
		green: '#81C995',
		pink: '#FF8BCB',
		purple: '#D7AEFB',
		cyan: '#78D9EC',
		orange: '#FBA65C',
	},
}

// search
export const DEFAULT_STRICTNESS_COEFFICIENT = 0.6

export const PAGE_STORAGE_LANGUAGE_KEY = 'language'
export const PAGE_STORAGE_SHORTCUT_MAPPINGS = 'shortcut_mappings'
export const PAGE_STORAGE_THEME_COLOR = 'theme_color'
export const PAGE_STORAGE_SEARCH_CONFIG = 'search_config'
export const PAGE_STORAGE_SHOW_UPDATE_NOTIFICATION = 'show_update_notification'

// extension storage keys
export const EXTENSION_STORAGE_HISTORY_MAX_DAYS = 'historyMaxDays'
export const EXTENSION_STORAGE_HISTORY_MAX_RESULTS = 'historyMaxResults'
export const EXTENSION_STORAGE_WINDOW_WIDTH = 'windowWidth'
export const EXTENSION_STORAGE_WINDOW_HEIGHT = 'windowHeight'
export const EXTENSION_STORAGE_DISPLAY_MODE = 'displayMode'
export const EXTENSION_STORAGE_THEME = PAGE_STORAGE_THEME_COLOR
export const EXTENSION_STORAGE_DEBUG_MODE = 'debugMode'

export const FOOTER_DESCRIPTION_I18N_MAP = {
	[ItemType.Tab]: 'tab_footer_description',
	[ItemType.Bookmark]: 'bookmark_footer_description',
	[ItemType.History]: 'history_footer_description',
	[ItemType.Plugin]: 'plugin_footer_description',
} as const

export enum SettingPanelKey {
	APPEARANCE = 'appearance',
	KEYBOARD = 'keyboard',
	SEARCH = 'search',
	CHANGELOG = 'changelog',
	CONTACT = 'contact',
}

// ai tab group
export const AI_TAB_GROUP_MESSAGE_TYPE = 'tabGroupProgressUpdate'
export const ERROR_MESSAGE_TYPE = 'errorMessage'
export const HANDLE_TAB_GROUP_MESSAGE_TYPE = 'handleTabGroupOperations'
export const RESET_AI_TAB_GROUP_MESSAGE_TYPE = 'resetAITabGroupOperations'
export const SSE_DONE_MARK = '[DONE]'
export const chunkSize = 10
// parse stream mark
export const STATISTICS_MARK = '"statistics"'
export const ADD_TO_EXISTING_GROUPS_MARK = '"addToExistingGroups"'
export const CREATE_NEW_GROUPS_MARK = '"createNewGroups"'
