/**
 * 标准化搜索输入值：
 * - 去首尾空格
 * - 将中文顿号 "、" 开头转为 "/" （兼容中文输入法误触）
 */
export const normalizeSearchValue = (value: string) => {
	const trimmedValue = value.trim()
	if (trimmedValue.startsWith('、')) {
		return `/${trimmedValue.slice(1)}`
	}
	return trimmedValue
}
