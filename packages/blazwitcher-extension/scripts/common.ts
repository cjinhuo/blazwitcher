import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// 获取项目根目录路径
export function getProjectRootDir(): string {
	const currentFilePath = fileURLToPath(import.meta.url)
	return path.resolve(currentFilePath, '../../../../')
}

// 获取扩展根目录路径
export function getExtensionRootDir(): string {
	return path.resolve(__dirname, '../')
}

/**
 * 加载环境变量文件
 */
export function loadEnvFile(): void {
	const envPath = path.resolve(getProjectRootDir(), '.env')

	if (!fs.existsSync(envPath)) {
		console.warn('⚠️  .env file not found at:', envPath)
		return
	}

	try {
		config({ path: envPath })
		console.log('✅ Environment variables loaded from .env')
	} catch (error) {
		console.error('❌ Error loading .env file:', error)
	}
}

/**
 * 比较版本号
 * @param version1 版本1
 * @param version2 版本2
 * @returns 1: version1 > version2, 0: 相等, -1: version1 < version2
 */
export function compareVersions(version1: string, version2: string): number {
	const v1Parts = version1.split('.').map(Number)
	const v2Parts = version2.split('.').map(Number)

	const maxLength = Math.max(v1Parts.length, v2Parts.length)

	for (let i = 0; i < maxLength; i++) {
		const v1Part = v1Parts[i] || 0
		const v2Part = v2Parts[i] || 0

		if (v1Part > v2Part) return 1
		if (v1Part < v2Part) return -1
	}

	return 0
}

/**
 * 获取 GitHub API Token
 */
export function getGitHubToken(): string {
	loadEnvFile()

	const token = process.env.CHANGESET_READ_REPO_TOKEN
	if (!token) {
		console.error('❌ CHANGESET_READ_REPO_TOKEN environment variable is not set')
		process.exit(1)
	}

	return token
}

/**
 * 获取 GitHub API 请求头
 */
export function getGitHubHeaders(): Record<string, string> {
	const authToken = getGitHubToken()
	if (!authToken) {
		console.error('❌ GitHub API Token is not set')
		process.exit(1)
	}

	return {
		Authorization: `token ${authToken}`,
		'Content-Type': 'application/json',
	}
}

/**
 * 确保目录存在
 */
export function ensureDirectoryExists(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true })
	}
}

/**
 * 读取 JSON 文件
 */
export function readJsonFile<T = any>(filePath: string): T | null {
	try {
		if (!fs.existsSync(filePath)) {
			return null
		}

		const content = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(content)
	} catch (error) {
		console.error(`❌ 读取 JSON 文件失败: ${filePath}`, error)
		return null
	}
}

/**
 * 写入 JSON 文件
 */
export function writeJsonFile(filePath: string, data: any): boolean {
	try {
		const dirPath = path.dirname(filePath)
		ensureDirectoryExists(dirPath)

		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
		return true
	} catch (error) {
		console.error(`❌ 写入 JSON 文件失败: ${filePath}`, error)
		return false
	}
}

// GitHub API 相关类型定义
export interface GitHubUser {
	login: string
	id: number
	node_id: string
	avatar_url: string
	gravatar_id: string
	url: string
	html_url: string
	followers_url: string
	following_url: string
	gists_url: string
	starred_url: string
	subscriptions_url: string
	organizations_url: string
	repos_url: string
	events_url: string
	received_events_url: string
	type: string
	user_view_type: string
	site_admin: boolean
}

export interface GitHubRelease {
	url: string
	assets_url: string
	upload_url: string
	html_url: string
	id: number
	author: GitHubUser
	node_id: string
	tag_name: string
	target_commitish: string
	name: string
	draft: boolean
	immutable: boolean
	prerelease: boolean
	created_at: string
	published_at: string
	assets: any[]
	tarball_url: string
	zipball_url: string
	body: string
}

export interface ChangelogEntry {
	version: string
	content: string
	changes: string[]
}

// 常用路径
export const PATHS = {
	get ROOT_DIR() {
		return getProjectRootDir()
	},
	get EXTENSION_DIR() {
		return getExtensionRootDir()
	},
	get CHANGELOG() {
		return path.resolve(getExtensionRootDir(), 'CHANGELOG.md')
	},
	get RELEASES_JSON() {
		return path.resolve(getExtensionRootDir(), 'shared/releases.json')
	},
	get ENV_FILE() {
		return path.resolve(getProjectRootDir(), '.env')
	},
} as const

// GitHub API 配置
export const GITHUB_CONFIG = {
	REPO_OWNER: 'cjinhuo',
	REPO_NAME: 'blazwitcher',
	API_BASE_URL: 'https://api.github.com',
	get RELEASES_URL() {
		return `${this.API_BASE_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/releases`
	},
} as const
