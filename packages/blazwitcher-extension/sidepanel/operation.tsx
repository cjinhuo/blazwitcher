import CloseIcon from 'react:~assets/close.svg'
import DeleteIcon from 'react:~assets/delete.svg'
import EnterIcon from 'react:~assets/enter.svg'
import NewWindow from 'react:~assets/new-window.svg'
import PinIcon from 'react:~assets/pin.svg'
import QueryIcon from 'react:~assets/query.svg'
import RightArrow from 'react:~assets/right-arrow.svg'
import UnpinIcon from 'react:~assets/unpin.svg'
import { useAtomValue } from 'jotai'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { PopoverWrapper } from '~shared/common-styles'
import { VISIBILITY_CLASS } from '~shared/constants'
import { ItemType, type ListItemType, OperationItemPropertyTypes, OperationItemTitleMap } from '~shared/types'
import { isTabItem } from '~shared/utils'
import { i18nAtom, shortcutsAtom } from '~sidepanel/atom'
import { useListOperations } from './hooks/useOperations'

export const OPERATION_ICON_CLASS = 'operation-icon'

const IconContainer = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
		border: 1px solid var(--color-neutral-6);
		background-color: transparent;
    cursor: pointer;

		
		
    &:hover {
      transform: scale(1.08);
			transition: 0.05s;
			border: 1px solid var(--color-neutral-7);
			svg {
				fill: var(--color-neutral-7);
				> path {
					fill: var(--color-neutral-7);
				}
			}
    }

    svg {
			width: 16px;
			height: 16px;
      pointer-events: none;
			fill: var(--color-neutral-6);
      > path {
        fill: var(--color-neutral-6);
      }
    }
    `

const OperationContainer = styled.div`
  padding: 0 2px;
  gap: 10px;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
	position: relative; 
`

const IconWithName = ({
	children,
	name,
	item,
}: {
	children: React.ReactNode
	name: OperationItemPropertyTypes
	item: ListItemType
}) => {
	const shortcutsMap = useAtomValue(shortcutsAtom)
	const i18n = useAtomValue(i18nAtom)
	const getShortcut = useCallback(
		(name: OperationItemPropertyTypes) => {
			if (name === OperationItemPropertyTypes.switch) {
				return shortcutsMap.find((item) => item.id === OperationItemPropertyTypes.open)?.shortcut || ''
			}
			return shortcutsMap.find((item) => item.id === name)?.shortcut || ''
		},
		[shortcutsMap]
	)

	const getTitle = useCallback(() => {
		if (isTabItem(item) && name === OperationItemPropertyTypes.pin) {
			return item.data.pinned ? i18n('unpinTab') : i18n('pinTab')
		}
		return i18n(OperationItemTitleMap[name])
	}, [name, item, i18n])

	return (
		<PopoverWrapper
			content={
				<>
					<span>{getTitle()}</span>
					<span>{getShortcut(name)}</span>
				</>
			}
		>
			<IconContainer className={`${OPERATION_ICON_CLASS} ${VISIBILITY_CLASS}`} data-name={name}>
				{children}
			</IconContainer>
		</PopoverWrapper>
	)
}

const Open = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.open} item={item}>
		<NewWindow></NewWindow>
	</IconWithName>
)

const OpenHere = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.openHere} item={item}>
		<EnterIcon></EnterIcon>
	</IconWithName>
)

const Switch = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.switch} item={item}>
		<RightArrow></RightArrow>
	</IconWithName>
)

const Query = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.query} item={item}>
		<QueryIcon></QueryIcon>
	</IconWithName>
)

const Delete = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.delete} item={item}>
		<DeleteIcon></DeleteIcon>
	</IconWithName>
)

const Close = ({ item }: { item: ListItemType }) => (
	<IconWithName name={OperationItemPropertyTypes.close} item={item}>
		<CloseIcon></CloseIcon>
	</IconWithName>
)

const Pin = ({ item }: { item: ListItemType }) => {
	const isPinned = isTabItem(item) && item.data.pinned
	return (
		<IconWithName name={OperationItemPropertyTypes.pin} item={item}>
			{isPinned ? <PinIcon /> : <UnpinIcon />}
		</IconWithName>
	)
}

export const getOperationMap = () => ({
	[ItemType.Tab]: [Switch, Pin, Close],
	[ItemType.Bookmark]: [Open, OpenHere, Query],
	[ItemType.History]: [Open, OpenHere, Query, Delete],
})

export const RenderOperation = ({ item }: { item: ListItemType }) => {
	const { handleOperations } = useListOperations()
	const handleClick = (e: React.MouseEvent<HTMLDivElement>, item: ListItemType) => {
		e.stopPropagation()
		const name = (e.target as HTMLDivElement).dataset.name as OperationItemPropertyTypes
		handleOperations(name, item)
	}

	const operationMap = getOperationMap()

	return (
		<OperationContainer onClick={(e) => handleClick(e, item)}>
			{operationMap[item.itemType].map((Component, index) => (
				<Component key={`${item.data.id}-${index}`} item={item} />
			))}
		</OperationContainer>
	)
}
