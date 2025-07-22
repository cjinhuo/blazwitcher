import type { CommandPlugin, ItemType, ListItemType } from '~shared/types'

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
