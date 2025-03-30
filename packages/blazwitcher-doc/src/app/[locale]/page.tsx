import FeatureCard from '@/components/FeatureCard'
import SectionContent from '@/components/section-content'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { useTranslations } from 'next-intl'

/**
 * 首页组件
 * @returns 包含头部、主体内容和页脚的完整页面布局
 */
export default function Home() {
	const t = useTranslations('LandingPage')

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

				{/* 视频和功能轮播区域 */}
				<div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
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
								<h1 className='text-4xl font-bold text-primary mb-2'>{t('features.title')}</h1>
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
