import pinyin from "tiny-pinyin";



import { getBookmarksTree, tabsQuery } from "./promisify";
import { ItemType, type BookmarkItemType, type ListItemType } from "./types";
import { isChineseChar } from "./utils";


export async function tabsProcessing() {
  let processedTabs: ListItemType[] = []
  const currentTabs = await tabsQuery({})
  processedTabs = currentTabs.map((tab) => ({
    itemType: ItemType.Tab,
    data: processTabItem(tab)
  }))
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated", tabId, changeInfo, tab)
  })
  return () => processedTabs
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
  let processedBookmarks = []
  const bookmarkTreeNode = await getBookmarksTree()
  const allBookmarks = traversalBookmarkTreeNode(bookmarkTreeNode)
  return () => processedBookmarks
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
      result.push({
        ...rest,
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
    // const bookmarks = getBookmarks()
    return tabs
  }
}