// 插件模块统一导出
import { type CommandPlugin, ItemType, type ListItemType } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'
import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin, settingPlugin } from './commands'

// UI组件导出
export { RenderPluginItem, usePluginClickItem } from './ui/render-item'
export { SettingPanels } from './ui/setting-panels'

// 命令插件导出
export { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin, settingPlugin } from './commands'

// 插件匹配工具函数
export function matchPlugin(plugins: ListItemType<ItemType.Plugin>[], value: string) {
	const pluginMap = plugins.reduce<Record<string, CommandPlugin>>((acc, plugin) => {
		acc[plugin.data.command] = plugin.data
		return acc
	}, {})
	for (let i = 0; i < value.length; i++) {
		const str = value.slice(0, i + 1)
		if (pluginMap[str]) {
			return [pluginMap[str], value.slice(str.length)] as const
		}
	}
	return [null, value] as const
}

// 默认插件列表
const plugins = (i18n: i18nFunction): ListItemType<ItemType.Plugin>[] =>
	[settingPlugin(i18n), filterByTabPlugin(i18n), filterByHistoryPlugin(i18n), filterByBookmarkPlugin(i18n)].map(
		(plugin) => ({
			itemType: ItemType.Plugin,
			data: plugin,
		})
	)

export default plugins
