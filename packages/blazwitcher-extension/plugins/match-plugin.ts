import type { CommandPlugin, ItemType, ListItemType } from '~shared/types'

export function matchPlugin(
	plugins: ListItemType<ItemType.Plugin>[],
	value: string
): [hitPlugin: CommandPlugin | null, showPluginList: ListItemType<ItemType.Plugin>[], mainSearchValue: string] {
	const pluginMap = plugins.reduce<Record<string, ListItemType<ItemType.Plugin>>>((acc, plugin) => {
		acc[plugin.data.command] = plugin
		return acc
	}, {})
	const filteredPlugins = plugins.filter((plugin) => plugin.data.command.startsWith(value))
	for (let i = 0; i < value.length; i++) {
		const str = value.slice(0, i + 1)
		if (pluginMap[str]) {
			// 命中时只展示当前命中的插件
			return [pluginMap[str].data, [pluginMap[str]], value.slice(str.length)] as const
		}
	}
	return [null, filteredPlugins, value] as const
}
