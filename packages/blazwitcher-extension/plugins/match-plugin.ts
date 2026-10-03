import type { CommandPlugin, ItemType, ListItemType } from '~shared/types'

export function matchPlugin(
	plugins: ListItemType<ItemType.Plugin>[],
	value: string
): [hitPlugin: CommandPlugin | null, showPluginList: ListItemType<ItemType.Plugin>[], mainSearchValue: string] {
	const pluginMap = plugins.reduce<Record<string, ListItemType<ItemType.Plugin>>>((acc, plugin) => {
		acc[plugin.data.command] = plugin
		return acc
	}, {})
	const commandToken = value.trim().split(/\s+/, 1)[0]
	const hitPlugin = pluginMap[commandToken]
	if (hitPlugin) {
		return [hitPlugin.data, [hitPlugin], value.slice(commandToken.length)] as const
	}

	const filteredPlugins = plugins.filter((plugin) => plugin.data.command.startsWith(value))
	return [null, filteredPlugins, value] as const
}
