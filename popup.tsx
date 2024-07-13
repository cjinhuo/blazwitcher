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

    chrome.windows.create(
      {
        width: 800,
        height: 500,
        top: 200,
        left: 300,
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
