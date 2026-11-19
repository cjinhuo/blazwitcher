import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StructuredData } from '@/components/structured-data'
import { ThemeProvider } from '@/components/theme-provider'
import { routing } from '@/i18n/routing'
import { languageUrls, siteUrl } from '@/lib/site'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
type LocaleParams = Promise<{ locale: string }>

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = { themeColor: '#000000' }

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	const t = await getTranslations({ locale, namespace: 'Metadata' })
	const title = t('title')
	const description = t('description')
	const url = languageUrls[locale]
	const images = [{ url: `${siteUrl}/880x440-radius.png`, width: 880, height: 440, alt: t('imageAlt') }]

	return {
		metadataBase: new URL(siteUrl),
		title,
		description,
		alternates: { canonical: url, languages: languageUrls },
		openGraph: {
			type: 'website',
			siteName: 'BlazWitcher',
			title,
			description,
			url,
			images,
			locale: locale === 'zh' ? 'zh_CN' : 'en_US',
			alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
		},
		twitter: { card: 'summary_large_image', title, description, images },
		robots: {
			index: true,
			follow: true,
			googleBot: { 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
		},
		authors: [{ name: 'BlazWitcher Team' }],
		icons: { icon: '/icon.svg', apple: '/icon.svg' },
		manifest: '/manifest.json',
		formatDetection: { telephone: false },
	}
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: LocaleParams }) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	setRequestLocale(locale)
	const t = await getTranslations({ locale, namespace: 'Metadata' })

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geist.variable} font-sans antialiased`}>
				<StructuredData locale={locale} description={t('description')} />
				<NextIntlClientProvider>
					<ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</NextIntlClientProvider>
				<Analytics />
			</body>
		</html>
	)
}
