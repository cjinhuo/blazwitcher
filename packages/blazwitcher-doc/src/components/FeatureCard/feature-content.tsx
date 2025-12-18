'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type React from 'react'
import type { Feature } from './DataSource'

interface FeatureContentProps {
	feature: Feature
}

const FeatureContent: React.FC<FeatureContentProps> = ({ feature }) => {
	const t = useTranslations('LandingPage')

	return (
		<div className='relative bg-white rounded-lg shadow-md h-full w-full p-4'>
			<div className='mb-4'>
				<h2 className='text-gray-800 text-2xl font-bold mb-2'>{t(feature.title)}</h2>
				<p className='text-gray-600'>{t(feature.description)}</p>
				<Image
					src={feature.gifUrl}
					height={310}
					width={730}
					alt={feature.title}
					className='mt-4 mx-auto rounded-lg border shadow-lg object-contain transition-transform duration-300 hover:scale-[1.02]'
				/>
			</div>
		</div>
	)
}

export default FeatureContent
