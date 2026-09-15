// 插件模块统一导出
import { ItemType, type ListItemType } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'
import {
	aiGroupingPlugin,
	duplicateCurrentTabPlugin,
	filterByBookmarkPlugin,
	filterByHistoryPlugin,
	filterByTabPlugin,
	pinCurrentTabPlugin,
	searchEnginePlugin,
	settingPlugin,
} from './commands'

// 命令插件导出
export { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin, settingPlugin } from './commands'
// 插件匹配工具函数
export { matchPlugin } from './match-plugin'
// UI组件导出
export { RenderPluginItem, usePluginClickItem } from './ui/render-item'
export { SettingPanels } from './ui/setting-panels'

// 默认插件列表
const plugins = (i18n: i18nFunction): ListItemType<ItemType.Plugin>[] =>
	[
		settingPlugin(i18n),
		searchEnginePlugin(i18n),
		aiGroupingPlugin(i18n),
		pinCurrentTabPlugin(i18n),
		duplicateCurrentTabPlugin(i18n),
		filterByTabPlugin(i18n),
		filterByHistoryPlugin(i18n),
		filterByBookmarkPlugin(i18n),
	].map((plugin) => ({
		itemType: ItemType.Plugin,
		data: plugin,
	}))

export default plugins
