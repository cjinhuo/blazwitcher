import { describe, expect, it } from 'vitest'
import { collectPressedKeys, isModifierKey, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'

describe('collectPressedKeys', () => {
	const makeEvent = (overrides: Partial<KeyboardEvent> = {}) =>
		({
			ctrlKey: false,
			metaKey: false,
			altKey: false,
			shiftKey: false,
			key: '',
			code: '',
			...overrides,
		}) as unknown as KeyboardEvent

	it('should collect modifier keys', () => {
		const result = collectPressedKeys(makeEvent({ ctrlKey: true, key: 'Control', code: 'ControlLeft' }))
		expect(result).toEqual(['Ctrl'])
	})

	it('should collect multiple modifiers', () => {
		const result = collectPressedKeys(makeEvent({ ctrlKey: true, shiftKey: true, key: 'Control', code: 'ControlLeft' }))
		expect(result).toEqual(['Ctrl', 'Shift'])
	})

	it('should collect letter key', () => {
		const result = collectPressedKeys(makeEvent({ key: 'k', code: 'KeyK' }))
		expect(result).toEqual(['K'])
	})

	it('should collect digit key', () => {
		const result = collectPressedKeys(makeEvent({ key: '1', code: 'Digit1' }))
		expect(result).toEqual(['1'])
	})

	it('should collect special keys like Enter', () => {
		const result = collectPressedKeys(makeEvent({ key: 'Enter', code: 'Enter' }))
		expect(result).toEqual(['↵'])
	})

	it('should collect Tab key', () => {
		const result = collectPressedKeys(makeEvent({ key: 'Tab', code: 'Tab' }))
		expect(result).toEqual(['⇥'])
	})

	it('should collect Escape key', () => {
		const result = collectPressedKeys(makeEvent({ key: 'Escape', code: 'Escape' }))
		expect(result).toEqual(['Esc'])
	})

	it('should collect arrow keys', () => {
		expect(collectPressedKeys(makeEvent({ key: 'ArrowUp', code: 'ArrowUp' }))).toEqual(['↑'])
		expect(collectPressedKeys(makeEvent({ key: 'ArrowDown', code: 'ArrowDown' }))).toEqual(['↓'])
	})

	it('should uppercase single char key when shift is pressed', () => {
		const result = collectPressedKeys(makeEvent({ shiftKey: true, key: 'K', code: 'KeyK' }))
		expect(result).toContain('Shift')
		expect(result).toContain('K')
	})

	it('should collect Cmd + K combination', () => {
		const result = collectPressedKeys(makeEvent({ metaKey: true, key: 'k', code: 'KeyK' }))
		expect(result).toEqual(['⌘', 'K'])
	})
})

describe('standardizeKeyOrder', () => {
	it('should order modifiers before other keys', () => {
		expect(standardizeKeyOrder(['K', 'Ctrl', 'Shift'])).toEqual(['Ctrl', 'Shift', 'K'])
	})

	it('should maintain Ctrl > ⌘ > Alt > Shift order', () => {
		expect(standardizeKeyOrder(['Shift', 'Alt', '⌘', 'Ctrl', 'K'])).toEqual(['Ctrl', '⌘', 'Alt', 'Shift', 'K'])
	})

	it('should keep non-modifier keys in original order', () => {
		expect(standardizeKeyOrder(['Ctrl', 'A'])).toEqual(['Ctrl', 'A'])
	})
})

describe('isValidShortcut', () => {
	it('should return false for empty array', () => {
		expect(isValidShortcut([])).toBe(false)
	})

	it('should return true for single allowed special key (Enter)', () => {
		expect(isValidShortcut(['↵'])).toBe(true)
	})

	it('should return true for single allowed special key (Tab)', () => {
		expect(isValidShortcut(['⇥'])).toBe(true)
	})

	it('should return true for single allowed special key (ArrowLeft)', () => {
		expect(isValidShortcut(['←'])).toBe(true)
	})

	it('should return false for single non-special key', () => {
		expect(isValidShortcut(['K'])).toBe(false)
	})

	it('should return true for modifier + key combination', () => {
		expect(isValidShortcut(['Ctrl', 'K'])).toBe(true)
		expect(isValidShortcut(['⌘', 'Shift', 'K'])).toBe(true)
	})

	it('should return false for multiple non-modifier keys', () => {
		expect(isValidShortcut(['A', 'B'])).toBe(false)
	})
})

describe('isModifierKey', () => {
	it('should return true for modifier keys', () => {
		expect(isModifierKey('Ctrl')).toBe(true)
		expect(isModifierKey('⌘')).toBe(true)
		expect(isModifierKey('Alt')).toBe(true)
		expect(isModifierKey('Shift')).toBe(true)
	})

	it('should return false for non-modifier keys', () => {
		expect(isModifierKey('K')).toBe(false)
		expect(isModifierKey('Enter')).toBe(false)
		expect(isModifierKey('1')).toBe(false)
	})
})
