import type { TabGroupColorMapType } from './types'

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

export const GITHUB_URL = 'https://github.com/cjinhuo/blazwitcher'

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

export const DefaultSearchConfig = {
	bookmarkDisplayCount: DEFAULT_BOOKMARK_DISPLAY_COUNT,
	historyDisplayCount: DEFAULT_HISTORY_DISPLAY_COUNT,
	topSuggestionsCount: DEFAULT_TOP_SUGGESTIONS_COUNT,
}

export enum DisplayMode {
	IFRAME = 'iframe',
	ISOLATE_WINDOW = 'isolateWindow',
}

export interface WindowConfig {
	displayMode: DisplayMode
	width: number
	height: number
}

export const DefaultWindowConfig: WindowConfig = {
	displayMode: DisplayMode.ISOLATE_WINDOW,
	width: SEARCH_WINDOW_WIDTH,
	height: SEARCH_WINDOW_HEIGHT,
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

// extension storage keys
export const EXTENSION_STORAGE_HISTORY_MAX_DAYS = 'historyMaxDays'
export const EXTENSION_STORAGE_HISTORY_MAX_RESULTS = 'historyMaxResults'
export const EXTENSION_STORAGE_WINDOW_WIDTH = 'windowWidth'
export const EXTENSION_STORAGE_WINDOW_HEIGHT = 'windowHeight'
export const EXTENSION_STORAGE_DISPLAY_MODE = 'displayMode'
