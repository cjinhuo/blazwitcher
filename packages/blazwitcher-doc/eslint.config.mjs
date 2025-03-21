import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import jsonc from 'eslint-plugin-jsonc' // 新增 jsonc 插件

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),

	// 新增 JSON 文件处理规则
	{
		files: ['**/*.json'],
		plugins: {
			jsonc,
		},
		rules: {
			'jsonc/no-comments': 'off', // 允许 JSON 文件包含注释
		},
	},
]

export default eslintConfig
