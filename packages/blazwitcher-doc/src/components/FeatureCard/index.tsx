'use client'

import type React from 'react'
import { useState } from 'react'
import { features } from './DataSource'
import ChromeFramework from './chrome-framework'
import FeatureCarousel from './feature-carousel'
import FeatureContent from './feature-content'

const FeatureCard: React.FC = () => {
	const [activeIndex, setActiveIndex] = useState(0)

	return (
		<div className='relative mb-12'>
			<ChromeFramework>
				<FeatureCarousel activeIndex={activeIndex} onSlideChange={setActiveIndex}>
					{features.map((feature) => (
						<FeatureContent key={feature.id} feature={feature} />
					))}
				</FeatureCarousel>
			</ChromeFramework>
		</div>
	)
}

export default FeatureCard
