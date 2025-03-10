// 收集按下的按键
export const collectPressedKeys = (e: React.KeyboardEvent | KeyboardEvent): string[] => {
	const keys: string[] = []
	if (e.ctrlKey) keys.push('Ctrl')
	if (e.metaKey) keys.push('⌘')
	if (e.altKey) keys.push('Alt')
	if (e.shiftKey) keys.push('Shift')

	if (!['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
		keys.push(e.key.toUpperCase())
	}

	return keys
}

// 按顺序组合快捷键
export const standardizeKeyOrder = (keys: string[]): string[] => {
	const result: string[] = []

	if (keys.includes('Ctrl')) result.push('Ctrl')
	if (keys.includes('⌘')) result.push('⌘')
	if (keys.includes('Alt')) result.push('Alt')
	if (keys.includes('Shift')) result.push('Shift')

	// 添加其他非修饰键
	keys.forEach((key) => {
		if (!['Ctrl', '⌘', 'Alt', 'Shift'].includes(key)) {
			result.push(key)
		}
	})

	return result
}

// 检查快捷键是否有效（至少包含两个键，且至少一个是修饰键）
export const isValidShortcut = (keys: string[]): boolean => {
	if (keys.length < 2) return false

	// 检查是否至少包含一个修饰键
	const hasModifier = keys.some((key) => ['Ctrl', '⌘', 'Alt', 'Shift'].includes(key))
	return hasModifier
}

// 判断是否为修饰键
export const isModifierKey = (key: string): boolean => {
	return ['Ctrl', '⌘', 'Alt', 'Shift'].includes(key)
}
