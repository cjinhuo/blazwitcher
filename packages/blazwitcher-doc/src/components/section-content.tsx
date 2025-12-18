// 主页核心内容区块组件
'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/link-button'

/**
 * 首页主内容区块组件
 * @returns 包含动画效果的主页核心内容区域
 */
export default function SectionContent() {
	const t = useTranslations('LandingPage')

	return (
		<motion.div
			// 入场动画配置
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='container flex max-w-7xl flex-col items-center gap-4 text-center mx-auto px-4 sm:px-6 lg:px-8'
		>
			{/* 渐变文字标题 */}
			<h1 className='font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl'>
				<span className='inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[size:200%] animate-gradient'>
					{t('slogan.line1')}
				</span>
				<br />
				<span className='inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[size:200%] animate-gradient'>
					{t('slogan.line2')}
				</span>
			</h1>

			{/* 描述文本 */}
			<p className='max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mx-auto'>
				{t('description')}
				<br />
			</p>

			{/* 操作按钮组 */}
			<div className='space-x-4'>
				<LinkButton
					href='https://chromewebstore.google.com/detail/blazwitcher-fuzzy-pinyin/fjgablnemienkegdnbihhemebmmonihg'
					size='lg'
					className='h-12'
					isExternal
				>
					{t('actions.install_store')}
				</LinkButton>
			</div>

			{/* 版本信息和次级操作 */}
			<div className='flex flex-col items-center space-y-4 mt-4'>
				<LinkButton
					href='https://github.com/cjinhuo/text-search-engine'
					size='sm'
					variant='outline'
					className='h-8 rounded-full border-muted px-4'
					isExternal
				>
					{t('actions.get_algorithm')}
					<span className='ml-2 text-muted-foreground'>{t('actions.engine_name')} →</span>
				</LinkButton>
			</div>
		</motion.div>
	)
}
