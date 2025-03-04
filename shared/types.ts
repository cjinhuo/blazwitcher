import type React from 'react'
import type { TranslationKeys } from '~sidepanel/atom'

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
	// 是否显示类型，在 top suggestions 下为 true
	isShowType?: boolean
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
	Divide = 'divide',
}

export interface ListItemType<T extends ItemType = ItemType> {
	itemType: T
	data: T extends keyof ItemTypeSet ? ItemTypeSet[T] : any
}

export enum OperationItemPropertyTypes {
	open = 'open',
	switch = 'switch',
	query = 'query',
	delete = 'delete',
	close = 'close',
}

export const OperationItemTitleMap: Record<string, TranslationKeys> = {
	[OperationItemPropertyTypes.open]: 'openCurrentTab',
	[OperationItemPropertyTypes.switch]: 'openCurrentTab',
	[OperationItemPropertyTypes.query]: 'query',
	[OperationItemPropertyTypes.delete]: 'deleteFromHistory',
	[OperationItemPropertyTypes.close]: 'closeTab',
}

export interface CommandPlugin {
	// 命令
	command: string
	// 别名，暂时不做
	alias?: string
	icon: React.ReactNode
	// 输入框背景的占位符
	description: string
	// 数据处理
	dataProcessing?: (data: ListItemType[]) => ListItemType[]
	// 渲染
	render?: () => React.ReactNode
}
