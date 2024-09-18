import { List as ListComponent } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS } from '../shared/constants'
import type { ListItemType } from '../shared/types'
import { closeCurrentWindowAndClearStorage, handleClickItem } from '../shared/utils'
import { HIGHLIGHT_TEXT_CLASS, NORMAL_TEXT_CLASS } from './highlight-text'
import { HOST_CLASS, IMAGE_CLASS, RenderItem, SVG_CLASS, VISIBILITY_CLASS } from './list-item'
import { OPERATION_ICON_CLASS } from './operation'

const ListContainer = styled.div`
  padding: 6px;
  .semi-list-item-body-main {
    width: 100%;
    overflow: hidden;
  }
  .semi-list-item-body {
    overflow: hidden;
  }
`

const ListItemWrapper = styled(ListComponent.Item)`
  border-radius: 6px;
  .${SVG_CLASS} {
    fill: var(--color-neutral-4);
  }
  .${VISIBILITY_CLASS} {
    visibility: hidden;
  }
  &:hover {
    background-color: var(--color-neutral-4);
    .${IMAGE_CLASS} {
      background-color: var(--color-neutral-10);
    }
    .${NORMAL_TEXT_CLASS} {
      color: var(--color-neutral-8);
    }
    .${HIGHLIGHT_TEXT_CLASS} {
      background-color: var(--highlight-selected-bg);
    }
    .${HOST_CLASS} {
      color: var(--color-neutral-6);
    }
    .${SVG_CLASS} {
      fill: var(--color-neutral-7);
    }
    .${VISIBILITY_CLASS} {
      visibility: visible;
    }
		.${OPERATION_ICON_CLASS} {
		  fill: var(--color-neutral-7);
      > path {
      fill: var(--color-neutral-7);
      }
	  }
  }
  &.${LIST_ITEM_ACTIVE_CLASS} {
    background-color: var(--color-neutral-3);
    .${IMAGE_CLASS} {
      background-color: var(--color-neutral-10);
    }
    .${NORMAL_TEXT_CLASS} {
      color: var(--color-neutral-8);
    }
    .${HIGHLIGHT_TEXT_CLASS} {
      background-color: var(--highlight-selected-bg);
    }
    .${HOST_CLASS} {
      color: var(--color-neutral-6);
    }
    .${SVG_CLASS} {
      fill: var(--color-neutral-7);
    }
    .${VISIBILITY_CLASS} {
      visibility: visible;
    }
		.${OPERATION_ICON_CLASS} {
		  fill: var(--color-neutral-7);
      > path {
      fill: var(--color-neutral-7);
      }
	  }
  }
  &.semi-list-item {
    height: 50px;
  }
`
function scrollIntoViewIfNeeded(element: HTMLElement, container: HTMLElement) {
	const containerRect = container.getBoundingClientRect()
	const elementRect = element.getBoundingClientRect()
	if (elementRect.top < containerRect.top) {
		container.scrollTop -= containerRect.top - elementRect.top
	} else if (elementRect.bottom > containerRect.bottom) {
		container.scrollTop += elementRect.bottom - containerRect.bottom + 4 // '+4' is for having margins with Footer Component
	}
}

const setScrollTopIfNeeded = () => {
	const mainContent = document.querySelector(`.${MAIN_CONTENT_CLASS}`) as HTMLElement
	const activeItem = document.querySelector(`.${LIST_ITEM_ACTIVE_CLASS}`) as HTMLElement
	if (!activeItem) return
	scrollIntoViewIfNeeded(activeItem, mainContent)
}

export default function List({ list }: { list: ListItemType[] }) {
	const [activeIndex, setActiveIndex] = useState(0)
	const listRef = useRef<HTMLDivElement>(null)
	const activeItemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setActiveIndex(0)
	}, [list])

	const changeActiveIndex = useCallback(
		(offset: number) => {
			setActiveIndex((prevIndex) => {
				let newIndex = prevIndex + offset
				if (newIndex < 0) {
					newIndex = list.length - 1
				}
				if (newIndex >= list.length) {
					newIndex = 0
				}
				return newIndex
			})
		},
		[list]
	)

	const handleEnterEvent = useCallback(() => {
		handleClickItem(list[activeIndex])
	}, [activeIndex, list])

	useEffect(() => {
		if (listRef.current && activeItemRef.current) {
			console.log('activeItemRef.current', activeItemRef.current)
			const listRect = listRef.current.getBoundingClientRect()
			const activeItemRect = activeItemRef.current.getBoundingClientRect()
			console.log('activeItemRect', activeItemRect)
			console.log('listRect', listRect)
			if (activeItemRect.top < listRect.top) {
				listRef.current.scrollTop -= listRect.top - activeItemRect.top
			} else if (activeItemRect.bottom > listRect.bottom) {
				listRef.current.scrollTop += activeItemRect.bottom - listRect.bottom + 4 // '+4' is for having margins with Footer Component
			}
		}
	}, [activeIndex])

	useEffect(() => {
		const keydownHandler = (event: KeyboardEvent) => {
			const keyActions: { [key: string]: () => void } = {
				ArrowUp: () => changeActiveIndex(-1),
				Tab: () => changeActiveIndex(1),
				ArrowDown: () => changeActiveIndex(1),
				Enter: handleEnterEvent,
				Escape: closeCurrentWindowAndClearStorage,
			}

			const action = keyActions[event.code]
			if (action) {
				event.preventDefault()
				action()
			}
		}
		window.addEventListener('keydown', keydownHandler)
		return () => {
			window.removeEventListener('keydown', keydownHandler)
		}
	}, [changeActiveIndex, handleEnterEvent])
	return (
		<ListContainer ref={listRef}>
			<ListComponent
				grid={{
					gutter: [0, 8],
					span: 24,
				}}
				dataSource={list}
				renderItem={(item, index) => (
					<ListItemWrapper
						// ref={index === activeIndex ? activeItemRef : null}
						className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ''}
						onClick={() => handleClickItem(item)}
						main={<RenderItem ref={index === activeIndex ? activeItemRef : null} item={item} />}
					/>
				)}
			/>
		</ListContainer>
	)
}
