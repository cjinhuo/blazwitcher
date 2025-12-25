import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { PAGE_STORAGE_SHORTCUT_MAPPINGS } from '~shared/constants'
import { OperationItemPropertyTypes } from '~shared/types'
import type { TranslationKeys } from '~sidepanel/atom'

export interface Shortcut {
	action: TranslationKeys
	shortcut: string
	id: OperationItemPropertyTypes
	tooltip?: TranslationKeys
}

const defaultShortcutConfigs: Shortcut[] = [
	{
		id: OperationItemPropertyTypes.start,
		action: 'startExtension',
		shortcut: '',
	},
	{
		id: OperationItemPropertyTypes.query,
		action: 'searchHistory',
		shortcut: 'Ctrl + Shift + H',
	},
	// Tab 专用快捷键
	{
		id: OperationItemPropertyTypes.tabOpen,
		action: 'tabOpen',
		shortcut: '↵',
	},
	{
		id: OperationItemPropertyTypes.tabOpenHere,
		action: 'tabOpenHere',
		shortcut: 'Shift + ↵',
	},
	{
		id: OperationItemPropertyTypes.pin,
		action: 'pin',
		shortcut: 'Ctrl + Shift + P',
	},
	{
		id: OperationItemPropertyTypes.close,
		action: 'closeTab',
		shortcut: 'Ctrl + Shift + W',
	},
	// History 专用快捷键
	{
		id: OperationItemPropertyTypes.historyOpen,
		action: 'historyOpen',
		shortcut: '↵',
	},
	{
		id: OperationItemPropertyTypes.historyOpenHere,
		action: 'historyOpenHere',
		shortcut: 'Shift + ↵',
	},
	{
		id: OperationItemPropertyTypes.delete,
		action: 'deleteFromHistory',
		shortcut: 'Ctrl + Shift + D',
	},
	// Bookmark 专用快捷键
	{
		id: OperationItemPropertyTypes.bookmarkOpen,
		action: 'bookmarkOpen',
		shortcut: '↵',
	},
	{
		id: OperationItemPropertyTypes.bookmarkOpenHere,
		action: 'bookmarkOpenHere',
		shortcut: 'Shift + ↵',
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
		tooltip: config.tooltip,
	}))
})

// Write Only atoms：update shortcutMappingsAtom
export const updateShortcutAtom = atom(null, (get, set, { id, shortcut }: { id: string; shortcut: string }) => {
	const mappings = { ...get(shortcutMappingsAtom) }
	mappings[id] = shortcut
	set(shortcutMappingsAtom, mappings)
})
