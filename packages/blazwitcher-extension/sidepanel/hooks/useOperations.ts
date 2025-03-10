import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { deleteItem, handleItemClick, isTabItem, queryInNewTab } from '~shared/utils'
import { i18nAtom, originalListAtom } from '~sidepanel/atom'

export const useListOperations = () => {
	const i18n = useAtomValue(i18nAtom)
	const [originalList, setOriginalList] = useAtom(originalListAtom)

	const removeItemFromOriginList = useCallback(
		(item: ListItemType) => {
			const _index = item.data.id
				? originalList.findIndex((i) => i.data.id === item.data.id)
				: originalList.findIndex((i) => i.data.url === item.data.url)

			~_index && originalList.splice(_index, 1)
			setOriginalList([...originalList])
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
				queryInNewTab(item)
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
