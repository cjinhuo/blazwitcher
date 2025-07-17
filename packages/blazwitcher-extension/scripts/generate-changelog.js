import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 获取当前文件的目录路径（ESM 模块中需要手动计算 __dirname）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 解析 CHANGELOG.md，生成结构化的 JSON 数据
 *
 * 格式：
 * # blazwitcher
 * ## 0.5.4
 * ### Minor Changes 或 ### Patch Changes
 * - feat: description @author · date · commit_url
 * - feat: 中文描述 @author · date · commit_url
 *
 * @param {string} content - CHANGELOG.md 文件的原始内容
 * @returns {Array} 解析后的版本变更数组
 */
function parseChangelog(content) {
	const lines = content.split('\n')
	const changelog = [] // 存储所有版本的变更记录
	let currentEntry = null // 当前正在处理的版本条目

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()
		console.log('Processing line:', line)

		// 匹配版本号（格式：## x.y.z）
		const versionMatch = line.match(/^## (\d+\.\d+\.\d+)/)
		if (versionMatch) {
			console.log('Found version:', versionMatch[1])

			// 保存上一个版本的数据
			if (currentEntry) {
				// 处理当前版本的变更项，按 commit URL 匹配中英文
				const { rawChanges, ...entryWithoutRaw } = currentEntry
				const processedEntry = {
					...entryWithoutRaw,
					changes: processChanges(rawChanges),
				}
				console.log('Adding entry to changelog:', processedEntry)
				changelog.push(processedEntry)
			}

			// 初始化新版本条目
			currentEntry = {
				version: versionMatch[1],
				type: 'patch', // 默认为patch，后续根据实际内容更新
				changes: [],
				rawChanges: [], // 临时存储原始变更数据
			}
			continue
		}

		// 检查变更类型（Minor Changes 表示小版本更新）
		if (line === '### Minor Changes' && currentEntry) {
			console.log('Setting type to minor for version:', currentEntry.version)
			currentEntry.type = 'minor'
			continue
		}

		// 跳过空行和其他标题行
		if (!line || line.startsWith('#')) {
			continue
		}

		// 匹配变更内容行（格式：- [commit_id: ]description @author · date · commit_url）
		const changeMatch = line.match(/^- (?:[a-f0-9]+: )?(.+)/)
		if (changeMatch && currentEntry) {
			console.log('Found change:', changeMatch[1])

			// 解析变更内容
			const changeData = parseChangeText(changeMatch[1])
			if (changeData.commitUrl) {
				currentEntry.rawChanges.push(changeData)
			}
		}
	}

	// 处理最后一个版本
	if (currentEntry) {
		const { rawChanges, ...entryWithoutRaw } = currentEntry
		const processedEntry = {
			...entryWithoutRaw,
			changes: processChanges(rawChanges),
		}
		console.log('Adding final entry to changelog:', processedEntry)
		changelog.push(processedEntry)
	}

	return changelog
}

function isEnglishText(text) {
	// 移除 "feat:", "fix:" 等前缀来判断主要内容
	const mainContent = text.replace(/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert):\s*/, '')

	// 检查是否包含中文字符
	const hasChinese = /[\u4e00-\u9fff]/.test(mainContent)

	// 如果包含中文，则认为是中文；否则认为是英文
	return !hasChinese
}

/**
 * 解析单个变更文本，提取描述、作者、日期和提交链接
 * @param {string} text - 变更文本
 * @returns {Object} 解析后的数据
 */
function parseChangeText(text) {
	// 匹配格式：description @author · date · commit_url
	const match = text.match(/^(.+?)\s*@([^·]+)·([^·]+)·(.+)$/)

	if (match) {
		const [, description, author, date, commitUrl] = match

		return {
			description: description.trim(),
			author: author.trim(),
			date: date.trim(),
			commitUrl: commitUrl.trim().replace(/`/g, ''), // 移除反引号
			isEnglish: isEnglishText(description.trim()), // 判断是否为英文
		}
	}

	return {
		description: text,
		author: '',
		date: '',
		commitUrl: '',
		isEnglish: isEnglishText(text),
	}
}

/**
 * 处理原始变更数据，按 commit URL 匹配中英文
 * @param {Array} rawChanges - 原始变更数据数组
 * @returns {Array} 处理后的变更数组
 */
function processChanges(rawChanges) {
	const changeMap = new Map() // 用于按 commit URL 分组
	const processedChanges = []

	// 按 commit URL 分组
	for (const change of rawChanges) {
		if (!change.commitUrl) continue

		if (!changeMap.has(change.commitUrl)) {
			changeMap.set(change.commitUrl, { en: null, zh: null })
		}

		const group = changeMap.get(change.commitUrl)
		if (change.isEnglish) {
			group.en = change
		} else {
			group.zh = change
		}
	}

	// 生成最终的变更数组
	for (const [commitUrl, group] of changeMap) {
		const enChange = group.en
		const zhChange = group.zh

		// 如果有中英文对，使用配对的数据
		if (enChange && zhChange) {
			processedChanges.push({
				en: `${enChange.description} @${enChange.author} · ${enChange.date} · \`${commitUrl}\``,
				zh: `${zhChange.description} @${zhChange.author} · ${zhChange.date} · \`${commitUrl}\``,
			})
		}
		// 如果只有英文，复制到中文
		else if (enChange) {
			const fullText = `${enChange.description} @${enChange.author} · ${enChange.date} · \`${commitUrl}\``
			processedChanges.push({
				en: fullText,
				zh: fullText, // 临时使用英文，后续需要翻译
			})
		}
		// 如果只有中文，复制到英文
		else if (zhChange) {
			const fullText = `${zhChange.description} @${zhChange.author} · ${zhChange.date} · \`${commitUrl}\``
			processedChanges.push({
				en: fullText, // 临时使用中文，后续需要翻译
				zh: fullText,
			})
		}
	}

	console.log(`Processed ${processedChanges.length} changes from ${rawChanges.length} raw entries`)
	return processedChanges
}

// 主执行流程
// 1. 读取 CHANGELOG.md 文件
const changelogPath = join(__dirname, '../CHANGELOG.md')
const content = readFileSync(changelogPath, 'utf-8')

// 2. 解析内容为结构化数据
const changelog = parseChangelog(content)

// 3. 将解析结果写入 JSON 文件
const outputPath = join(__dirname, '../shared/changelog.json')
writeFileSync(outputPath, JSON.stringify(changelog, null, 2))

console.log(`Generated changelog.json with ${changelog.length} versions`)
