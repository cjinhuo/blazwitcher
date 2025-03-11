import { atom } from 'jotai'
import {
	DefaultWindowConfig,
	DisplayMode,
	EXTENSION_STORAGE_DISPLAY_MODE,
	EXTENSION_STORAGE_WINDOW_HEIGHT,
	EXTENSION_STORAGE_WINDOW_WIDTH,
	type WindowConfig,
} from '~shared/constants'
import { storageGetLocal } from '~shared/promisify'
import { createStorageAtom } from './common'

export const displayModeAtom = createStorageAtom(EXTENSION_STORAGE_DISPLAY_MODE, DefaultWindowConfig.displayMode)
export const widthAtom = createStorageAtom(EXTENSION_STORAGE_WINDOW_WIDTH, DefaultWindowConfig.width)
export const heightAtom = createStorageAtom(EXTENSION_STORAGE_WINDOW_HEIGHT, DefaultWindowConfig.height)

export async function getWindowConfig() {
	const extensionLocalStorage = await storageGetLocal()
	const displayMode = extensionLocalStorage?.[EXTENSION_STORAGE_DISPLAY_MODE] || DisplayMode.ISOLATE_WINDOW
	const width = extensionLocalStorage?.[EXTENSION_STORAGE_WINDOW_WIDTH] || DefaultWindowConfig.width
	const height = extensionLocalStorage?.[EXTENSION_STORAGE_WINDOW_HEIGHT] || DefaultWindowConfig.height
	return { displayMode, width, height } as WindowConfig
}

export const restoreWindowConfigAtom = atom(null, (_, set) => {
	set(displayModeAtom, DefaultWindowConfig.displayMode)
	set(widthAtom, DefaultWindowConfig.width)
	set(heightAtom, DefaultWindowConfig.height)
})
