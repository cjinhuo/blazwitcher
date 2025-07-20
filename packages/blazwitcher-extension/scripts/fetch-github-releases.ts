import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url)
const rootDir = path.resolve(currentFilePath, '../../../../')
// 加载环境变量
function loadEnvFile() {
	const envPath = path.resolve(rootDir, '.env')
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf8')
		const lines = envContent.split('\n')

		for (const line of lines) {
			const trimmedLine = line.trim()
			if (trimmedLine && !trimmedLine.startsWith('#')) {
				const [key, ...valueParts] = trimmedLine.split('=')
				if (key && valueParts.length > 0) {
					const value = valueParts.join('=').trim()
					process.env[key.trim()] = value
				}
			}
		}
	}
}

interface GitHubRelease {
	url: string
	assets_url: string
	upload_url: string
	html_url: string
	id: number
	author: {
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

async function fetchGitHubReleases(): Promise<void> {
	try {
		// 加载环境变量
		loadEnvFile()

		// 从环境变量获取 GitHub token
		const token = process.env.CHANGESET_READ_REPO_TOKEN

		if (!token) {
			console.error('❌ CHANGESET_READ_REPO_TOKEN environment variable is not set')
			process.exit(1)
		}

		console.log('🚀 Fetching GitHub releases...')

		// 发起请求到 GitHub API
		const response = await fetch('https://api.github.com/repos/cjinhuo/blazwitcher/releases', {
			headers: {
				Authorization: `token ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'blazwitcher-extension',
			},
		})

		if (!response.ok) {
			throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
		}

		const releases: GitHubRelease[] = await response.json()

		console.log(`✅ Successfully fetched ${releases.length} releases`)

		// 确定输出文件路径
		const outputPath = path.resolve(rootDir, './packages/blazwitcher-extension/shared/releases.json')

		// 确保目录存在
		const outputDir = path.dirname(outputPath)
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		// 写入文件
		fs.writeFileSync(outputPath, JSON.stringify(releases, null, 2), 'utf8')

		console.log(`📝 Releases data saved to: ${outputPath}`)
		console.log(`📊 Latest release: ${releases[0]?.tag_name || 'N/A'}`)
	} catch (error) {
		console.error('❌ Error fetching GitHub releases:', error)
		process.exit(1)
	}
}

// 执行脚本
if (require.main === module) {
	fetchGitHubReleases()
}
