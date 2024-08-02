import "./sidepanel.css"

import { Layout } from "@douyinfe/semi-ui"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import {
  DEFAULT_BOOKMARK_DISPLAY_COUNT,
  DEFAULT_HISTORY_DISPLAY_COUNT,
  MAIN_CONTENT_CLASS,
  MAIN_WINDOW
} from "~shared/constants"
import { ItemType, type ListItemType } from "~shared/types"
import {
  isBookmarkItem,
  isDarkMode,
  isHistoryItem,
  isTabItem
} from "~shared/utils"

import Footer from "./footer"
import List from "./list"
import Search from "./search"

const { Header, Content } = Layout
const Container = styled(Layout)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
const ContentWrapper = styled(Content)`
  flex: 1;
  overflow-y: scroll;
  padding: 0;
`

const orderList = (list: ListItemType[]) => {
  const activeTabs: ListItemType<ItemType.Tab>[] = []
  const inactiveTabs: ListItemType<ItemType.Tab>[] = []
  const bookmarks: ListItemType<ItemType.Bookmark>[] = []
  const histories: ListItemType<ItemType.History>[] = []
  const tabTitleSet = new Set()
  for (const item of list) {
    const { title } = item.data
    if (isTabItem(item)) {
      item.data.active ? activeTabs.push(item) : inactiveTabs.push(item)
      tabTitleSet.add(title)
    } else if (isBookmarkItem(item) && !tabTitleSet.has(title)) {
      bookmarks.push(item)
    } else if (isHistoryItem(item) && !tabTitleSet.has(title)) {
      histories.push(item)
    }
  }
  const compareFn = (
    a: ListItemType<ItemType.Tab>,
    b: ListItemType<ItemType.Tab>
  ) => (a.data.lastAccessed ? b.data.lastAccessed - a.data.lastAccessed : -1)

  const excludedTabs = activeTabs
    .filter((item) => !item.data.url.includes(chrome.runtime.id))
    .toSorted(compareFn)

  inactiveTabs.sort(compareFn)
  return [
    ...excludedTabs,
    ...inactiveTabs,
    ...histories.slice(0, DEFAULT_HISTORY_DISPLAY_COUNT),
    ...bookmarks.slice(0, DEFAULT_BOOKMARK_DISPLAY_COUNT)
  ]
}

export default function SidePanel() {
  const originalList = useRef<ListItemType[]>([])
  const [list, setList] = useState<ListItemType[]>([])
  useEffect(() => {
    let portConnectStatus = false
    const port = chrome.runtime.connect({ name: MAIN_WINDOW })
    port.onMessage.addListener((processedList) => {
      portConnectStatus = true
      console.log("processedList", processedList)
      setList(orderList(processedList))
      originalList.current = processedList
    })

    const postMessageToCloseWindow = () => {
      if (!portConnectStatus) return
      port.postMessage({ type: "close" })
      port.disconnect()
      portConnectStatus = false
    }
    window.addEventListener("unload", postMessageToCloseWindow)
    // window.addEventListener("blur", postMessageToCloseWindow)
    if (isDarkMode()) {
      document.body.classList.add("dark")
      document.body.setAttribute("theme-mode", "dark")
    }
  }, [])
  const handleSearch = (value: string) => {
    const finalList = originalList.current.filter(
      (item) =>
        value.split(" ").every((v) => item.data.searchTarget.includes(v))
      // indexOf
    )
    console.log("finalList", finalList)
    setList(orderList(finalList))
  }
  return (
    <Container>
      <Header style={{ flex: "0 0 50px" }}>
        <Search onSearch={handleSearch}></Search>
      </Header>
      <ContentWrapper className={MAIN_CONTENT_CLASS}>
        <List list={list}></List>
      </ContentWrapper>
      <Footer />
    </Container>
  )
}
