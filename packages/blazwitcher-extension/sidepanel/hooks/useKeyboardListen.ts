import { useAtomValue } from 'jotai'
import { debounce } from 'lodash-es'
import { useEffect } from 'react'
import type { ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { shortcutsAtom } from '~sidepanel/atom'
import { useListOperations } from '~sidepanel/hooks/useOperations'
import { collectPressedKeys, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'

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

			// 查找匹配的快捷键
			const matchedShortcut = shortcuts.find((s) => s.shortcut.toLowerCase() === pressedShortcut.toLowerCase())
			if (matchedShortcut) {
				debouncedOperationHandler(matchedShortcut.id)
				e.preventDefault()
				e.stopPropagation()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [shortcuts, debouncedOperationHandler])
}
