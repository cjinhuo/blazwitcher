import { getBookmarksTree, tabsQuery } from "./promisify";


export async function tabsProcessing() {
  let processedTabs = []
  const currentTabs = await tabsQuery({})
  processedTabs = currentTabs
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated", tabId, changeInfo, tab)
  })
  return () => processedTabs
}

export async function bookmarksProcessing() {
  let processedBookmarks = []
  const bookmarks = await getBookmarksTree()
  requestIdleCallback(() => {
    
  })
  console.log('bookmarks', bookmarks)
  return () => processedBookmarks
}

export async function dataProcessing() {
  const getTabs = await tabsProcessing()
  const getBookmarks = await bookmarksProcessing()
  return () => {
    const tabs = getTabs()
    const bookmarks = getBookmarks()
    return {
      tabs,
      bookmarks
    }
  }
}