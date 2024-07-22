import { List as ListComponent } from "@douyinfe/semi-ui"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS } from "../shared/constants"
import { type ListItemType } from "../shared/types"
import {
  activeTab,
  closeCurrentWindowAndClearStorage,
  isBookmarkItem,
  isTabItem,
  scrollIntoViewIfNeeded
} from "../shared/utils"
import {
  HOST_CLASS,
  IMAGE_CLASS,
  RenderItem,
  SVG_CLASS,
  TITLE_CLASS
} from "./style"

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
    fill: var(--color-neutral-3);
  }
  &:hover {
    background-color: var(--color-neutral-3);
    .${IMAGE_CLASS} {
      background-color: var(--color-neutral-10);
    }
    .${TITLE_CLASS} {
      color: var(--color-neutral-9);
    }
    .${HOST_CLASS} {
      color: var(--color-neutral-6);
    }
    .${SVG_CLASS} {
      fill: var(--color-neutral-7);
    }
  }
  &.${LIST_ITEM_ACTIVE_CLASS} {
    background-color: var(--color-neutral-2);
    .${IMAGE_CLASS} {
      background-color: var(--color-neutral-10);
    }
    .${TITLE_CLASS} {
      color: var(--color-neutral-9);
    }
    .${HOST_CLASS} {
      color: var(--color-neutral-6);
    }
    .${SVG_CLASS} {
      fill: var(--color-neutral-7);
    }
  }
  &.semi-list-item {
    height: 50px;
  }
`

const setScrollTopIfNeeded = () => {
  const mainContent = document.querySelector(
    `.${MAIN_CONTENT_CLASS}`
  ) as HTMLElement
  const activeItem = document.querySelector(
    `.${LIST_ITEM_ACTIVE_CLASS}`
  ) as HTMLElement
  if (!activeItem) return
  scrollIntoViewIfNeeded(activeItem, mainContent)
}

export default function List({ list }: { list: ListItemType[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const i = useRef(0)

  useEffect(() => {
    setActiveIndex(0)
    i.current = 0
  }, [list])

  const changeActiveIndex = useCallback(
    (offset: number) => {
      let currentIndex = i.current
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
    [list, setActiveIndex]
  )

  const handleEnterEvent = useCallback(() => {
    const item = list[activeIndex]
    activeTab(item)
  }, [activeIndex, list])

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
            onClick={() => activeTab(item)}
            main={<RenderItem item={item}></RenderItem>}
          />
        )}
      />
    </ListContainer>
  )
}
