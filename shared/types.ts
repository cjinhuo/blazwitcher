export type Matrix = [number, number][]

export interface SourceMappingData {
	pinyinString: string
	boundary: Matrix
	originalIndices: number[]
	originalString: string
	originalLength: number
}

interface BaseItemType {
	titleBoundaryMapping: SourceMappingData
	hitRanges?: Matrix
}
export interface TabItemType extends chrome.tabs.Tab, BaseItemType {
	titleBoundaryMapping: SourceMappingData
}
export interface BookmarkItemType extends chrome.bookmarks.BookmarkTreeNode, BaseItemType {
	folderName: string
	favIconUrl: string
}
export interface HistoryItemType extends chrome.history.HistoryItem, BaseItemType {
	favIconUrl: string
}

export interface ItemTypeSet {
	[ItemType.Tab]: TabItemType
	[ItemType.Bookmark]: BookmarkItemType
	[ItemType.History]: HistoryItemType
}

export enum ItemType {
	Tab = 'tab',
	Bookmark = 'bookmark',
	History = 'history',
}

export interface ListItemType<T extends ItemType = ItemType> {
	itemType: T
	data: ItemTypeSet[T]
}

export enum DataNameType {
	linkTo = 'linkTo',
	find = 'find',
	remove = 'remove',
	close = 'close',
	add = 'add',
}

export enum ListItemBtnNameType {
	linkTo = '跳转',
	find = '查找',
	remove = '删除',
	close = '关闭',
}
