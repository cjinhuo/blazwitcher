export const collectPressedKeys = (e: React.KeyboardEvent | KeyboardEvent): string[] => {
	const keys: string[] = []

	// 修饰键
	if (e.ctrlKey) keys.push('Ctrl')
	if (e.metaKey) keys.push('⌘')
	if (e.altKey) keys.push('Alt')
	if (e.shiftKey) keys.push('Shift')

	// 主键
	if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
		let keyDisplay: string

		// 创建一个映射对象，用于特殊键的显示
		const specialKeyMap: Record<string, string> = {
			Backspace: '⌫',
			Enter: '↵',
			Tab: '⇥',
			Escape: 'Esc',
			ArrowUp: '↑',
			ArrowDown: '↓',
			ArrowLeft: '←',
			ArrowRight: '→',
			Space: 'Space',
			Semicolon: ';',
			Quote: "'",
			Backquote: '`',
			Minus: '-',
			Equal: '=',
			BracketLeft: '[',
			BracketRight: ']',
			Backslash: '\\',
			Comma: ',',
			Period: '.',
			Slash: '/',
		}

		// 处理字母键
		const keyMatch = e.code.match(/^Key([A-Z])$/)
		if (keyMatch) {
			keyDisplay = keyMatch[1]
		}
		// 处理数字键
		else if (e.code.startsWith('Digit')) {
			keyDisplay = e.code.slice(5)
		}
		// 处理特殊键和标点符号
		else if (e.code in specialKeyMap) {
			keyDisplay = specialKeyMap[e.code]
		}
		// 处理其他所有键，包括标点符号和特殊字符
		else {
			keyDisplay = e.key.length === 1 ? e.key : e.code
		}

		// 如果是 Shift 组合键，可能需要特殊处理
		if (e.shiftKey && keyDisplay.length === 1) {
			keyDisplay = keyDisplay.toUpperCase()
		}

		keys.push(keyDisplay)
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
