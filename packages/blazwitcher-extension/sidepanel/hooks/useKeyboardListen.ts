import { useAtomValue } from 'jotai'
import { debounce } from 'lodash-es'
import { useEffect } from 'react'
import { type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { shortcutsAtom } from '~sidepanel/atom'
import { useListOperations } from '~sidepanel/hooks/useOperations'
import { collectPressedKeys, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'
import { getTypeSpecificOperationIds } from '~sidepanel/utils/shortcutMappingUtils'

// 根据项目类型和快捷键匹配对应的操作 ID
const getOperationIdByItemType = (
	itemType: any,
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

export const useKeyboardListen = (list: ListItemType[], activeIndex: number) => {
	const shortcuts = useAtomValue(shortcutsAtom)
	const activeItem = list?.[activeIndex]
	const { handleOperations } = useListOperations()

	const debouncedOperationHandler = debounce((id: OperationItemPropertyTypes) => {
		if (activeItem) {
			handleOperations(id, activeItem)
		}
	}, 100)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const keys = collectPressedKeys(e)

			if (!isValidShortcut(keys)) {
				return
			}

			const orderedKeys = standardizeKeyOrder(keys)
			const pressedShortcut = orderedKeys.join(' + ')

			if (!activeItem) {
				return
			}

			// 根据当前激活项的类型匹配对应的快捷键
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
		}
	}, [shortcuts, debouncedOperationHandler, activeItem])
}
