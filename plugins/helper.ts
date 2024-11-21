import type { CommandPlugin } from '~shared/types'

export function matchPlugin(plugins: CommandPlugin[], value: string) {
	const pluginMap = plugins.reduce<Record<string, CommandPlugin>>((acc, plugin) => {
		acc[plugin.command] = plugin
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
