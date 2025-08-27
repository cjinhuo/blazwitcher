'use client'

import type React from 'react'
import { features } from './DataSource'
import FeatureItem from './feature-item'

const FeatureCard: React.FC = () => {
	return (
		<div className='max-w-6xl mx-auto px-4 py-12'>
			<div className='space-y-16'>
				{features.map((feature, index) => (
					<FeatureItem key={feature.id} feature={feature} isReversed={index % 2 === 1} />
				))}
			</div>
		</div>
	)
}

export default FeatureCard
