import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_WINDOW_CONFIG, SEARCH_WINDOW_HEIGHT, SEARCH_WINDOW_WIDTH } from '~shared/constants'

export interface WindowConfig {
	displayMode: 'iframe' | 'fullscreen'
	width: number
	height: number
}

const defaultWindowConfig = {
	displayMode: 'iframe',
	width: SEARCH_WINDOW_WIDTH,
	height: SEARCH_WINDOW_HEIGHT,
}

const createStorageAtom = <T>(key: string, defaultValue: T) =>
	atomWithStorage<T>(key, defaultValue, {
		async getItem(key, initialValue) {
			const storedValue = await chrome.storage.local.get(key)
			return key in storedValue ? storedValue[key] : initialValue
		},
		async setItem(key, value) {
			await chrome.storage.local.set({ [key]: value })
		},
		async removeItem(key) {
			await chrome.storage.local.remove(key)
		},
	})

export const displayModeAtom = createStorageAtom(
	`${DEFAULT_WINDOW_CONFIG}_displayMode`,
	defaultWindowConfig.displayMode
)
export const widthAtom = createStorageAtom(`${DEFAULT_WINDOW_CONFIG}_width`, defaultWindowConfig.width)
export const heightAtom = createStorageAtom(`${DEFAULT_WINDOW_CONFIG}_height`, defaultWindowConfig.height)

export const windowConfigAtom = atom(
	(get) => ({
		displayMode: get(displayModeAtom),
		width: get(widthAtom),
		height: get(heightAtom),
	}),
	(_, set, newValue: Partial<WindowConfig>) => {
		if ('displayMode' in newValue) set(displayModeAtom, newValue.displayMode)
		if ('width' in newValue) set(widthAtom, newValue.width)
		if ('height' in newValue) set(heightAtom, newValue.height)
	}
)

export const restoreWindowConfigAtom = atom(null, (_, set) => {
	set(displayModeAtom, defaultWindowConfig.displayMode)
	set(widthAtom, defaultWindowConfig.width)
	set(heightAtom, defaultWindowConfig.height)
})
