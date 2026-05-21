import { useAtomValue } from 'jotai'
import { debounce } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePluginClickItem } from '~plugins/ui/render-item'
import { buildSearchUrl } from '~shared/search-engine'
import { ItemType, type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { createTabWithUrl, isLikelyUrl, navigateCurrentTab, toNavigableUrl } from '~shared/utils'
import { compositionAtom, searchConfigAtom, shortcutsAtom } from '~sidepanel/atom'
import { useListOperations } from '~sidepanel/hooks/useOperations'
import { collectPressedKeys, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'
import { getTypeSpecificOperationIds } from '~sidepanel/utils/shortcutMappingUtils'

const searchOpenId = OperationItemPropertyTypes.searchOpen
const searchOpenHereId = OperationItemPropertyTypes.searchOpenHere

// 根据项目类型和快捷键匹配对应的操作 ID
const getOperationIdByItemType = (
	itemType: ItemType,
	pressedShortcut: string,
	shortcuts: Array<{ id: OperationItemPropertyTypes; shortcut: string }>
): OperationItemPropertyTypes | null => {
	// 先尝试匹配类型特定的快捷键
	const specificIds = getTypeSpecificOperationIds(itemType)
	if (specificIds.length > 0) {
		for (const id of specificIds) {
			const shortcut = shortcuts.find((s) => s.id === id)
			if (shortcut?.shortcut.toLowerCase() === pressedShortcut.toLowerCase()) {
				return id
			}
		}
	}

	// 如果没有匹配到类型特定的快捷键，再尝试匹配通用快捷键
	const matchedShortcut = shortcuts.find((s) => s.shortcut.toLowerCase() === pressedShortcut.toLowerCase())
	return matchedShortcut?.id || null
}

export const useKeyboardListen = (list: ListItemType[], activeIndex: number, searchValue: string) => {
	const shortcuts = useAtomValue(shortcutsAtom)
	const isComposition = useAtomValue(compositionAtom)
	const searchConfig = useAtomValue(searchConfigAtom)
	const activeItem = list?.[activeIndex]
	const { handleOperations } = useListOperations()
	const handlePluginClick = usePluginClickItem()
	const activeItemRef = useRef(activeItem)
	activeItemRef.current = activeItem

	const debouncedOperationHandler = useMemo(
		() =>
			debounce((id: OperationItemPropertyTypes) => {
				if (activeItemRef.current) {
					handleOperations(id, activeItemRef.current)
				}
			}, 100),
		[handleOperations]
	)

	const handlePluginEnter = useCallback(() => {
		if (activeItem?.itemType === ItemType.Plugin) {
			handlePluginClick(activeItem as ListItemType<ItemType.Plugin>)
		}
	}, [activeItem, handlePluginClick])

	const handleSearchFallback = useCallback(
		async (disposition: 'NEW_TAB' | 'CURRENT_TAB') => {
			const input = searchValue.trim()
			if (!input) return

			// 输入看起来像 URL 时直接打开，否则交给默认搜索引擎。
			if (isLikelyUrl(input)) {
				const url = toNavigableUrl(input)
				if (disposition === 'NEW_TAB') {
					await createTabWithUrl(url)
				} else {
					await navigateCurrentTab(url)
				}
				return
			}

			const searchEngine = searchConfig.searchEngines.find((engine) => engine.id === searchConfig.defaultSearchEngineId)
			if (!searchEngine) return

			const searchUrl = buildSearchUrl(input, searchEngine.queryTemplate)
			if (disposition === 'NEW_TAB') {
				await createTabWithUrl(searchUrl)
			} else {
				await navigateCurrentTab(searchUrl)
			}
		},
		[searchConfig.defaultSearchEngineId, searchConfig.searchEngines, searchValue]
	)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isComposition) {
				return
			}

			const keys = collectPressedKeys(e)

			if (!isValidShortcut(keys)) {
				return
			}

			const orderedKeys = standardizeKeyOrder(keys)
			const pressedShortcut = orderedKeys.join(' + ')

			const hasSearchInput = searchValue.trim() !== ''

			if (hasSearchInput && pressedShortcut.toLowerCase() === shortcuts.find((s) => s.id === searchOpenId)?.shortcut.toLowerCase()) {
				e.preventDefault()
				e.stopPropagation()
				void handleSearchFallback('NEW_TAB')
				return
			}

			if (hasSearchInput && pressedShortcut.toLowerCase() === shortcuts.find((s) => s.id === searchOpenHereId)?.shortcut.toLowerCase()) {
				e.preventDefault()
				e.stopPropagation()
				void handleSearchFallback('CURRENT_TAB')
				return
			}

			if (!activeItem) {
				return
			}

			if (activeItem.itemType === ItemType.SearchAction && pressedShortcut === '↵') {
				void createTabWithUrl(activeItem.data.url)
				e.preventDefault()
				e.stopPropagation()
				return
			}

			if (activeItem.itemType === ItemType.Plugin && pressedShortcut === '↵') {
				handlePluginEnter()
				e.preventDefault()
				e.stopPropagation()
				return
			}

			const operationId = getOperationIdByItemType(activeItem.itemType, pressedShortcut, shortcuts)

			if (operationId) {
				debouncedOperationHandler(operationId)
				e.preventDefault()
				e.stopPropagation()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			debouncedOperationHandler.cancel()
		}
	}, [shortcuts, debouncedOperationHandler, activeItem, isComposition, handlePluginEnter, handleSearchFallback])
}
