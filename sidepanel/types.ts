export interface TabItemType extends chrome.tabs.Tab {}
export interface BookmarkItemType extends chrome.bookmarks.BookmarkTreeNode {}
export interface HistoryItemType extends chrome.history.HistoryItem {}




export enum ItemType {
  Tab = "tab",
  Bookmark = "bookmark",
  History = "history"
}