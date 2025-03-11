import { atom } from 'jotai'
import {
	DefaultWindowConfig,
	EXTENSION_STORAGE_DISPLAY_MODE,
	EXTENSION_STORAGE_WINDOW_HEIGHT,
	EXTENSION_STORAGE_WINDOW_WIDTH,
} from '~shared/constants'
import { createStorageAtom } from './common'

export const displayModeAtom = createStorageAtom(EXTENSION_STORAGE_DISPLAY_MODE, DefaultWindowConfig.displayMode)
export const widthAtom = createStorageAtom(EXTENSION_STORAGE_WINDOW_WIDTH, DefaultWindowConfig.width)
export const heightAtom = createStorageAtom(EXTENSION_STORAGE_WINDOW_HEIGHT, DefaultWindowConfig.height)

export const restoreWindowConfigAtom = atom(null, (_, set) => {
	set(displayModeAtom, DefaultWindowConfig.displayMode)
	set(widthAtom, DefaultWindowConfig.width)
	set(heightAtom, DefaultWindowConfig.height)
})
