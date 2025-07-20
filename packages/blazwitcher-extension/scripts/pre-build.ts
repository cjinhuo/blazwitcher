import * as fs from 'node:fs'
import * as path from 'node:path'
import { getExtensionRootDir, readJsonFile } from './common'

// 主函数
async function main() {
	try {
		const extensionDir = getExtensionRootDir()

		// 读取 package.json 获取版本号
		const packageJsonPath = path.resolve(extensionDir, 'package.json')
		const packageJson = readJsonFile(packageJsonPath)

		if (!packageJson) {
			throw new Error('无法读取 package.json 文件')
		}

		const version = packageJson.version
		const name = 'Blazwitcher'

		console.log(`Injecting version ${version} into sidepanel/index.html...`)

		// 读取 index.html 文件
		const indexHtmlPath = path.resolve(extensionDir, 'sidepanel/index.html')

		if (!fs.existsSync(indexHtmlPath)) {
			throw new Error(`index.html 文件不存在: ${indexHtmlPath}`)
		}

		let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8')

		// 直接替换 title 标签内容
		indexHtmlContent = indexHtmlContent.replace(/<title>.*?<\/title>/, `<title>${name} v${version}</title>`)

		// 写回文件
		fs.writeFileSync(indexHtmlPath, indexHtmlContent)

		console.log('Version injection complete!')
	} catch (error) {
		console.error('Error during pre-build:', error)
		process.exit(1)
	}
}

main().catch(console.error)
