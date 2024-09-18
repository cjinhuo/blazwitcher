import { List as ListComponent } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS } from '../shared/constants'
import type { ListItemType } from '../shared/types'
import { closeCurrentWindowAndClearStorage, handleClickItem } from '../shared/utils'
import { HIGHLIGHT_TEXT_CLASS, NORMAL_TEXT_CLASS } from './highlight-text'
import { HOST_CLASS, IMAGE_CLASS, RenderItem, SVG_CLASS, VISIBILITY_CLASS } from './list-item'
import { OPERATION_ICON_CLASS } from './operation'

const ListContainer = styled.div`
	height: 100%;
	overflow-y: scroll;
  padding: 2px 6px;
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
	if (!element || !container) return
	const containerRect = container.getBoundingClientRect()
	const elementRect = element.getBoundingClientRect()
	console.log(elementRect, containerRect)
	if (elementRect.top < containerRect.top) {
		container.scrollTop -= containerRect.top - elementRect.top + 4
	} else if (elementRect.bottom > containerRect.bottom) {
		container.scrollTop += elementRect.bottom - containerRect.bottom + 8 // '+4' is for having margins with Footer Component
	}
}

export default function List({ list }: { list: ListItemType[] }) {
	const [activeIndex, setActiveIndex] = useState(0)
	const listRef = useRef<HTMLDivElement>(null)
	const activeItemRef = useRef<HTMLDivElement>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollIntoViewIfNeeded(activeItemRef.current, listRef.current)
	}, [activeItemRef.current, listRef.current])

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

	const memoizedRenderItem = useCallback(
		(item: ListItemType, index: number) => (
			<ListItemWrapper
				className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ''}
				onClick={() => handleClickItem(item)}
				main={<RenderItem ref={index === activeIndex ? activeItemRef : null} item={item} />}
			/>
		),
		[activeIndex]
	)
	return (
		<ListContainer ref={listRef}>
			<ListComponent
				grid={{
					gutter: [0, 4],
					span: 24,
				}}
				dataSource={list}
				renderItem={memoizedRenderItem}
			/>
		</ListContainer>
	)
}
