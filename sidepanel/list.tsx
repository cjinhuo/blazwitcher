import { IconArrowRight } from "@douyinfe/semi-icons"
import { Button, List as ListComponent } from "@douyinfe/semi-ui"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

import { LIST_ITEM_ACTIVE_CLASS, MAIN_CONTENT_CLASS } from "./constants"
import type {
  BookmarkItemType,
  HistoryItemType,
  ItemType,
  TabItemType
} from "./types"
import { scrollIntoViewIfNeeded } from "./utils"

export interface ListItemType<T = ItemType> {
  itemType: T
  data: T extends ItemType.Bookmark
    ? BookmarkItemType
    : T extends ItemType.Tab
      ? TabItemType
      : HistoryItemType
}

const ListItemWrapper = styled(ListComponent.Item)`
  &:hover {
    background-color: deepskyblue;
  }
  &.${LIST_ITEM_ACTIVE_CLASS} {
    background-color: deepskyblue;
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
  const [activeIndex, setActiveIndex] = useState(-1)
  const i = useRef(0)

  let changeActiveIndex = useCallback(
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

  useLayoutEffect(() => {
    setScrollTopIfNeeded()
  }, [activeIndex])

  useEffect(() => {
    let keydownHandler = (event) => {
      let key = event.keyCode
      switch (key) {
        case 38: // KeyCode.UP
          event.preventDefault()
          changeActiveIndex(-1)
          break
        case 40: // KeyCode.DOWN
          event.preventDefault()
          changeActiveIndex(1)
          break
        default:
          break
      }
    }
    window.addEventListener("keydown", keydownHandler)
    return () => {
      window.removeEventListener("keydown", keydownHandler)
    }
  }, [changeActiveIndex])
  return (
    <div>
      <ListComponent
        dataSource={list}
        renderItem={({ itemType, data }, index) => (
          <ListItemWrapper
            className={index === activeIndex ? LIST_ITEM_ACTIVE_CLASS : ""}
            header={<>header</>}
            main={
              <div>
                <span
                  style={{
                    color: "var(--semi-color-text-0)",
                    fontWeight: 500
                  }}>
                  {data.title}
                </span>
              </div>
            }
            extra={
              <Button
                onClick={() => {
                  chrome.tabs.update((data as TabItemType).id, {
                    active: true
                  })
                  chrome.storage.session.get("selfWindowId", (result) => {
                    const selfWindowId = result.selfWindowId
                    chrome.windows.remove(selfWindowId)
                  })
                }}>
                <IconArrowRight />
              </Button>
            }
          />
        )}
      />
    </div>
  )
}
