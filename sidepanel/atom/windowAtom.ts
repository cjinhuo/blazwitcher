import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_WINDOW_CONFIG, DefaultWindowConfig, DisplayMode, type WindowConfig } from '~shared/constants'
import { storageGetLocal } from '~shared/promisify'

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
	DefaultWindowConfig.displayMode
)
export const widthAtom = createStorageAtom(`${DEFAULT_WINDOW_CONFIG}_width`, DefaultWindowConfig.width)
export const heightAtom = createStorageAtom(`${DEFAULT_WINDOW_CONFIG}_height`, DefaultWindowConfig.height)

export async function getWindowConfig() {
	const extensionLocalStorage = await storageGetLocal()
	const displayMode = extensionLocalStorage?.[`${DEFAULT_WINDOW_CONFIG}_displayMode`] || DisplayMode.IFRAME
	const width = extensionLocalStorage?.[`${DEFAULT_WINDOW_CONFIG}_width`] || DefaultWindowConfig.width
	const height = extensionLocalStorage?.[`${DEFAULT_WINDOW_CONFIG}_height`] || DefaultWindowConfig.height
	return { displayMode, width, height } as WindowConfig
}

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
	set(displayModeAtom, DefaultWindowConfig.displayMode)
	set(widthAtom, DefaultWindowConfig.width)
	set(heightAtom, DefaultWindowConfig.height)
})
