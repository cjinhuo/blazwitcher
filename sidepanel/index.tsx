import "./sidepanel.css"

import { useEffect } from "react"
import styled from "styled-components"

import { traversal } from "./utils"

const Container = styled.div``
export default function SidePanel() {
  useEffect(() => {
    chrome.bookmarks.getTree((originalBookmarks) => {
      // Traversal bookmarks
      const result = traversal(originalBookmarks)
      console.log(
        result.filter((item) => {
          return item.searchTarget.includes("yunwei")
        })
      )
    })
    chrome.tabs.query({}, (tabs) => {
      console.log("sidepanel", tabs)
    })
    console.log("sidepanel", chrome.tabs)
  }, [])
  return <Container>sidepanel</Container>
}
