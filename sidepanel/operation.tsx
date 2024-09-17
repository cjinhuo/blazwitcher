import CloseIcon from 'react:~assets/close.svg'
import DeleteIcon from 'react:~assets/delete.svg'
import NewWindow from 'react:~assets/new-window.svg'
import QueryIcon from 'react:~assets/query.svg'
import RightArrow from 'react:~assets/right-arrow.svg'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import React from 'react'
import styled from 'styled-components'
import { ItemType, type ListItemType, OperationItemPropertyTypes, OperationItemTitleMap } from '~shared/types'
import { deleteItem, handleClickItem, isTabItem, queryInNewTab } from '~shared/utils'
import { OriginalListAtom } from './atom'
export const OPERATION_ICON_CLASS = 'operation-icon'

const IconContainer = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.9;
    cursor: pointer;
    &:hover {
      transform: scale(1.08);
      opacity: 1;
    }
    svg {
      pointer-events: none;
    }
		fill: var(--color-neutral-2);
    > path {
    	fill: var(--color-neutral-2);
    }
    `

const OperationContainer = styled.div`
  padding: 0 6px;
  gap:16px;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const IconWithName = ({ children, name }: { children: React.ReactNode; name: OperationItemPropertyTypes }) => (
	<IconContainer className={OPERATION_ICON_CLASS} title={OperationItemTitleMap[name]} data-name={name}>
		{children}
	</IconContainer>
)

const Open = (
	<IconWithName name={OperationItemPropertyTypes.open}>
		<NewWindow></NewWindow>
	</IconWithName>
)

const Switch = (
	<IconWithName name={OperationItemPropertyTypes.switch}>
		<RightArrow></RightArrow>
	</IconWithName>
)

const Query = (
	<IconWithName name={OperationItemPropertyTypes.query}>
		<QueryIcon></QueryIcon>
	</IconWithName>
)

const Delete = (
	<IconWithName name={OperationItemPropertyTypes.delete}>
		<DeleteIcon></DeleteIcon>
	</IconWithName>
)

const Close = (
	<IconWithName name={OperationItemPropertyTypes.close}>
		<CloseIcon></CloseIcon>
	</IconWithName>
)

const OperationMap = {
	[ItemType.Tab]: [Switch, Close],
	[ItemType.Bookmark]: [Open, Query],
	[ItemType.History]: [Open, Query, Delete],
}

export const RenderOperation = ({ item }: { item: ListItemType }) => {
	const [originalList, setOriginalList] = useAtom(OriginalListAtom)
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
	const handleClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ListItemType) => {
		e.stopPropagation()
		const name = (e.target as HTMLDivElement).dataset.name as OperationItemPropertyTypes
		switch (name) {
			case OperationItemPropertyTypes.switch:
			case OperationItemPropertyTypes.open:
				handleClickItem(item)
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
				console.error('unknown operation', name)
				break
		}
	}
	return (
		<OperationContainer onClick={(e) => handleClick(e, item)}>
			{OperationMap[item.itemType].map((node, index) => React.cloneElement(node, { key: `${item.data.id}-${index}` }))}
		</OperationContainer>
	)
}
