import { atom } from 'jotai'
import {
	DefaultWindowConfig,
	EXTENSION_STORAGE_DEBUG_MODE,
	EXTENSION_STORAGE_DISPLAY_MODE,
	EXTENSION_STORAGE_WINDOW_HEIGHT,
	EXTENSION_STORAGE_WINDOW_WIDTH,
} from '~shared/constants'
import { createStorageAtom, createSyncStorageAtom } from './common'

// 窗口配置使用 sync，随 Chrome 账号跨设备同步
export const displayModeAtom = createSyncStorageAtom(EXTENSION_STORAGE_DISPLAY_MODE, DefaultWindowConfig.displayMode)
export const widthAtom = createSyncStorageAtom(EXTENSION_STORAGE_WINDOW_WIDTH, DefaultWindowConfig.width)
export const heightAtom = createSyncStorageAtom(EXTENSION_STORAGE_WINDOW_HEIGHT, DefaultWindowConfig.height)

// debug mode: when enabled, do not close window on blur（仅本机，不参与云端同步）
export const debugAtom = createStorageAtom(EXTENSION_STORAGE_DEBUG_MODE, DefaultWindowConfig.debugMode)

export const restoreWindowConfigAtom = atom(null, (_, set) => {
	set(displayModeAtom, DefaultWindowConfig.displayMode)
	set(widthAtom, DefaultWindowConfig.width)
	set(heightAtom, DefaultWindowConfig.height)
})
