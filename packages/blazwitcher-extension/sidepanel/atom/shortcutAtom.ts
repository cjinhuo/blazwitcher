import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { PAGE_STORAGE_SHORTCUT_MAPPINGS } from '~shared/constants'
import { OperationItemPropertyTypes } from '~shared/types'
import type { TranslationKeys } from '~sidepanel/atom'

export interface Shortcut {
	action: TranslationKeys
	shortcut: string
	id: OperationItemPropertyTypes
}

const defaultShortcutConfigs: Shortcut[] = [
	{
		id: OperationItemPropertyTypes.start,
		action: 'startExtension',
		shortcut: '',
	},
	{
		id: OperationItemPropertyTypes.open,
		action: 'openCurrentTab',
		shortcut: 'Enter',
	},
	{
		id: OperationItemPropertyTypes.close,
		action: 'closeTab',
		shortcut: 'Ctrl + Shift + W',
	},
	{
		id: OperationItemPropertyTypes.query,
		action: 'searchHistory',
		shortcut: 'Ctrl + Shift + H',
	},
	{
		id: OperationItemPropertyTypes.delete,
		action: 'deleteFromHistory',
		shortcut: 'Ctrl + Shift + D',
	},
	{
		id: OperationItemPropertyTypes.pin,
		action: 'pinTab',
		shortcut: 'Ctrl + Shift + P',
	},
]

const defaultShortcutMappings = defaultShortcutConfigs.reduce(
	(acc, config) => {
		acc[config.id] = config.shortcut
		return acc
	},
	{} as Record<string, string>
)

export const shortcutMappingsAtom = atomWithStorage<Record<string, string>>(
	PAGE_STORAGE_SHORTCUT_MAPPINGS,
	defaultShortcutMappings
)

export const restoreDefaultShortcutsAtom = atom(null, (_, set) => {
	set(shortcutMappingsAtom, defaultShortcutMappings)
})

// 先读取localstorage，如果没有就使用默认值
export const shortcutsAtom = atom((get) => {
	const mappings = get(shortcutMappingsAtom)

	return defaultShortcutConfigs.map((config) => ({
		id: config.id,
		action: config.action,
		shortcut: mappings[config.id] || config.shortcut,
	}))
})

// Write Only atoms：update shortcutMappingsAtom
export const updateShortcutAtom = atom(null, (get, set, { id, shortcut }: { id: string; shortcut: string }) => {
	const mappings = { ...get(shortcutMappingsAtom) }
	mappings[id] = shortcut
	set(shortcutMappingsAtom, mappings)
})
