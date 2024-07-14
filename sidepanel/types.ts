export interface TabItemType extends chrome.tabs.Tab {}
export interface BookmarkItemType extends chrome.bookmarks.BookmarkTreeNode {}
export interface HistoryItemType extends chrome.history.HistoryItem {}


export interface ItemTypeSet {
  [ItemType.Tab]: TabItemType
  [ItemType.Bookmark]: BookmarkItemType
  [ItemType.History]: HistoryItemType
}

export enum ItemType {
  Tab = "tab",
  Bookmark = "bookmark",
  History = "history"
}

export interface ListItemType<T extends ItemType = ItemType> {
  itemType: T
  data: ItemTypeSet[T]
}