import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ModeToggle } from '@/components/mode-toggle'
import { ThemeProvider } from '@/components/theme-provider'
import { NextIntlClientProvider } from 'next-intl'

// 配置 Geist 字体
const geist = Geist({
	subsets: ['latin'],
	variable: '--font-geist',
})

// 页面元数据配置
export const metadata: Metadata = {
	title: 'BlazWitcher - Ultimate Smooth Pinyin Search',
	description: 'A Browser Extension for searching tabs, bookmarks, and history, with support for fuzzy Pinyin search.',
	icons: {
		icon: [
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
	},
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
				{/* 网站图标 */}
				<link rel='icon' type='image/svg+xml' href='/icon.svg' />
			</head>
			<body className={`${geist.variable} font-sans antialiased`}>
				<NextIntlClientProvider>
					{/* 主题提供者 */}
					<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
						{/* 主题切换按钮 */}
						<div className='fixed top-4 right-4 z-50'>
							<ModeToggle />
						</div>
						{/* 页面内容 */}
						{children}
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
