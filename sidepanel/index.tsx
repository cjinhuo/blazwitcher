import "./sidepanel.css"

import { Layout } from "@douyinfe/semi-ui"
import { useEffect, useState } from "react"
import styled from "styled-components"

import { MAIN_CONTENT_CLASS } from "./constants"
import List, { type ListItemType } from "./list"
import Search from "./search"
import { ItemType } from "./types"
import { traversal } from "./utils"

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
  const [list, setList] = useState<ListItemType[]>([])
  useEffect(() => {
    chrome.bookmarks.getTree((originalBookmarks) => {
      // Traversal bookmarks
      const result = traversal(originalBookmarks)
      // console.log(
      //   result.filter((item) => {
      //     return item.searchTarget.includes("yunwei")
      //   })
      // )
    })
    chrome.tabs.query({}, (tabs) => {
      console.log("sidepanel", tabs)
      const data = tabs.map((item) => ({ itemType: ItemType.Tab, data: item }))
      setList(data)
    })
    console.log("sidepanel", chrome.tabs)
  }, [])
  const handleSearch = (value: string) => {
    console.log("search", value)
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
