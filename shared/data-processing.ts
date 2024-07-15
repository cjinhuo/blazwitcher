import { getBookmarksTree } from "./promisify"

export function tabsProcessing() {
  chrome.tabs.query({}, (tabs) => {
    console.log("tabs", tabs)
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated", tabId, changeInfo, tab)
  })
}

export async function bookmarksProcessing() {
  const bookmarks = await getBookmarksTree()
  console.log('bookmarks', bookmarks)
}
