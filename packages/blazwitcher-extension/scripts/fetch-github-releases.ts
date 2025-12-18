import { GITHUB_CONFIG, type GitHubRelease, getGitHubHeaders, PATHS, writeJsonFile } from './common'

export async function fetchGitHubReleases(): Promise<void> {
	try {
		console.log('🚀 Fetching GitHub releases...')

		// 发起请求到 GitHub API
		const response = await fetch(GITHUB_CONFIG.RELEASES_URL, {
			headers: getGitHubHeaders(),
		})

		if (!response.ok) {
			throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
		}

		const releases: GitHubRelease[] = await response.json()

		console.log(`✅ Successfully fetched ${releases.length} releases`)

		// 保存到文件
		const success = writeJsonFile(PATHS.RELEASES_JSON, releases)

		if (success) {
			console.log(`📝 Releases data saved to: ${PATHS.RELEASES_JSON}`)
			console.log(`📊 Latest release: ${releases[0]?.tag_name || 'N/A'}`)
		} else {
			throw new Error('Failed to save releases data')
		}
	} catch (error) {
		console.error('❌ Error fetching GitHub releases:', error)
		process.exit(1)
	}
}

// 执行脚本
if (require.main === module) {
	fetchGitHubReleases()
}
