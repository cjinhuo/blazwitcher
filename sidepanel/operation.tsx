import CloseIcon from 'react:~assets/close.svg'
import DeleteIcon from 'react:~assets/delete.svg'
import NewWindow from 'react:~assets/new-window.svg'
import QueryIcon from 'react:~assets/query.svg'
import RightArrow from 'react:~assets/right-arrow.svg'
import styled from 'styled-components'
import { ItemType, type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { activeTab, closeTab } from '~shared/utils'
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
    .${OPERATION_ICON_CLASS} {
		  fill: var(--color-neutral-2);
      > path {
      fill: var(--color-neutral-2);
      }
	  }
    `

const OperationContainer = styled.div`
  padding: 0 6px;
  /* max-width: 92px; // gap(16) * 2 + icon(16) * 2 + padding(8) * 2 */
  gap:16px;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const IconWithName = ({ children, name }: { children: React.ReactNode; name: OperationItemPropertyTypes }) => (
	<IconContainer className={OPERATION_ICON_CLASS} title={name} data-name={name}>
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
	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ListItemType) => {
		e.stopPropagation()
		const name = (e.target as HTMLDivElement).dataset.name as OperationItemPropertyTypes
		switch (name) {
			case OperationItemPropertyTypes.switch:
			case OperationItemPropertyTypes.open:
				activeTab(item)
				break
			case OperationItemPropertyTypes.close:
				closeTab(item)
				break
			case OperationItemPropertyTypes.delete:
				console.log('delete', item)
				break
			case OperationItemPropertyTypes.query:
				console.log('query', item)
				break
			default:
				console.error('unknown operation', name)
				break
		}
	}
	return <OperationContainer onClick={(e) => handleClick(e, item)}>{...OperationMap[item.itemType]}</OperationContainer>
}
