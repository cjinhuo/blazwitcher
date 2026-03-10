import { atomWithStorage } from 'jotai/utils'

// 插件 storage（仅本机，不跨设备同步）
export const createStorageAtom = <T>(key: string, defaultValue: T) =>
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

/**
 * 基于 chrome.storage.sync 的 Atom 工厂，用于 Setting Panel 配置云端同步。
 * 用户登录 Chrome 后，这些配置会跨设备自动同步。
 */
export const createSyncStorageAtom = <T>(key: string, defaultValue: T) =>
	atomWithStorage<T>(key, defaultValue, {
		async getItem(key, initialValue) {
			const storedValue = await chrome.storage.sync.get(key)
			return key in storedValue ? storedValue[key] : initialValue
		},
		async setItem(key, value) {
			await chrome.storage.sync.set({ [key]: value })
		},
		async removeItem(key) {
			await chrome.storage.sync.remove(key)
		},
	})

/**
 * 供 atomWithStorage 使用的 chrome.storage.sync 适配器。
 * 用于 theme、language、shortcutMappings、searchConfig 等需云端同步的配置。
 */
export const createChromeSyncStorage = <T>() => ({
	async getItem(key: string, initialValue: T): Promise<T> {
		const result = await chrome.storage.sync.get(key)
		return key in result ? result[key] : initialValue
	},
	async setItem(key: string, value: T): Promise<void> {
		await chrome.storage.sync.set({ [key]: value })
	},
	async removeItem(key: string): Promise<void> {
		await chrome.storage.sync.remove(key)
	},
})

// 创建同步的主题存储适配器，避免两次触发（仅本机 localStorage，已由 createChromeSyncStorage 替代用于需同步的配置）
export const createSyncStorage = <T>() => ({
	getItem: (key: string, initialValue: T): T => {
		try {
			const stored = localStorage.getItem(key)
			return stored ? JSON.parse(stored) : initialValue
		} catch {
			return initialValue
		}
	},
	setItem: (key: string, value: T) => {
		localStorage.setItem(key, JSON.stringify(value))
	},
	removeItem: (key: string) => {
		localStorage.removeItem(key)
	},
})
