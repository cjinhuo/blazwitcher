'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Feature } from './DataSource'

interface FeatureItemProps {
	feature: Feature
	isReversed?: boolean
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, isReversed = false }) => {
	const t = useTranslations('LandingPage')
	const [isVisible, setIsVisible] = useState(false)
	const itemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
				}
			},
			{
				threshold: 0.2, // 当元素20%进入视口时触发
				rootMargin: '-50px 0px', // 提前50px触发动画
			}
		)

		if (itemRef.current) {
			observer.observe(itemRef.current)
		}

		return () => {
			if (itemRef.current) {
				observer.unobserve(itemRef.current)
			}
		}
	}, [])

	return (
		<div
			ref={itemRef}
			className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} xl:gap-16 transition-all duration-1000 ease-out ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
			}`}
		>
			{/* 文字介绍部分 - 占用较小宽度 */}
			<div
				className={`w-full lg:w-1/4 space-y-4 text-center lg:text-left transition-all duration-1000 ease-out delay-200 ${
					isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isReversed ? 'translate-x-8' : '-translate-x-8'}`
				}`}
			>
				<h3 className='text-2xl md:text-3xl font-bold text-gray-900 leading-tight'>{t(feature.title)}</h3>
				<p className='text-base md:text-lg text-gray-600 leading-relaxed'>{t(feature.description)}</p>
			</div>

			{/* 动态图片部分 - 占用较大宽度 */}
			<div
				className={`w-full lg:w-3/4 transition-all duration-1000 ease-out delay-400 ${
					isVisible
						? 'opacity-100 translate-x-0 scale-100'
						: `opacity-0 ${isReversed ? '-translate-x-8' : 'translate-x-8'} scale-95`
				}`}
			>
				<div className='relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]'>
					<Image
						src={feature.gifUrl}
						height={400}
						width={600}
						alt={t(feature.title)}
						className='w-full h-auto object-cover'
						priority={feature.id <= 2}
					/>
				</div>
			</div>
		</div>
	)
}

export default FeatureItem
