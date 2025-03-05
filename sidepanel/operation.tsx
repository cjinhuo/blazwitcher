import CloseIcon from 'react:~assets/close.svg'
import DeleteIcon from 'react:~assets/delete.svg'
import NewWindow from 'react:~assets/new-window.svg'
import QueryIcon from 'react:~assets/query.svg'
import RightArrow from 'react:~assets/right-arrow.svg'
import { Popover } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import React from 'react'
import styled from 'styled-components'
import { VISIBILITY_CLASS } from '~shared/constants'
import { ItemType, type ListItemType, OperationItemPropertyTypes, OperationItemTitleMap } from '~shared/types'
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

const OperationTooltip = styled.div`
  display: inline-flex;
  flex-direction: column;
	color: black;
	text-align: center;

	span:first-child {
		font-weight: 700;
	}

	span:last-child {
		font-size: 8px;
	}
`

const IconWithName = ({
	children,
	name,
}: { children: React.ReactNode; name: OperationItemPropertyTypes; item?: ListItemType }) => {
	const shortcutsMap = useAtomValue(shortcutsAtom)
	const i18n = useAtomValue(i18nAtom)
	const getShortcut = useCallback(
		(name: OperationItemPropertyTypes) => {
			if (name === OperationItemPropertyTypes.switch) {
				return shortcutsMap.find((item) => item.id === OperationItemPropertyTypes.open)?.shortcut
			}
			return shortcutsMap.find((item) => item.id === name)?.shortcut
		},
		[shortcutsMap]
	)

	return (
		<Popover
			trigger='hover'
			showArrow
			content={
				<OperationTooltip>
					<span>{i18n(OperationItemTitleMap[name])}</span>
					<span>{getShortcut(name)}</span>
				</OperationTooltip>
			}
			style={{
				fontSize: '10px',
				padding: '6px',
				backgroundColor: 'rgba(var(--semi-white), 1)',
				borderColor: 'rgba(var(--semi-white), .08)',
			}}
		>
			<IconContainer className={`${OPERATION_ICON_CLASS} ${VISIBILITY_CLASS}`} data-name={name}>
				{children}
			</IconContainer>
		</Popover>
	)
}

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

export const OperationMap = {
	[ItemType.Tab]: [Switch, Close],
	[ItemType.Bookmark]: [Open, Query],
	[ItemType.History]: [Open, Query, Delete],
}

export const RenderOperation = ({ item }: { item: ListItemType }) => {
	const { handleOperations } = useListOperations()
	const handleClick = (e: React.MouseEvent<HTMLDivElement>, item: ListItemType) => {
		e.stopPropagation()
		const name = (e.target as HTMLDivElement).dataset.name as OperationItemPropertyTypes
		handleOperations(name, item)
	}

	return (
		<OperationContainer onClick={(e) => handleClick(e, item)}>
			{OperationMap[item.itemType].map((node, index) =>
				React.cloneElement(node, { key: `${item.data.id}-${index}`, item })
			)}
		</OperationContainer>
	)
}
