import { useAtomValue } from 'jotai'
import { marked } from 'marked'
import releases from '~shared/releases.json'
import { isDarkMode } from '~shared/utils'
import { languageAtom, themeAtom } from '~sidepanel/atom'

marked.setOptions({
	breaks: true,
	gfm: true, // 启用 GitHub 风格的 Markdown
})

type Release = {
	url: string
	html_url: string
	id: number
	author: {
		login: string
		avatar_url: string
		html_url: string
	}
	tag_name: string
	name: string
	created_at: string
	published_at: string
	body: string
}

/**
 * 格式化日期
 * @param dateString ISO 日期字符串
 * @returns 格式化后的日期字符串
 */
function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

export function ChangelogPanel() {
	const themeColor = useAtomValue(themeAtom)
	const language = useAtomValue(languageAtom)
	const isDark = isDarkMode(themeColor)

	// Helper to generate HTML for iframe
	const getIframeHtml = () => {
		const html = (releases as Release[])
			.map((release, index) => {
				const mdHtml = marked.parse(release.body) as string
				// 处理所有链接，让它们在新窗口打开
				const processedMdHtml = mdHtml.replace(/<a\s+href=/gi, '<a target="_blank" rel="noopener noreferrer" href=')

				const cardBgColor = isDark ? '#2a2a2a' : '#fff'
				const borderColor = isDark ? '#4a9eff' : '#e0eaff'
				const primaryColor = isDark ? '#4a9eff' : '#0052cc'
				const textColor = isDark ? '#b0b0b0' : '#888'
				const dividerColor = isDark ? '#4a4a4a' : '#e0e0e0'

				return `
				<div style="margin-bottom:32px;padding:20px;background-color:${cardBgColor};border-radius:8px;border-left:3px solid ${borderColor};transition:all 0.2s ease;">
					<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
						<div style="display:flex;align-items:center;margin-bottom:16px;gap:12px;">
							<span style="font-size:20px;font-weight:700;color:${primaryColor};margin-right:10px;cursor:pointer;transition:color 0.2s;" title="查看发布：${release.tag_name}" onclick="window.open('${release.html_url}','_blank')">v${release.tag_name}</span>
							<span style="color:${textColor};font-size:13px;user-select:text;" title="${release.published_at}">${formatDate(release.published_at)}</span>
						</div>
					</div>
					${processedMdHtml}
				</div>
				${index < (releases as Release[]).length - 1 ? `<div style="height:1px;background-color:${dividerColor};margin:24px 0;opacity:0.7;"></div>` : ''}
			`
			})
			.join('')
		// 根据主题生成不同的样式
		const themeStyles = isDark
			? `
			body { 
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
				margin: 0; 
				padding: 18px 16px; 
				background: transparent; 
				color: #e5e5e5; 
			}
			h1, h2, h3, h4, h5, h6 { 
				color: var(--semi-color-primary, #4a9eff); 
				margin-top: 1.5em; 
				margin-bottom: 0.5em; 
			}
			pre, code { 
				background: #2a2a2a; 
				border-radius: 4px; 
				padding: 2px 4px; 
				font-size: 14px; 
				color: #e5e5e5; 
			}
			pre { 
				padding: 12px; 
				overflow-x: auto; 
			}
			a { 
				color: #4a9eff; 
				text-decoration: underline; 
			}
			img { 
				max-width: 100%; 
				height: auto; 
				display: block; 
				margin: 16px auto; 
				border-radius: 6px; 
				box-shadow: 0 2px 8px rgba(0,0,0,0.2); 
			}
			ul, ol { 
				padding-left: 1.5em; 
				margin: 1em 0; 
			}
			blockquote { 
				border-left: 4px solid #4a4a4a; 
				margin: 1em 0; 
				padding: 0.5em 1em; 
				color: #b0b0b0; 
				background: #2a2a2a; 
				border-radius: 4px; 
			}
		`
			: `
			body { 
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
				margin: 0; 
				padding: 18px 16px; 
				background: transparent; 
				color: #222; 
			}
			h1, h2, h3, h4, h5, h6 { 
				color: var(--semi-color-primary, #1677ff); 
				margin-top: 1.5em; 
				margin-bottom: 0.5em; 
			}
			pre, code { 
				background: #f6f8fa; 
				border-radius: 4px; 
				padding: 2px 4px; 
				font-size: 14px; 
			}
			pre { 
				padding: 12px; 
				overflow-x: auto; 
			}
			a { 
				color: #2d8cf0; 
				text-decoration: underline; 
			}
			img { 
				max-width: 100%; 
				height: auto; 
				display: block; 
				margin: 16px auto; 
				border-radius: 6px; 
				box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
			}
			ul, ol { 
				padding-left: 1.5em; 
				margin: 1em 0; 
			}
			blockquote { 
				border-left: 4px solid #e0e0e0; 
				margin: 1em 0; 
				padding: 0.5em 1em; 
				color: #555; 
				background: #fafbfc; 
				border-radius: 4px; 
			}
		`

		const langCode = language === 'zh' ? 'zh-CN' : 'en'
		return `
			<!DOCTYPE html>
			<html lang='${langCode}'>
			<head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<style>
					${themeStyles}
				</style>
			</head>
			<body>
				<div style="width:100%;margin:0 auto;">${html}</div>
			</body>
			</html>
		`
	}

	return (
		<iframe
			title='changelog-iframe'
			sandbox='allow-same-origin allow-popups allow-forms allow-scripts'
			style={{
				width: '100%',
				height: '100%',
				minHeight: 0,
				border: 'none',
				background: 'transparent',
				borderRadius: 8,
				display: 'block',
			}}
			srcDoc={getIframeHtml()}
		/>
	)
}
