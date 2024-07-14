import { useEffect, useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")
  useEffect(() => {
    console.log(11111)
    console.log(chrome.tabs)
    console.log(chrome.bookmarks)
    // chrome.action.onClicked.addListener((tab) => {
    //   console.log("tab", tab)
    //   chrome.action.setTitle({
    //     tabId: tab.id,
    //     title: `You are on tab: ${tab.id}`
    //   })
    // })

    const SEARCH_WINDOW_WIDTH = 900
    const SEARCH_WINDOW_HEIGHT = 500
    console.log(
      "(window.screen.availHeight - SEARCH_WINDOW_HEIGHT) / 2",
      window.screen.availHeight,
      (window.screen.availHeight - SEARCH_WINDOW_HEIGHT) / 2
    )
    chrome.windows.create(
      {
        width: SEARCH_WINDOW_WIDTH,
        height: SEARCH_WINDOW_HEIGHT,
        // use width instead of availWidth could make it looks more centered
        left: Math.floor((window.screen.width - SEARCH_WINDOW_WIDTH) / 2),
        top: Math.floor((window.screen.availHeight - SEARCH_WINDOW_HEIGHT) / 2),
        focused: true,
        type: "popup",
        url: "./sidepanel.html"
      },
      (window) => {
        console.log("created window", window)
      }
    )

    // chrome.history
  }, [])
  return <div style={{ width: 0, height: 0 }}></div>
}

export default IndexPopup
