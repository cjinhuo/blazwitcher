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
	it('matches a longer command before a shorter command with the same prefix', () => {
		const result = matchPlugin([makePlugin('/s'), makePlugin('/se')], '/se test')

		expect(result[0]?.command).toBe('/se')
		expect(result[2]).toBe(' test')
	})

	it('keeps /s settings command working with an argument', () => {
		const result = matchPlugin([makePlugin('/s'), makePlugin('/se')], '/s search')

		expect(result[0]?.command).toBe('/s')
		expect(result[2]).toBe(' search')
	})

	it('does not match a command embedded in a longer token', () => {
		const result = matchPlugin([makePlugin('/s'), makePlugin('/se')], '/setting')

		expect(result[0]).toBeNull()
	})
})
