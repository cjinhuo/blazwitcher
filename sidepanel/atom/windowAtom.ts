import { atom } from 'jotai'
import { DEFAULT_WINDOW_CONFIG, DefaultWindowConfig, DisplayMode, type WindowConfig } from '~shared/constants'
import { storageGetLocal } from '~shared/promisify'
import { createStorageAtom } from './common'

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

export const restoreWindowConfigAtom = atom(null, (_, set) => {
	set(displayModeAtom, DefaultWindowConfig.displayMode)
	set(widthAtom, DefaultWindowConfig.width)
	set(heightAtom, DefaultWindowConfig.height)
})
