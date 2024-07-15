import "./sidepanel.css"

import { Layout } from "@douyinfe/semi-ui"
import { useEffect, useState } from "react"
import styled from "styled-components"

import { MAIN_CONTENT_CLASS } from "~shared/constants"
import { ItemType, type ListItemType } from "~shared/types"

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
  const [list, setList] = useState<ListItemType[]>([])
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "sidepanel" })
    port.postMessage({ type: "POPUP_OPENED" })

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "DATA_FROM_BACKGROUND") {
        console.log("side panel get", message)
      }
    })

    chrome.tabs.query({}, (tabs) => {
      console.log("sidepanel", tabs)
      const data = tabs.map((item) => ({ itemType: ItemType.Tab, data: item }))
      setList(data)
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {})
  }, [])
  const handleSearch = (value: string) => {}
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
