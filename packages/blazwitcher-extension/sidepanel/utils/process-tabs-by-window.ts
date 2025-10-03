import type { ExistingGroup, ListItemType, UngroupedTab, WindowData } from '~shared/types'
import { ItemType } from '~shared/types'
import { isTabItem } from '~shared/utils'

/**
 * 从标签页数据中提取现有分组信息
 * @param data 标签页数据列表
 * @returns 现有分组信息数组
 */
const extractExistingGroups = (data: ListItemType[]): ExistingGroup[] => {
	const groupMap = new Map<number, ExistingGroup>()

	data.forEach((item) => {
		if (!isTabItem(item) || !item.data.tabGroup) return

		const { tabGroup } = item.data
		const { id, title, color } = tabGroup

		// 如果分组不存在，创建新的分组记录
		if (!groupMap.has(id)) {
			groupMap.set(id, {
				id,
				title,
				color,
				memberCount: 0,
				hosts: [],
				tabs: [],
			})
		}

		const groupInfo = groupMap.get(id)
		if (!groupInfo) return

		groupInfo.memberCount++

		// 添加标签页详细信息
		groupInfo.tabs.push({
			title: item.data.title,
			url: item.data.url,
			host: item.data.host,
			windowId: item.data.windowId,
		})

		// 收集唯一的域名信息
		const { host } = item.data
		if (!groupInfo.hosts.includes(host)) {
			groupInfo.hosts.push(host)
		}
	})

	return Array.from(groupMap.values())
}

/**
 * 将标签页按窗口ID分组
 * @param tabs 标签页数据列表
 * @returns 按窗口ID分组的Map
 */
const groupTabsByWindow = (tabs: ListItemType<ItemType.Tab>[]): Map<number, ListItemType<ItemType.Tab>[]> => {
	const windowGroups = new Map<number, ListItemType<ItemType.Tab>[]>()

	tabs.forEach((item) => {
		const { windowId } = item.data
		if (!windowGroups.has(windowId)) {
			windowGroups.set(windowId, [])
		}
		windowGroups.get(windowId)?.push(item)
	})

	return windowGroups
}

/**
 * 将标签页转换为未分组标签页格式
 * @param tab 标签页数据
 * @returns 未分组标签页数据
 */
const convertToUngroupedTab = (tab: ListItemType<ItemType.Tab>): UngroupedTab => ({
	itemType: ItemType.Tab,
	data: {
		id: tab.data.id,
		title: tab.data.title,
		url: tab.data.url,
		host: tab.data.host,
	},
})

/**
 * 处理单个窗口的数据
 * @param windowTabs 窗口中的标签页列表
 * @param windowId 窗口ID
 * @returns 窗口数据
 */
const processWindowData = (windowTabs: ListItemType<ItemType.Tab>[], windowId: number): WindowData => {
	const existingGroups = extractExistingGroups(windowTabs)

	// 过滤出未分组的标签页并转换格式
	const ungroupedTabs = windowTabs.filter((item) => !item.data.tabGroup).map(convertToUngroupedTab)

	return {
		windowId,
		ungroupedTabs,
		existingGroups,
		summary: {
			totalTabs: windowTabs.length,
			ungroupedTabs: ungroupedTabs.length,
			existingGroupsCount: existingGroups.length,
		},
	}
}

/**
 * 处理标签页数据为AI分析用的窗口数据
 * @param data 原始标签页数据列表
 * @returns 按窗口分组的AI分析数据
 */
export const processTabsForAI = (data: ListItemType[]): WindowData[] => {
	// 过滤出标签页类型的数据
	const tabs = data.filter((item): item is ListItemType<ItemType.Tab> => isTabItem(item))

	// 按窗口ID分组
	const windowGroups = groupTabsByWindow(tabs)

	// 处理每个窗口的数据
	return Array.from(windowGroups.entries()).map(([windowId, windowTabs]) => processWindowData(windowTabs, windowId))
}
