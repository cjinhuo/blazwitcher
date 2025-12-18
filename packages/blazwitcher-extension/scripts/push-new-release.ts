import * as fs from 'node:fs'
import {
	type ChangelogEntry,
	compareVersions,
	GITHUB_CONFIG,
	type GitHubRelease,
	getGitHubHeaders,
	PATHS,
	readJsonFile,
} from './common'
import { fetchGitHubReleases } from './fetch-github-releases'

/**
 * 获取本地 changelog 最新的版本
 */
function getLatestChangelog(): ChangelogEntry | null {
	try {
		if (!fs.existsSync(PATHS.CHANGELOG)) {
			console.error('❌ CHANGELOG.md 文件不存在')
			return null
		}

		const content = fs.readFileSync(PATHS.CHANGELOG, 'utf8')
		const lines = content.split('\n')

		// 查找第一个版本号
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// 匹配版本号格式 ## x.x.x
			const versionMatch = line.match(/^##\s+(\d+\.\d+\.\d+)$/)
			if (versionMatch) {
				const version = versionMatch[1]

				// 提取该版本的内容
				const versionContent: string[] = []
				let j = i + 1

				// 读取到下一个版本或文件结束
				while (j < lines.length && !lines[j].match(/^##\s+\d+\.\d+\.\d+$/)) {
					versionContent.push(lines[j])
					j++
				}

				// 提取变更内容
				const changes: string[] = []
				for (const contentLine of versionContent) {
					const trimmed = contentLine.trim()
					if (trimmed.startsWith('- feat:') || trimmed.startsWith('- fix:') || trimmed.startsWith('- chore:')) {
						changes.push(trimmed)
					}
				}

				return {
					version,
					content: versionContent.join('\n').trim(),
					changes,
				}
			}
		}

		console.error('❌ 未找到有效的版本号')
		return null
	} catch (error) {
		console.error('❌ 读取 CHANGELOG.md 失败:', error)
		return null
	}
}

/**
 * 获取线上最新的 release 版本
 */
async function getLatestOnlineRelease(): Promise<string | null> {
	try {
		// 先拉取最新的 releases 数据
		await fetchGitHubReleases()

		// 读取本地的 releases.json
		const releases: GitHubRelease[] | null = readJsonFile(PATHS.RELEASES_JSON)

		if (!releases || releases.length === 0) {
			console.log('📝 暂无线上 release')
			return null
		}

		// 获取最新的 release 版本
		const latestRelease = releases[0]
		return latestRelease.tag_name
	} catch (error) {
		console.error('❌ 获取线上 release 版本失败:', error)
		return null
	}
}

/**
 * 创建新的 GitHub Release
 */
async function createGitHubRelease(version: string, changelog: ChangelogEntry): Promise<boolean> {
	try {
		console.log(`🚀 正在创建 GitHub Release: ${version}`)

		// 构建 release body
		const releaseBody = `${changelog.content}`

		const response = await fetch(GITHUB_CONFIG.RELEASES_URL, {
			method: 'POST',
			headers: getGitHubHeaders(),
			body: JSON.stringify({
				tag_name: version,
				target_commitish: 'master',
				name: `@${version}`,
				body: releaseBody,
				draft: false,
				prerelease: false,
			}),
		})

		if (!response.ok) {
			const errorData = await response.text()
			throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}\n${errorData}`)
		}

		const releaseData = await response.json()

		console.log(`✅ 成功创建 GitHub Release: ${version}`)
		console.log(`🔗 Release 链接: ${releaseData.html_url}`)

		return true
	} catch (error) {
		console.error('❌ 创建 GitHub Release 失败:', error)
		return false
	}
}

/**
 * 主函数：检查版本并创建 release
 */
async function pushNewRelease(): Promise<void> {
	try {
		console.log('🔍 开始检查版本...')

		// 获取本地最新版本
		const localChangelog = getLatestChangelog()
		if (!localChangelog) {
			console.error('❌ 无法获取本地版本信息')
			return
		}

		console.log(`📋 本地最新版本: ${localChangelog.version}`)

		// 获取线上最新版本
		const onlineVersion = await getLatestOnlineRelease()
		console.log(`🌐 线上最新版本: ${onlineVersion || '无'}`)

		// 比较版本
		if (!onlineVersion) {
			console.log('🎉 线上暂无 release，将创建第一个 release')
			await createGitHubRelease(localChangelog.version, localChangelog)
			return
		}

		const comparison = compareVersions(localChangelog.version, onlineVersion)

		if (comparison > 0) {
			console.log(`🆙 本地版本 ${localChangelog.version} 大于线上版本 ${onlineVersion}，将创建新的 release`)
			await createGitHubRelease(localChangelog.version, localChangelog)
		} else if (comparison === 0) {
			console.log(`✅ 本地版本 ${localChangelog.version} 与线上版本相同，无需创建 release`)
		} else {
			console.log(`⚠️  本地版本 ${localChangelog.version} 小于线上版本 ${onlineVersion}，请检查版本号`)
		}
	} catch (error) {
		console.error('❌ 执行失败:', error)
		process.exit(1)
	}
}

// 执行脚本
if (require.main === module) {
	pushNewRelease()
}

export { pushNewRelease, getLatestChangelog, compareVersions }
