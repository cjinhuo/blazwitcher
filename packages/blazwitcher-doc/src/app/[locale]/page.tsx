import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import FeatureCard from '@/components/FeatureCard'
import HomePromoVideo from '@/components/home-promo-video'
import SectionContent from '@/components/section-content'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { LinkButton } from '@/components/ui/link-button'
import { routing } from '@/i18n/routing'
import { raycastStoreUrl } from '@/lib/site'

/**
 * 首页组件
 * @returns 包含头部、主体内容和页脚的完整页面布局
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	setRequestLocale(locale)
	const t = await getTranslations({ locale, namespace: 'LandingPage' })

	return (
		<div className='relative flex min-h-screen flex-col'>
			{/* 网站头部 */}
			<SiteHeader />

			{/* 页面主体内容 */}
			<main className='flex-1'>
				{/* 首屏内容区域 */}
				<section className='space-y-6 pb-8 pt-32 md:pb-12 md:pt-40 lg:py-32'>
					<SectionContent />
				</section>

				<div className='container mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8'>
					<section aria-labelledby='pinyin-example' className='rounded-xl border border-border/60 p-6'>
						<h2 id='pinyin-example' className='mb-3 text-2xl font-semibold'>
							{t('guide.title')}
						</h2>
						<p className='text-muted-foreground'>{t('guide.intro')}</p>
						<ol className='my-4 list-decimal space-y-2 pl-6 text-muted-foreground'>
							<li>
								{t.rich('guide.open', {
									mac: () => <kbd>Command+Shift+K</kbd>,
									windows: () => <kbd>Ctrl+Shift+K</kbd>,
								})}
							</li>
							<li>
								{t.rich('guide.search', {
									query: () => <code>/t sxw</code>,
									filter: () => <code>/t</code>,
									initials: () => <code>sxw</code>,
								})}
							</li>
							<li>{t.rich('guide.select', { enter: () => <kbd>Enter</kbd> })}</li>
						</ol>
						<p className='text-sm text-muted-foreground'>
							{t.rich('guide.filters', { bookmarks: () => <code>/b</code>, history: () => <code>/h</code> })}
						</p>
					</section>
					<section aria-labelledby='raycast-edition' className='rounded-xl border border-border/60 p-6'>
						<h2 id='raycast-edition' className='mb-3 text-2xl font-semibold'>
							{t('raycast.title')}
						</h2>
						<p className='mb-4 text-muted-foreground'>{t('raycast.description')}</p>
						<LinkButton
							href={raycastStoreUrl}
							variant='outline'
							className='h-auto whitespace-normal text-left'
							isExternal
						>
							{t('raycast.install')}
						</LinkButton>
					</section>
				</div>

				{/* 视频和功能轮播区域 */}
				<div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
					<HomePromoVideo key={locale} />
					{/* YouTube 视频嵌入 */}
					{/* <div className='mb-16 flex justify-center items-center'>
						<div className='relative rounded-lg overflow-hidden aspect-video'>
							<YoutubeEmbed />
						</div>
					</div> */}

					{/* 功能轮播组件 */}
					<div className='flex items-center justify-center p-4'>
						<div className='max-w-5xl w-full mx-auto'>
							<div className='text-center mb-10'>
								<h2 className='text-4xl font-bold text-primary mb-2'>{t('features.title')}</h2>
								<p className='text-xl text-gray-400'>{t('features.subtitle')}</p>
							</div>

							<FeatureCard />
						</div>
					</div>
				</div>
			</main>

			<SiteFooter />
		</div>
	)
}
