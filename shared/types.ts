import type React from 'react'

export type Matrix = [number, number][]

export interface SourceMappingData {
	pinyinString: string
	boundary: Matrix
	originalIndices: number[]
	originalString: string
	originalLength: number
}

interface BaseItemType {
	// a set of title,host,folderName and group
	compositeSource: string
	compositeBoundaryMapping: SourceMappingData
	compositeHitRanges?: Matrix

	host: string

	titleHitRanges?: Matrix
	hostHitRanges?: Matrix
	groupNameHitRanges?: Matrix
}
export interface TabItemType extends chrome.tabs.Tab, BaseItemType {
	titleBoundaryMapping: SourceMappingData
	tabGroup: chrome.tabGroups.TabGroup | null
}
export interface BookmarkItemType extends chrome.bookmarks.BookmarkTreeNode, BaseItemType {
	folderName: string
	folderNameHitRanges?: Matrix
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

export enum OperationItemPropertyTypes {
	open = 'open',
	switch = 'switch',
	query = 'query',
	delete = 'delete',
	close = 'close',
}

export const OperationItemTitleMap = {
	[OperationItemPropertyTypes.open]: 'open new window',
	[OperationItemPropertyTypes.switch]: 'switch to tab',
	[OperationItemPropertyTypes.query]: 'query',
	[OperationItemPropertyTypes.delete]: 'delete from history',
	[OperationItemPropertyTypes.close]: 'close tab',
}

export interface CommandPlugin {
	command: string
	alias: string
	dataProcessing?: (data: ListItemType) => ListItemType
	render?: () => React.ReactNode
}
