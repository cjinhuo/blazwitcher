import fs from 'node:fs'
import path from 'node:path'

const promptFolderPath = path.join(process.cwd(), 'src/prompts')

/**
 * 将 prompts 文件夹下的所有 .txt 文件转换为 .ts 文件
 * 使用 export default 导出纯字符串
 */
function convertTxtToTs() {
	try {
		// 检查 prompts 文件夹是否存在
		if (!fs.existsSync(promptFolderPath)) {
			console.log('Prompts 文件夹不存在:', promptFolderPath)
			return
		}

		// 读取文件夹中的所有文件
		const files = fs.readdirSync(promptFolderPath)
		const txtFiles = files.filter((file) => file.endsWith('.txt'))

		if (txtFiles.length === 0) {
			console.log('没有找到 .txt 文件')
			return
		}

		console.log(`找到 ${txtFiles.length} 个 .txt 文件:`)
		txtFiles.forEach((file) => {
			console.log(`  - ${file}`)
		})

		// 转换每个 .txt 文件
		for (const txtFile of txtFiles) {
			const txtFilePath = path.join(promptFolderPath, txtFile)
			const tsFileName = txtFile.replace('.txt', '.ts')
			const tsFilePath = path.join(promptFolderPath, tsFileName)

			console.log(`\n转换文件: ${txtFile} -> ${tsFileName}`)

			// 读取 .txt 文件内容
			const content = fs.readFileSync(txtFilePath, 'utf-8')

			// 转义字符串中的反引号和反斜杠
			const escapedContent = content
				.replace(/\\/g, '\\\\') // 转义反斜杠
				.replace(/`/g, '\\`') // 转义反引号
				.replace(/\$/g, '\\$') // 转义美元符号（防止模板字符串插值）

			// 生成 .ts 文件内容
			const tsContent = `export default \`${escapedContent}\`\n`

			// 写入 .ts 文件
			fs.writeFileSync(tsFilePath, tsContent, 'utf-8')
			console.log(`✅ 已创建: ${tsFileName}`)
		}

		console.log('\n🎉 所有文件转换完成!')
	} catch (error) {
		console.error('转换过程中出现错误:', error)
	}
}

// 如果直接运行此脚本，则执行转换
if (require.main === module) {
	convertTxtToTs()
}
