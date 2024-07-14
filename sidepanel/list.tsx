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
import {
  ItemType,
  type BookmarkItemType,
  type HistoryItemType,
  type ItemTypeSet,
  type ListItemType,
  type TabItemType
} from "./types"
import { isTabItem, scrollIntoViewIfNeeded } from "./utils"

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

const activeTab = (item: ListItemType<ItemType.Tab>) => {
  chrome.tabs.update(item.data.id, {
    active: true
  })
  chrome.storage.session.get("selfWindowId", (result) => {
    const selfWindowId = result.selfWindowId
    chrome.windows.remove(selfWindowId)
  })
}

export default function List({ list }: { list: ListItemType[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const i = useRef(0)

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
    if (isTabItem(item)) {
      activeTab(item)
      console.log("enter", item)
    }
  }, [activeIndex, list])

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
        case 13: // KeyCode.ENTER
          event.preventDefault()
          handleEnterEvent()
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
    <div>
      <ListComponent
        dataSource={list}
        renderItem={(item, index) => (
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
                  {item.data.title}
                </span>
              </div>
            }
            extra={
              <Button
                onClick={() => {
                  if (isTabItem(item)) {
                    activeTab(item)
                  }
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
