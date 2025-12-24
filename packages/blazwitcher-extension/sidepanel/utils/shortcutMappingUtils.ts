import { ItemType, OperationItemPropertyTypes } from '~shared/types'

/**
 * 根据 ItemType 获取对应的打开操作 ID
 */
export const getOpenOperationId = (itemType: ItemType): OperationItemPropertyTypes => {
	switch (itemType) {
		case ItemType.Tab:
			return OperationItemPropertyTypes.tabOpen
		case ItemType.History:
			return OperationItemPropertyTypes.historyOpen
		case ItemType.Bookmark:
			return OperationItemPropertyTypes.bookmarkOpen
		default:
			return OperationItemPropertyTypes.open
	}
}

/**
 * 根据 ItemType 获取对应的在当前页打开操作 ID
 */
export const getOpenHereOperationId = (itemType: ItemType): OperationItemPropertyTypes => {
	switch (itemType) {
		case ItemType.Tab:
			return OperationItemPropertyTypes.tabOpenHere
		case ItemType.History:
			return OperationItemPropertyTypes.historyOpenHere
		case ItemType.Bookmark:
			return OperationItemPropertyTypes.bookmarkOpenHere
		default:
			return OperationItemPropertyTypes.openHere
	}
}

/**
 * 根据 ItemType 获取对应的打开和在当前页打开的操作 ID
 */
export const getOpenOperationIds = (
	itemType: ItemType
): {
	openId: OperationItemPropertyTypes
	openHereId: OperationItemPropertyTypes
} => {
	return {
		openId: getOpenOperationId(itemType),
		openHereId: getOpenHereOperationId(itemType),
	}
}

/**
 * 根据 ItemType 获取该类型特定的操作 ID 列表
 */
export const getTypeSpecificOperationIds = (itemType: ItemType): OperationItemPropertyTypes[] => {
	switch (itemType) {
		case ItemType.Tab:
			return [OperationItemPropertyTypes.tabOpen, OperationItemPropertyTypes.tabOpenHere]
		case ItemType.History:
			return [OperationItemPropertyTypes.historyOpen, OperationItemPropertyTypes.historyOpenHere]
		case ItemType.Bookmark:
			return [OperationItemPropertyTypes.bookmarkOpen, OperationItemPropertyTypes.bookmarkOpenHere]
		default:
			return []
	}
}
