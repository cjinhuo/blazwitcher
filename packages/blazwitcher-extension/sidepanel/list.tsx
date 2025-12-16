import { IllustrationNoResult, IllustrationNoResultDark } from '@douyinfe/semi-illustrations'
import { Empty, List as ListComponent } from '@douyinfe/semi-ui'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { HIGHLIGHT_TEXT_CLASS, HOST_CLASS, IMAGE_CLASS, NORMAL_TEXT_CLASS, SVG_CLASS } from '~shared/common-styles'
import type { ListItemType } from '~shared/types'
import { useKeyboardListen } from '~sidepanel/hooks/useKeyboardListen'
import { DIVIDE_CLASS, LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS, VISIBILITY_CLASS } from '../shared/constants'
import { isDivideItem, scrollIntoViewIfNeeded } from '../shared/utils'
import { activeItemAtom, compositionAtom, i18nAtom } from './atom'

const ListContainer = styled.div`
  padding: 6px;
  .semi-list-item-body-main {
    width: 100%;
    overflow: hidden;
		cursor: default;
  }
  .semi-list-item-body {
    overflow: hidden;
  }
`

const Divide = styled.div`
  padding: 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-4);
  display: flex;
  align-items: center;
  /* border-bottom: 1px solid var(--color-neutral-8); */
  letter-spacing: 0.6px;
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

		/* 截图预览 */
		/* border-radius: 4px;
		background-color: var(--color-neutral-3); */

  }
  .${HIGHLIGHT_TEXT_CLASS} {
		color: var(--highlight-text);
    background-color: var(--highlight-bg);

		/* 截图预览 */
		/* margin: 0 4px;
    color: transparent;
		border-radius: 4px; */
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

			/* 截图预览 */
			/* background-color: var(--color-neutral-8); */
    }
    .${HIGHLIGHT_TEXT_CLASS} {
      background-color: var(--highlight-selected-bg);

			/* 截图预览 */
			/* color: transparent; */
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

const HeaderItem = styled(ListComponent.Item)`
`

const setScrollTopIfNeeded = () => {
	const mainContent = document.querySelector(`.${MAIN_CONTENT_CLASS}`) as HTMLElement
	const activeItem = document.querySelector(`.${LIST_ITEM_ACTIVE_CLASS}`) as HTMLElement
	if (!activeItem) return
	let divideItem = activeItem.parentElement?.previousElementSibling?.firstChild as HTMLElement | undefined
	if (!divideItem?.classList?.contains(DIVIDE_CLASS)) {
		divideItem = undefined
	}
	scrollIntoViewIfNeeded(activeItem, mainContent, divideItem)
}

interface ListProps<T extends ListItemType = ListItemType> {
	list: T[]
	// 通过 props 传进来就可以在外面控制如何渲染和点击事件
	RenderItem: React.FC<{ item: T }>
	handleItemClick: (item: T) => void
}

export default function List({ list, RenderItem, handleItemClick }: ListProps) {
	const i18n = useAtomValue(i18nAtom)
	const isComposition = useAtomValue(compositionAtom)
	const setActiveItem = useSetAtom(activeItemAtom)
	const [activeIndex, setActiveIndex] = useState<number>(-1)
	const i = useRef(activeIndex)
	const timer = useRef<NodeJS.Timeout>()
	// 累积的偏移量，用于在快速连续按键时收集所有偏移量，通过防抖机制批量处理，避免频繁更新 activeIndex 造成性能问题
	const accumulatedOffset = useRef(0)

	useEffect(() => {
		// reset active index to first non-divide item
		const firstValidIndex = list.findIndex((item) => !isDivideItem(item))
		setActiveIndex(firstValidIndex)
		i.current = firstValidIndex
	}, [list])

	useEffect(() => {
		setActiveItem(list[activeIndex])
		return () => {
			setActiveItem(undefined)
		}
	}, [activeIndex, list, setActiveItem])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useLayoutEffect(() => {
		setScrollTopIfNeeded()
	}, [activeIndex])

	const changeActiveIndex = useCallback(
		(offset: number) => {
			let targetIndex = i.current + offset

			// 处理边界情况
			if (targetIndex < 0) {
				targetIndex = list.length - 1
			}
			if (targetIndex >= list.length) {
				targetIndex = list.findIndex((item) => !isDivideItem(item))
			}

			// 跳过分隔项
			while (targetIndex >= 0 && targetIndex < list.length && isDivideItem(list[targetIndex])) {
				targetIndex += offset > 0 ? 1 : -1

				// 再次处理边界
				if (targetIndex < 0) {
					targetIndex = list.length - 1
				}
				if (targetIndex >= list.length) {
					targetIndex = list.findIndex((item) => !isDivideItem(item))
					break
				}
			}

			i.current = targetIndex
			setActiveIndex(targetIndex)
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

	const keydownHandler = useCallback(
		(event: KeyboardEvent) => {
			// 如果 Enter 键配合修饰键（如 Shift），走 useKeyboardListen 的监听
			if (event.code === 'Enter' && (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey)) {
				return
			}

			const keyActions: { [key: string]: () => void } = {
				ArrowUp: () => keyActionsChangeIndex(-1),
				Tab: () => keyActionsChangeIndex(1),
				ArrowDown: () => keyActionsChangeIndex(1),
				Enter: handleEnterEvent,
			}

			const action = keyActions[event.code]
			if (action) {
				event.preventDefault()
				action()
			}
		},
		[handleEnterEvent, keyActionsChangeIndex]
	)

	// listen shortcut event (注意键位可能有冲突，这边监听了两个keydown事件)
	useKeyboardListen(list, activeIndex)
	// listen default event
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
				emptyContent={
					<Empty
						image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
						darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
						description={i18n('emptySearch')}
						style={{
							padding: 30,
						}}
					/>
				}
				renderItem={(item, index) => {
					if (isDivideItem(item)) {
						return (
							// 点击该元素时不让搜索框失去焦点
							<div onMouseDown={(e) => e.preventDefault()}>
								<HeaderItem className={DIVIDE_CLASS} main={<Divide>{item.data.name}</Divide>} />
							</div>
						)
					}
					return (
						<ListItemWrapper
							className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ''}
							main={<RenderItem item={item} />}
							onClick={() => handleItemClick(item)}
						/>
					)
				}}
			/>
		</ListContainer>
	)
}
