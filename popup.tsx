import { useEffect, useState } from "react"
import pinyin from "tiny-pinyin"

function isChineseChar(char) {
  const chineseCharRegex = /[\u4E00-\u9FFF]/
  return chineseCharRegex.test(char)
}

interface RecordItem extends chrome.bookmarks.BookmarkTreeNode {
  searchTarget: string
  folderName: string
}

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
    chrome.bookmarks.getTree((originalBookmarks) => {
      // Traversal bookmarks
      const traversal = (
        bookmarks: chrome.bookmarks.BookmarkTreeNode[],
        result: RecordItem[] = [],
        parent?: chrome.bookmarks.BookmarkTreeNode
      ) => {
        bookmarks.forEach((bookmark) => {
          const { children, ...rest } = bookmark
          if (children) {
            traversal(children, result, rest)
          }
          if (rest.url) {
            const chineseChars = Array.from(rest.title).filter((char) =>
              isChineseChar(char)
            )
            result.push({
              ...rest,
              searchTarget: `${rest.title} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${rest.url.replace(/^https?:\/\//, "")}`,
              folderName: parent?.title ?? "root"
            })
          }
        })
        return result
      }
      const result = traversal(originalBookmarks)
      debugger
      console.log(
        result.filter((item) => {
          return item.searchTarget.includes("yunwei")
        })
      )
    })
  }, [])
  const handleInput = (str: string) => {
    chrome.bookmarks.search(str, (bookmarks) => {
      console.log("search bookmarks", bookmarks)
    })
    setData(str)
  }
  return (
    <></>
    // <div
    //   style={{
    //     padding: 16
    //   }}>
    //   <h2>
    //     Welcome to your{" "}
    //     <a href="https://www.plasmo.com" target="_blank">
    //       Plasmo
    //     </a>{" "}
    //     Extension!
    //   </h2>
    //   <input onChange={(e) => handleInput(e.target.value)} value={data} />
    // </div>
  )
}

export default IndexPopup
