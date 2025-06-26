import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function parseChangelog(content) {
	const lines = content.split('\n')
	const changelog = []
	let currentEntry = null
	let currentChange = null

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()
		console.log('Processing line:', line)

		// 匹配版本号
		const versionMatch = line.match(/^## (\d+\.\d+\.\d+)/)
		if (versionMatch) {
			console.log('Found version:', versionMatch[1])
			if (currentEntry) {
				if (currentChange) {
					console.log('Adding last change to current entry:', currentChange)
					currentEntry.changes.push(currentChange)
					currentChange = null
				}
				console.log('Adding entry to changelog:', currentEntry)
				changelog.push(currentEntry)
			}
			currentEntry = {
				version: versionMatch[1],
				type: 'patch', // 默认为patch，后续根据实际内容更新
				changes: [],
			}
			continue
		}

		// 检查变更类型
		if (line === '### Minor Changes' && currentEntry) {
			console.log('Setting type to minor for version:', currentEntry.version)
			currentEntry.type = 'minor'
			continue
		}

		// 跳过非内容行
		if (!line || line.startsWith('#')) {
			continue
		}

		// 匹配变更内容（包括可能的提交ID）
		const changeMatch = line.match(/^- (?:[a-f0-9]+: )?(.+)/)
		if (changeMatch && currentEntry) {
			console.log('Found change:', changeMatch[1])

			if (currentChange) {
				console.log('Adding previous change to changes array:', currentChange)
				currentEntry.changes.push(currentChange)
			}
			currentChange = { en: '', zh: '' }

			// 检查下一行是否为对应的翻译
			const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
			console.log('Next line:', nextLine)
			const translationMatch = nextLine.match(/^- (?:[a-f0-9]+: )?(.+)/)

			if (translationMatch) {
				console.log('Found translation:', translationMatch[1])
				// 根据内容判断语言
				const isEnglishFirst = /^[a-zA-Z]/.test(changeMatch[1])
				if (isEnglishFirst) {
					currentChange.en = changeMatch[1]
					currentChange.zh = translationMatch[1]
				} else {
					currentChange.zh = changeMatch[1]
					currentChange.en = translationMatch[1]
				}
				i++ // 跳过下一行
			} else {
				console.log('No translation found, using same content for both languages')
				// 如果没有翻译，默认为英文
				currentChange.en = changeMatch[1]
				currentChange.zh = changeMatch[1] // 临时使用英文，后续需要翻译
			}
		}
	}

	// 添加最后一个版本
	if (currentEntry) {
		if (currentChange) {
			console.log('Adding final change to last entry:', currentChange)
			currentEntry.changes.push(currentChange)
		}
		console.log('Adding final entry to changelog:', currentEntry)
		changelog.push(currentEntry)
	}

	return changelog
}

// 读取 CHANGELOG.md
const changelogPath = join(__dirname, '../CHANGELOG.md')
const content = readFileSync(changelogPath, 'utf-8')
const changelog = parseChangelog(content)

// 写入 changelog.json
const outputPath = join(__dirname, '../shared/changelog.json')
writeFileSync(outputPath, JSON.stringify(changelog, null, 2))
