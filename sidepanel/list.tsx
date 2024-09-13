import { List as ListComponent } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS } from "../shared/constants"
import { type ListItemType } from "../shared/types"
import { activeTab, closeCurrentWindowAndClearStorage, handleClickItem, scrollIntoViewIfNeeded } from "../shared/utils"
import { HIGHLIGHT_TEXT_CLASS, NORMAL_TEXT_CLASS } from "./highlight-text"
import { HOST_CLASS, IMAGE_CLASS, RenderItem, SVG_CLASS, VISIBILITY_CLASS } from "./list-item"

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

export default function List({ list ,handleOriginalList}: { list: ListItemType[] ,handleOriginalList: (params:{type:'add' | 'remove'}) => void}) {


	const [activeIndex, setActiveIndex] = useState(0)
	const i = useRef(0)

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

	const handleEnterEvent = useCallback(() => {
		const item = list[activeIndex]
		activeTab(item)
	}, [activeIndex, list])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useLayoutEffect(() => {
		setScrollTopIfNeeded()
	}, [activeIndex])

  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      const key = event.code
      switch (key) {
        case "ArrowUp":
          event.preventDefault()
          changeActiveIndex(-1)
          break
        case "Tab":
        case "ArrowDown":
          event.preventDefault()
          changeActiveIndex(1)
          break
        case "Enter":
          event.preventDefault()
          handleEnterEvent()
          break
        case "Escape": // KeyCode.ESC
          event.preventDefault()
          closeCurrentWindowAndClearStorage()
          break
        default:
          break
      }
    }
    window.addEventListener("keydown", keydownHandler)
    return () => {
      window.removeEventListener("keydown", keydownHandler)
    }
  }, [changeActiveIndex, handleEnterEvent])
  return (
    <ListContainer>
      <ListComponent
        grid={{
          gutter: [0, 8],
          span: 24
        }}
        dataSource={list}
        renderItem={(item, index) => (
          <ListItemWrapper
            className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ""}
            onClick={(event) => handleClickItem(item,event,handleOriginalList)}
            main={<RenderItem item={item}></RenderItem>}
          />
        )}
      />
    </ListContainer>
  )
}
