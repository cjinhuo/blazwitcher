import { atomWithStorage } from 'jotai/utils'

// 插件 storage
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

// 创建同步的主题存储适配器，避免两次触发
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
