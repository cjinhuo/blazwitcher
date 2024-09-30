// class name
export const MAIN_CONTENT_CLASS = 'main-content'
export const LIST_ITEM_ACTIVE_CLASS = 'list-item__active'
export const VISIBILITY_CLASS = 'list-visibility'

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

export const GITHUB_URL = 'https://github.com/cjinhuo/blazwitcher'

export const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000

// config
export const DEFAULT_HISTORY_MAX_DAYS = 14
export const DEFAULT_HISTORY_MAX_RESULTS = 200
export const DEFAULT_BOOKMARK_DISPLAY_COUNT = 20
export const DEFAULT_HISTORY_DISPLAY_COUNT = 20

export const tabGroupColorMap = {
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
	lightFont: {
		grey: 'var(--color-neutral-3)',
		blue: 'var(--color-neutral-3)',
		red: 'var(--color-neutral-3)',
		yellow: 'var(--color-neutral-10)',
		green: 'var(--color-neutral-3)',
		pink: 'var(--color-neutral-3)',
		purple: 'var(--color-neutral-3)',
		cyan: 'var(--color-neutral-3)',
		orange: 'var(--color-neutral-10)',
	},
	darkFont: {
		grey: 'var(--color-neutral-10)',
		blue: 'var(--color-neutral-10)',
		red: 'var(--color-neutral-10)',
		yellow: 'var(--color-neutral-10)',
		green: 'var(--color-neutral-10)',
		pink: 'var(--color-neutral-10)',
		purple: 'var(--color-neutral-10)',
		cyan: 'var(--color-neutral-10)',
		orange: 'var(--color-neutral-10)',
	},
}

// search
export const DEFAULT_STRICTNESS_COEFFICIENT = 0.6
