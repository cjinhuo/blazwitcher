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
	[ItemType.Plugin]: CommandPlugin
}

export enum ItemType {
	Tab = 'tab',
	Bookmark = 'bookmark',
	History = 'history',
	Divide = 'divide',
	Plugin = 'plugin',
}

export interface ListItemType<T extends ItemType = ItemType> {
	itemType: T
	data: T extends keyof ItemTypeSet ? ItemTypeSet[T] : any
}

export enum OperationItemPropertyTypes {
	start = 'start',
	open = 'open',
	switch = 'switch',
	pin = 'pin',
	query = 'query',
	delete = 'delete',
	close = 'close',
}

export const OperationItemTitleMap: Record<string, TranslationKeys> = {
	[OperationItemPropertyTypes.open]: 'openCurrentTab',
	[OperationItemPropertyTypes.switch]: 'openCurrentTab',
	[OperationItemPropertyTypes.pin]: 'pin',
	[OperationItemPropertyTypes.query]: 'query',
	[OperationItemPropertyTypes.delete]: 'deleteFromHistory',
	[OperationItemPropertyTypes.close]: 'closeTab',
}

export interface CommandPlugin {
	command: string
	alias?: string
	icon: React.ReactNode
	description: string
	dataProcessing?: (data: ListItemType[]) => ListItemType[]
	render?: (searchValue?: string) => React.ReactNode
}

type ColorKey = 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange'

export type ColorTheme = {
	[key in ColorKey]: string
}

export type TabGroupColorMapType = {
	light: ColorTheme
	dark: ColorTheme
}

// 现有分组中的标签页信息
export interface TabInGroup {
	title: string
	url: string
	host: string
	windowId: number
}

// 现有分组信息
export interface ExistingGroup {
	id: number
	title: string
	color: string
	memberCount: number
	hosts: string[]
	tabs: TabInGroup[]
}

// 未分组的标签页信息
export interface UngroupedTab {
	itemType: ItemType.Tab
	data: {
		id: number
		title: string
		url: string
		host: string
	}
}

// 窗口数据摘要
export interface WindowSummary {
	totalTabs: number
	ungroupedTabs: number
	existingGroupsCount: number
}

// 单个窗口的数据结构
export interface WindowData {
	windowId: number
	ungroupedTabs: UngroupedTab[]
	existingGroups: ExistingGroup[]
	summary: WindowSummary
}

// ai分组处理进度
export interface AiGroupingProgress {
	isProcessing: boolean
	totalOperations: number
	completedOperations: number
	percentage: number
}
