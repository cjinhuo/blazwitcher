import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/components/structured-data'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/react'
import { NextIntlClientProvider } from 'next-intl'

// 配置 Geist 字体
const geist = Geist({
	subsets: ['latin'],
	variable: '--font-geist',
})

// 页面元数据配置
export const metadata: Metadata = {
	title: 'BlazWitcher - Ultimate Pinyin Search Engine for Chrome Extension',
	description:
		'BlazWitcher is a powerful Chrome extension with advanced pinyin search capabilities. Search tabs, bookmarks, and history with fuzzy pinyin search, text search engine, and AI grouping. 拼音模糊搜索浏览器扩展.',
	keywords: [
		'pinyin search',
		'blazwitcher',
		'text search engine',
		'拼音模糊搜索',
		'chrome extension',
		'browser extension',
		'tab search',
		'bookmark search',
		'fuzzy search',
		'chinese search',
		'pinyin fuzzy search',
		'browser productivity',
		'tab management',
	],
	authors: [{ name: 'BlazWitcher Team' }],
	creator: 'BlazWitcher',
	publisher: 'BlazWitcher',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://blazwitcher.vercel.app',
		siteName: 'BlazWitcher',
		title: 'BlazWitcher - Ultimate Pinyin Search & AI Tab Grouping for Chrome Extension',
		description:
			'Ultimate pinyin search Chrome extension for tabs, bookmarks, and history. Features fuzzy pinyin search, text search engine, and AI-powered grouping. 拼音模糊搜索 & AI 标签分组浏览器插件',
		images: [
			{
				url: '/880x440-radius.png',
				width: 880,
				height: 440,
				alt: 'BlazWitcher - Pinyin Search Engine',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'BlazWitcher - Ultimate Pinyin Search Engine',
		description: 'Advanced pinyin search Chrome extension with fuzzy search capabilities and AI grouping.',
		images: ['/880x440-radius.png'],
		creator: '@blazwitcher',
	},
	alternates: {
		canonical: 'https://blazwitcher.vercel.app',
		languages: {
			'en-US': 'https://blazwitcher.vercel.app/en',
			'zh-CN': 'https://blazwitcher.vercel.app/zh',
		},
	},
	icons: {
		icon: [
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: [
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
	},
	manifest: '/manifest.json',
}

/**
 * 根布局组件
 * @param {React.ReactNode} children - 子页面内容
 * @returns 包含主题和字体配置的页面布局
 */
export default async function RootLayout({
	children,
	params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await params

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<link rel='icon' type='image/svg+xml' href='/icon.svg' />
				{/* SEO 优化 meta 标签 */}
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='theme-color' content='#000000' />
				<meta name='format-detection' content='telephone=no' />
				<link rel='canonical' href='https://blazwitcher.vercel.app' />
				{/* 预连接到外部资源 */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
			</head>
			<body className={`${geist.variable} font-sans antialiased`}>
				<StructuredData locale={locale} />
				<NextIntlClientProvider>
					{/* 主题提供者 */}
					<ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
						{/* 页面内容 */}
						{children}
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
			<Analytics />
		</html>
	)
}
