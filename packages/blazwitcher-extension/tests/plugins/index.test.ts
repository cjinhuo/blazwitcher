import { describe, expect, it } from 'vitest'
import { matchPlugin } from '~plugins/match-plugin'
import { ItemType, type ListItemType } from '~shared/types'

const makePlugin = (command: string): ListItemType<ItemType.Plugin> => ({
	itemType: ItemType.Plugin,
	data: {
		command,
		description: '',
		icon: null,
	},
})

describe('matchPlugin', () => {
	it.each([
		['/e GitHub', '/e', ' GitHub'],
		['/eGitHub', '/e', 'GitHub'],
		['/e', '/e', ''],
		['/e   GitHub', '/e', '   GitHub'],
		['/e\tGitHub', '/e', '\tGitHub'],
		['/s search', '/s', ' search'],
		['/ssearch', '/s', 'search'],
		['/setting', '/s', 'etting'],
	])('matches %s without changing its remaining argument', (input, command, argument) => {
		const result = matchPlugin([makePlugin('/s'), makePlugin('/e')], input)
		expect(result[0]?.command).toBe(command)
		expect(result[1]).toEqual([makePlugin(command)])
		expect(result[2]).toBe(argument)
	})

	it.each(['/b', '/h', '/t'])('keeps %s filters working with or without a space', (command) => {
		for (const argument of ['GitHub', ' GitHub']) {
			const result = matchPlugin([makePlugin(command)], `${command}${argument}`)
			expect(result[0]?.command).toBe(command)
			expect(result[2]).toBe(argument)
		}
	})

	it('keeps suggestions for an incomplete command', () => {
		const plugins = [makePlugin('/s'), makePlugin('/e')]
		expect(matchPlugin(plugins, '/')).toEqual([null, plugins, '/'])
	})

	it('returns no match for an unknown command', () => {
		expect(matchPlugin([makePlugin('/s'), makePlugin('/e')], '/unknown')).toEqual([null, [], '/unknown'])
	})
})
