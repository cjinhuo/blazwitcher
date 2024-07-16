import "./sidepanel.css"

import { Layout } from "@douyinfe/semi-ui"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import { MAIN_CONTENT_CLASS, MAIN_WINDOW } from "~shared/constants"
import { ItemType, type ListItemType } from "~shared/types"
import {
  closeCurrentWindowAndClearStorage,
  isBookmarkItem,
  isTabItem
} from "~shared/utils"

import List from "./list"
import Search from "./search"

const { Header, Footer, Content } = Layout
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

export default function SidePanel() {
  const originalList = useRef<ListItemType[]>([])
  const [list, setList] = useState<ListItemType[]>([])
  useEffect(() => {
    const port = chrome.runtime.connect({ name: MAIN_WINDOW })
    port.onMessage.addListener((processedList) => {
      console.log("processedList", processedList)
      setList(processedList)
      originalList.current = processedList
    })

    window.addEventListener("unload", function () {
      port.postMessage({ type: "close" })
      port.disconnect()
    })
  }, [])
  const handleSearch = (value: string) => {
    const tabs: ListItemType<ItemType.Tab>[] = []
    const bookmarks: ListItemType<ItemType.Bookmark>[] = []
    for (const item of originalList.current) {
      if (!item.data.searchTarget.includes(value)) continue
      if (isTabItem(item)) {
        tabs.push(item)
      }
      if (isBookmarkItem(item)) {
        bookmarks.push(item)
      }
    }
    tabs.sort((a, b) =>
      a.data.lastAccessed ? b.data.lastAccessed - a.data.lastAccessed : -1
    )
    setList([...tabs, ...bookmarks])
  }
  return (
    <Container>
      <Header style={{ flex: "0 0 50px" }}>
        <Search onSearch={handleSearch}></Search>
      </Header>
      <ContentWrapper className={MAIN_CONTENT_CLASS}>
        <List list={list}></List>
      </ContentWrapper>
      <Footer style={{ flex: "0 0 30px" }}>footer</Footer>
    </Container>
  )
}
