import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import {
	createTabWithUrl,
	deleteItem,
	handleItemClick,
	isBookmarkItem,
	isHistoryItem,
	isTabItem,
	queryInNewTab,
} from '~shared/utils'
import { i18nAtom, originalListAtom } from '~sidepanel/atom'

export const useListOperations = () => {
	const i18n = useAtomValue(i18nAtom)
	const [originalList, setOriginalList] = useAtom(originalListAtom)

	const removeItemFromOriginList = useCallback(
		(item: ListItemType) => {
			const _index = item.data.id
				? originalList.findIndex((i) => i.data.id === item.data.id)
				: originalList.findIndex((i) => i.data.url === item.data.url)
			if (~_index) {
				originalList.splice(_index, 1)
				setOriginalList([...originalList])
			}
		},
		[originalList, setOriginalList]
	)

	const updateItemInOriginList = useCallback(
		(item: ListItemType) => {
			const _index = item.data.id
				? originalList.findIndex((i) => i.data.id === item.data.id)
				: originalList.findIndex((i) => i.data.url === item.data.url)
			if (~_index) {
				originalList[_index] = item
				setOriginalList([...originalList])
			}
		},
		[originalList, setOriginalList]
	)

	// watch click and keyboard input
	const handleOperations = async (name: OperationItemPropertyTypes, item: ListItemType) => {
		switch (name) {
			case OperationItemPropertyTypes.switch:
			case OperationItemPropertyTypes.open:
				handleItemClick(item)
				break
			case OperationItemPropertyTypes.openInNewTab:
				await createTabWithUrl(item.data.url)
				break
			case OperationItemPropertyTypes.close:
				isTabItem(item) &&
					chrome.tabs.remove(item.data.id).then(() => {
						removeItemFromOriginList(item)
					})
				break
			case OperationItemPropertyTypes.delete:
				deleteItem(item).then(() => {
					removeItemFromOriginList(item)
				})
				break
			case OperationItemPropertyTypes.query:
				if (isHistoryItem(item) || isBookmarkItem(item)) {
					queryInNewTab(item)
				}
				break
			case OperationItemPropertyTypes.pin:
				if (isTabItem(item)) {
					await chrome.tabs.update(item.data.id, { pinned: !item.data.pinned })
					item.data.pinned = !item.data.pinned
					updateItemInOriginList(item)
				}
				break
			default:
				console.error(i18n('unknownOperation'), name)
				break
		}
	}

	return {
		removeItemFromOriginList,
		handleOperations,
	}
}
