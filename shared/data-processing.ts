import pinyin from "tiny-pinyin"

import {
  DEFAULT_HISTORY_MAX_DAYS,
  DEFAULT_HISTORY_MAX_RESULTS,
  ONE_DAY_MILLISECONDS
} from "./constants"
import { getBookmarksTree, historySearch, tabsQuery } from "./promisify"
import {
  ItemType,
  type BookmarkItemType,
  type HistoryItemType,
} from "./types"
import { faviconURL, isChineseChar } from "./utils"

export async function tabsProcessing() {
  let processedTabs = await tabsQuery({})
  // filter the tabs that start with chrome://
  return processedTabs
    .filter((item) => !item.url.startsWith("chrome://"))
    .map((tab) => ({ itemType: ItemType.Tab, data: processTabItem(tab) }))
}

function processTabItem(tab: chrome.tabs.Tab) {
  const chineseChars = Array.from(tab.title).filter((char) =>
    isChineseChar(char)
  )
  return {
    ...tab,
    searchTarget: `${tab.title.toLowerCase()} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${tab.url.replace(/^https?:\/\//, "")}`
  }
}

export function bookmarksProcessing() {
  let processedBookmarks: BookmarkItemType[] = []
  getBookmarksTree().then((bookmarks) => {
    processedBookmarks = traversalBookmarkTreeNode(bookmarks)
  })
  // todo 订阅 delete add 事件
  chrome.bookmarks.onChanged.addListener((changes) => {})

  return () =>
    processedBookmarks.map((bookmark) => ({
      itemType: ItemType.Bookmark,
      data: bookmark
    }))
}

function processHistoryItem(history: chrome.history.HistoryItem) {
  const chineseChars = Array.from(history.title).filter((char) =>
    isChineseChar(char)
  )
  return {
    ...history,
    searchTarget: `${history.title.toLowerCase()} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${history.url.replace(/^https?:\/\//, "")}`,
    favIconUrl: faviconURL(history.url)
  }
}

// 默认搜索最近 200 条历史记录，一天一天的向前遍历，最大遍历 30 天

async function retrieveRecentHistories(
  count = DEFAULT_HISTORY_MAX_RESULTS,
  maxDays = DEFAULT_HISTORY_MAX_DAYS
) {
  const data: HistoryItemType[] = []
  for (let day = 1; day < maxDays; day++) {
    const rawData = await historySearch({
      startTime: Date.now() - day * ONE_DAY_MILLISECONDS,
      endTime: Date.now() - (day - 1) * ONE_DAY_MILLISECONDS,
      maxResults: count - data.length,
      text: ""
    })
    data.push(...rawData.map((item) => processHistoryItem(item)))
    if (data.length >= count) return data
  }
  return data
}

export function historyProcessing() {
  let processedHistory: HistoryItemType[] = []
  retrieveRecentHistories().then((data) => {
    processedHistory = data
  })
  return () =>
    processedHistory.map((item) => ({
      itemType: ItemType.History,
      data: item
    }))
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
        searchTarget: `${rest.title.toLowerCase()} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${rest.url.replace(/^https?:\/\//, "")}`,
        folderName: parent?.title ?? "root"
      })
    }
  })
  return result
}

export function dataProcessing() {
  // Since the bookmarks may be too large, we should use async callback to get.
  // Just don't effect the main thread
  const getBookmarks = bookmarksProcessing()
  const getHistory = historyProcessing()
  return async () => {
    // because the tabs data not really too large, so we can use sync calculation.
    // And it would be changed very frequently so listening the update of it is not a good idea.
    const tabs = await tabsProcessing()
    const bookmarks = getBookmarks()
    const history = getHistory()
    return [...tabs, ...bookmarks, ...history]
  }
}
