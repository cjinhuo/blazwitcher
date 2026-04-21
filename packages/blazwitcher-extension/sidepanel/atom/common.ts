import { atomWithStorage } from 'jotai/utils'

const hasStoredValue = (storage: Record<string, unknown>, key: string) => Object.hasOwn(storage, key)

const getLocalStorageItem = <T>(key: string) => {
	try {
		const stored = localStorage.getItem(key)
		if (stored === null) {
			return undefined
		}
		try {
			return JSON.parse(stored) as T
		} catch {
			return stored as T
		}
	} catch {
		return undefined
	}
}

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
 * 若 sync 中缺失，则按 key 从 chrome.storage.local 回退，并将旧值懒迁移到 sync。
 */
export const createSyncStorageAtom = <T>(key: string, defaultValue: T) =>
	atomWithStorage<T>(key, defaultValue, {
		async getItem(key, initialValue) {
			const syncValue = await chrome.storage.sync.get(key)
			if (hasStoredValue(syncValue, key)) {
				return syncValue[key] as T
			}

			const localValue = await chrome.storage.local.get(key)
			if (hasStoredValue(localValue, key)) {
				const legacyValue = localValue[key] as T
				// 老版本把部分配置写在 local，这里读到后立刻补写 sync，后续统一走云端。
				await chrome.storage.sync.set({ [key]: legacyValue })
				return legacyValue
			}

			// 未命中任何存储时回退初始值，避免出现 undefined 污染业务状态。
			return initialValue
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
 * 若 sync 中缺失，则按 key 从旧 localStorage 回退，并将旧值懒迁移到 sync。
 */
export const createChromeSyncStorage = <T>() => ({
	async getItem(key: string, initialValue: T): Promise<T> {
		const syncValue = await chrome.storage.sync.get(key)
		if (hasStoredValue(syncValue, key)) {
			return syncValue[key] as T
		}

		const legacyValue = getLocalStorageItem<T>(key)
		if (legacyValue !== undefined) {
			// 兼容更早期 localStorage 方案：读取到旧值后懒迁移到 sync，避免一次性迁移逻辑侵入 UI 启动流程。
			await chrome.storage.sync.set({ [key]: legacyValue })
			return legacyValue
		}

		return initialValue
	},
	async setItem(key: string, value: T): Promise<void> {
		await chrome.storage.sync.set({ [key]: value })
	},
	async removeItem(key: string): Promise<void> {
		await chrome.storage.sync.remove(key)
	},
})

export const getSyncValueWithWebStorageFallback = async <T>(key: string, defaultValue: T): Promise<T> => {
	// Web Storage 版本回退：用于主题/语言等历史上直接存 localStorage 的 key。
	const syncValue = await chrome.storage.sync.get(key)
	if (hasStoredValue(syncValue, key)) {
		return syncValue[key] as T
	}

	const legacyValue = getLocalStorageItem<T>(key)
	if (legacyValue !== undefined) {
		// 命中旧值后回写 sync，下一次读取无需再触发回退分支。
		await chrome.storage.sync.set({ [key]: legacyValue })
		return legacyValue
	}

	return defaultValue
}

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
