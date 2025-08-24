import * as path from 'node:path'

// 项目根目录路径
export const PROJECT_ROOT = path.resolve(__dirname, '../../../')

// 扩展包路径
export const EXTENSION_ROOT = path.join(PROJECT_ROOT, 'packages/blazwitcher-extension')

// 常用路径映射
export const PATHS = {
	// Prompt
	AI_GROUPING_PROMPT: path.join(EXTENSION_ROOT, 'ai-grouping-prompt.txt'),
	
	// 其他常用路径可以在这里添加
	ASSETS: path.join(EXTENSION_ROOT, 'assets'),
	COMPONENTS: path.join(EXTENSION_ROOT, 'components'),
} as const

// 获取路径的辅助函数
export function getPromptPath(filename: string): string {
	return path.join(EXTENSION_ROOT, filename)
}

export function getAssetPath(filename: string): string {
	return path.join(PATHS.ASSETS, filename)
}
