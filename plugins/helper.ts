import type { CommandPlugin } from '~shared/types'

export function matchPlugin(plugins: CommandPlugin[], value: string) {
	const hitPlugin = plugins.find((plugin) => plugin.command === value)
	if (hitPlugin) {
		return [hitPlugin, value.slice(hitPlugin.command.length)] as const
	}
	return [null, value] as const
}
