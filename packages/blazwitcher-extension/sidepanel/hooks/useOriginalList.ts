import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import { originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import type { ListItemType, TabItemType, ExistingGroup, WindowData, UngroupedTab } from '~shared/types'
import { ItemType } from '~shared/types'

// 提取关键信息
const extractExistingGroups = (data: ListItemType[]): ExistingGroup[] => {
	const groupMap = new Map<number, ExistingGroup>()

	data.forEach((item) => {
		if (item.itemType === 'tab' && item.data.tabGroup) {
			const tabItem = item.data as TabItemType
			const group = tabItem.tabGroup
			
			if (group) {
				if (!groupMap.has(group.id)) {
					groupMap.set(group.id, {
						id: group.id,
						title: group.title,
						color: group.color,
						memberCount: 0,
						hosts: [],
						tabs: [],
					})
				}
				
				const groupInfo = groupMap.get(group.id)
				if (groupInfo) {
					groupInfo.memberCount++

					// 添加标签页详细信息（包含windowId）
					groupInfo.tabs.push({
						title: tabItem.title,
						url: tabItem.url,
						host: tabItem.host,
						windowId: tabItem.windowId,
					})

					// 收集域名信息
					const host = tabItem.host
					if (!groupInfo.hosts.includes(host)) {
						groupInfo.hosts.push(host)
					}
				}
			}
		}
	})

	return Array.from(groupMap.values())
}

const processDataForAI = (data: ListItemType[]): WindowData[] => {
	const tabs = data.filter((item): item is ListItemType<ItemType.Tab> => item.itemType === ItemType.Tab)

	// 按windowId分组
	const windowGroups = new Map<number, ListItemType<ItemType.Tab>[]>()

	tabs.forEach((item) => {
		const windowId = item.data.windowId
		if (!windowGroups.has(windowId)) {
			windowGroups.set(windowId, [])
		}
		const group = windowGroups.get(windowId)
		if (group) {
			group.push(item)
		}
	})

	const windowDataList: WindowData[] = []

	windowGroups.forEach((windowTabs, windowId) => {
		const existingGroups = extractExistingGroups(windowTabs)

		// 只处理当前窗口中未分组的标签页
		const ungroupedTabs: UngroupedTab[] = windowTabs
			.filter((item) => !item.data.tabGroup)
			.map((item) => ({
				itemType: ItemType.Tab,
				data: {
					id: item.data.id,
					title: item.data.title,
					url: item.data.url,
					host: item.data.host,
				},
			}))

		windowDataList.push({
			windowId,
			ungroupedTabs,
			existingGroups,
			summary: {
				totalTabs: windowTabs.length,
				ungroupedTabs: ungroupedTabs.length,
				existingGroupsCount: existingGroups.length,
			},
		})
	})

	return windowDataList
}

export default function useOriginalList() {
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const [, setWindowDataList] = useAtom(windowDataListAtom)

	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((processedList: ListItemType[]) => {
			portConnectStatus = true
			if (process.env.NODE_ENV !== 'production') {
				console.log('processedList', processedList)

				const windowDataList = processDataForAI(processedList)
				console.log('windowDataList for AI:', windowDataList)
				setWindowDataList(windowDataList)
			}
			setOriginalList(processedList)
		})

		const postMessageToCloseWindow = () => {
			if (!portConnectStatus) return
			port.postMessage({ type: 'close' })
			port.disconnect()
			portConnectStatus = false
		}
		window.addEventListener('unload', postMessageToCloseWindow)
		if (process.env.NODE_ENV === 'production') {
			window.addEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList, setWindowDataList])
	return originalList
}

export function useWindowDataList() {
	const [windowDataList] = useAtom(windowDataListAtom)
	return windowDataList
}
