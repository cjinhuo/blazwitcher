import pinyin from "tiny-pinyin";



import { getBookmarksTree, tabsQuery } from "./promisify";
import { ItemType, type BookmarkItemType, type ListItemType, type TabItemType } from "./types";
import { faviconURL, isChineseChar } from "./utils";


export async function tabsProcessing() {
  let processedTabs = await tabsQuery({})
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated", tabId, changeInfo, tab)
  })
  return () => processedTabs.map((tab) => ({ itemType: ItemType.Tab, data: processTabItem(tab) }))
}

function processTabItem(tab: chrome.tabs.Tab) {
  const chineseChars = Array.from(tab.title).filter((char) =>
    isChineseChar(char)
  )
  return {
    ...tab,
    searchTarget: `${tab.title} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${tab.url.replace(/^https?:\/\//, "")}`,
  }
}

export async function bookmarksProcessing() {
  const bookmarkTreeNode = await getBookmarksTree()
  let processedBookmarks = traversalBookmarkTreeNode(bookmarkTreeNode)

  return () => processedBookmarks.map((bookmark) => ({ itemType: ItemType.Bookmark, data: bookmark }))
}


export const traversalBookmarkTreeNode = (
  bookmarks: chrome.bookmarks.BookmarkTreeNode[],
  result: BookmarkItemType[] = [],
  parent?: chrome.bookmarks.BookmarkTreeNode
) => {
  bookmarks.forEach((bookmark) => {
    const { children, ...rest } = bookmark
    if (children) {
      traversalBookmarkTreeNode(children, result, rest)
    }
    if (rest.url) {
      const chineseChars = Array.from(rest.title).filter((char) =>
        isChineseChar(char)
      )
      // get favicon from chrome://favicon/ + url ,from https://stackoverflow.com/questions/10301636/how-can-i-get-the-bookmark-icon-in-chrome
      result.push({
        ...rest,
        favIconUrl: faviconURL(rest.url),
        searchTarget: `${rest.title} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${rest.url.replace(/^https?:\/\//, "")}`,
        folderName: parent?.title ?? "root"
      })
    }
  })
  return result
}

export async function dataProcessing() {
  const getTabs = await tabsProcessing()
  const getBookmarks = await bookmarksProcessing()
  return () => {
    const tabs = getTabs()
    const bookmarks = getBookmarks()
    console.log("bookmarks", bookmarks)
    return bookmarks
  }
}