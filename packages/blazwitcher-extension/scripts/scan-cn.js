const fs = require('node:fs')
const path = require('node:path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

// 要扫描的文件扩展名
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

// 要扫描的文件和文件夹
const SCAN_PATHS = ['plugins', 'shared', 'sidepanel', 'background.ts', 'popup.tsx']

// 中文字符的正则表达式
const CHINESE_REGEX = /[\u4e00-\u9fa5]/

// 存储找到的中文及其位置
const chineseFound = []

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..')

// 递归遍历目录
function traverseDirectory(dir) {
	const files = fs.readdirSync(dir)

	for (const file of files) {
		const fullPath = path.join(dir, file)
		const stat = fs.statSync(fullPath)

		if (stat.isDirectory() && SCAN_PATHS.includes(path.relative(ROOT_DIR, fullPath))) {
			traverseDirectory(fullPath)
		} else if (
			stat.isFile() &&
			(SCAN_PATHS.includes(path.relative(ROOT_DIR, fullPath)) ||
				(FILE_EXTENSIONS.includes(path.extname(fullPath)) &&
					SCAN_PATHS.some((scanPath) => fullPath.startsWith(path.join(ROOT_DIR, scanPath)))))
		) {
			scanFile(fullPath)
		}
	}
}

function checkAndAddChinese(value, filePath, line, column) {
	if (CHINESE_REGEX.test(value)) {
		const matches = value.match(new RegExp(CHINESE_REGEX.source, 'g'))
		chineseFound.push({
			file: filePath,
			line: line,
			column: column,
			content: value,
			chinese: matches.join(''),
		})
	}
}

// 扫描单个文件
function scanFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8')
	let ast

	try {
		ast = parser.parse(content, {
			sourceType: 'module',
			plugins: ['jsx', 'typescript'],
		})
	} catch (error) {
		console.error(`解析文件失败: ${filePath}`, error)
		return
	}

	traverse(ast, {
		enter(path) {
			// 跳过注释节点
			if (path.node.type === 'CommentBlock' || path.node.type === 'CommentLine') {
				return
			}

			// 处理字符串字面量和模板字面量
			if (path.node.type === 'StringLiteral' || path.node.type === 'TemplateLiteral') {
				const value =
					path.node.type === 'StringLiteral' ? path.node.value : path.node.quasis.map((q) => q.value.cooked).join('')
				checkAndAddChinese(value, filePath, path.node.loc.start.line, path.node.loc.start.column)
			}

			// JSX 和 TSX
			if (path.node.type === 'JSXText') {
				checkAndAddChinese(path.node.value, filePath, path.node.loc.start.line, path.node.loc.start.column)
			}

			// JSX 和 TSX 属性
			if (path.node.type === 'JSXAttribute' && path.node.value && path.node.value.type === 'StringLiteral') {
				checkAndAddChinese(path.node.value.value, filePath, path.node.loc.start.line, path.node.loc.start.column)
			}
		},
	})
}

function main() {
	SCAN_PATHS.forEach((scanPath) => {
		const fullPath = path.join(ROOT_DIR, scanPath)
		if (fs.existsSync(fullPath)) {
			if (fs.statSync(fullPath).isDirectory()) {
				traverseDirectory(fullPath)
			} else {
				scanFile(fullPath)
			}
		} else {
			console.warn(`路径不存在: ${fullPath}`)
		}
	})

	console.log('扫描结果：')
	chineseFound.forEach(({ file, line, column, content, chinese }) => {
		console.log(`位置: ${file}:${line}:${column}`)
		console.log(`内容: ${content}`)
		console.log(`中文: ${chinese}`)
		console.log('---')
	})

	console.log(`共找到 ${chineseFound.length} 个中文`)
}

main()
