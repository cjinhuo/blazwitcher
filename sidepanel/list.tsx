import { List as ListComponent } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useAtomValue } from 'jotai'
import { HIGHLIGHT_TEXT_CLASS, HOST_CLASS, IMAGE_CLASS, NORMAL_TEXT_CLASS, SVG_CLASS } from '~shared/common-styles'
import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS, VISIBILITY_CLASS } from '../shared/constants'
import { closeCurrentWindowAndClearStorage, scrollIntoViewIfNeeded } from '../shared/utils'
import { CompositionAtom } from './atom'

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
	 .${NORMAL_TEXT_CLASS} {
    color: var(--color-neutral-3);
  }
  .${HIGHLIGHT_TEXT_CLASS} {
    color: var(--highlight-text);
    background-color: var(--highlight-bg);
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
  }
  &.semi-list-item {
    height: 50px;
  }
`

const setScrollTopIfNeeded = () => {
	const mainContent = document.querySelector(`.${MAIN_CONTENT_CLASS}`) as HTMLElement
	const activeItem = document.querySelector(`.${LIST_ITEM_ACTIVE_CLASS}`) as HTMLElement
	if (!activeItem) return
	scrollIntoViewIfNeeded(activeItem, mainContent)
}

interface ListProps<T = any> {
	list: T[]
	// 通过 props 传进来就可以在外面控制如何渲染和点击事件
	RenderItem: React.FC<{ item: T }>
	handleItemClick: (item: T) => void
}

export default function List({ list, RenderItem, handleItemClick }: ListProps) {
	const isComposition = useAtomValue(CompositionAtom)
	const [activeIndex, setActiveIndex] = useState(0)
	const i = useRef(0)

	const timer = useRef<NodeJS.Timeout>()
	const accumulatedOffset = useRef(0)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// reset active index
		setActiveIndex(0)
		i.current = 0
	}, [list])

	const changeActiveIndex = useCallback(
		(offset: number) => {
			const currentIndex = i.current
			let index = currentIndex + offset
			if (index < 0) {
				index = list.length - 1
			}
			if (index >= list.length) {
				index = 0
			}
			i.current = index
			setActiveIndex(index)
		},
		[list]
	)
	const debounceChangeActiveIndex = useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current)
		}

		timer.current = setTimeout(() => {
			if (accumulatedOffset.current !== 0) {
				changeActiveIndex(accumulatedOffset.current)
				accumulatedOffset.current = 0
			}
		}, 16)
	}, [changeActiveIndex])

	const keyActionsChangeIndex = useCallback(
		(offset: number) => {
			accumulatedOffset.current += offset
			debounceChangeActiveIndex()
		},
		[debounceChangeActiveIndex]
	)

	const handleEnterEvent = useCallback(() => {
		handleItemClick(list[activeIndex])
	}, [activeIndex, list, handleItemClick])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useLayoutEffect(() => {
		setScrollTopIfNeeded()
	}, [activeIndex])

	const keydownHandler = useCallback(
		(event: KeyboardEvent) => {
			const keyActions: { [key: string]: () => void } = {
				ArrowUp: () => keyActionsChangeIndex(-1),
				Tab: () => keyActionsChangeIndex(1),
				ArrowDown: () => keyActionsChangeIndex(1),
				Enter: handleEnterEvent,
				Escape: closeCurrentWindowAndClearStorage,
			}

			const action = keyActions[event.code]
			if (action) {
				event.preventDefault()
				action()
			}
		},
		[handleEnterEvent, keyActionsChangeIndex]
	)

	useEffect(() => {
		// only listen to keydown when not in composition（type chinese）
		!isComposition && window.addEventListener('keydown', keydownHandler)
		return () => window.removeEventListener('keydown', keydownHandler)
	}, [isComposition, keydownHandler])

	// 组件卸载时清除定时器
	useEffect(() => {
		return () => timer.current && clearTimeout(timer.current)
	}, [])

	return (
		<ListContainer>
			<ListComponent
				grid={{
					gutter: [0, 8],
					span: 24,
				}}
				dataSource={list}
				renderItem={(item, index) => (
					<ListItemWrapper
						className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ''}
						main={<RenderItem item={item} />}
						onClick={() => handleItemClick(item)}
					/>
				)}
			/>
		</ListContainer>
	)
}
