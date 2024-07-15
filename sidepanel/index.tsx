import "./sidepanel.css"

import { Layout } from "@douyinfe/semi-ui"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import { MAIN_CONTENT_CLASS, MAIN_WINDOW } from "~shared/constants"
import { ItemType, type ListItemType } from "~shared/types"
import { isTabItem } from "~shared/utils"

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

    return () => {
      port.disconnect()
    }
  }, [])
  const handleSearch = (value: string) => {
    setList(
      originalList.current.filter((item) => {
        return item.data.searchTarget.includes(value)
      })
    )
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
