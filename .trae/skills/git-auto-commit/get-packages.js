const fs = require('node:fs')
const path = require('node:path')
const fg = require('fast-glob')

const ROOT_DIR = path.resolve(__dirname, '../../..')

function parseYamlPackages(yamlContent) {
	const lines = yamlContent.split('\n')
	const packages = []
	let inPackagesSection = false

	for (const line of lines) {
		const trimmed = line.trim()
		if (trimmed === 'packages:') {
			inPackagesSection = true
			continue
		}
		if (inPackagesSection) {
			if (trimmed.startsWith('-')) {
				const pattern = trimmed
					.slice(1)
					.trim()
					.replace(/^['"]|['"]$/g, '')
				packages.push(pattern)
			} else if (trimmed && !trimmed.startsWith('#')) {
				break
			}
		}
	}
	return packages
}

function getWorkspacePatterns() {
	const pnpmWorkspacePath = path.join(ROOT_DIR, 'pnpm-workspace.yaml')
	if (fs.existsSync(pnpmWorkspacePath)) {
		const content = fs.readFileSync(pnpmWorkspacePath, 'utf-8')
		const packages = parseYamlPackages(content)
		if (packages.length > 0) {
			return packages
		}
	}

	const packageJsonPath = path.join(ROOT_DIR, 'package.json')
	if (fs.existsSync(packageJsonPath)) {
		const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
		if (content.workspaces) {
			if (Array.isArray(content.workspaces)) {
				return content.workspaces
			}
			if (content.workspaces.packages) {
				return content.workspaces.packages
			}
		}
	}

	return []
}

function getPackageInfo(packageDir) {
	const packageJsonPath = path.join(packageDir, 'package.json')
	if (!fs.existsSync(packageJsonPath)) {
		return null
	}

	try {
		const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
		return {
			name: content.name,
			private: content.private === true,
			path: path.relative(ROOT_DIR, packageDir),
		}
	} catch {
		return null
	}
}

function getPackages(options = {}) {
	const { includePrivate = false } = options

	const patterns = getWorkspacePatterns()
	if (patterns.length === 0) {
		return []
	}

	const globPatterns = patterns.flatMap((p) => {
		if (p.endsWith('/**')) {
			const base = p.slice(0, -3)
			return [`${base}/*/package.json`, `${base}/**/*/package.json`]
		}
		if (p.endsWith('/*')) {
			return `${p.slice(0, -2)}/*/package.json`
		}
		return `${p}/package.json`
	})

	const packageDirs = fg.sync(globPatterns, {
		cwd: ROOT_DIR,
		absolute: true,
		onlyFiles: true,
		ignore: ['**/node_modules/**'],
	})

	const packages = []
	for (const pkgJsonPath of packageDirs) {
		const packageDir = path.dirname(pkgJsonPath)
		const info = getPackageInfo(packageDir)
		if (info?.name) {
			if (includePrivate || !info.private) {
				packages.push(info)
			}
		}
	}

	return packages
}

function getPackageNames(options = {}) {
	return getPackages(options).map((p) => p.name)
}

if (require.main === module) {
	const args = process.argv.slice(2)
	const includePrivate = args.includes('--include-private') || args.includes('-p')

	const names = getPackageNames({ includePrivate })
	console.log(JSON.stringify(names))
}

module.exports = {
	getPackages,
	getPackageNames,
	getWorkspacePatterns,
	ROOT_DIR,
}
