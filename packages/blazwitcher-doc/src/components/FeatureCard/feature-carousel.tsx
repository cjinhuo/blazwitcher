'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { features } from './DataSource'
import { IconDatabase, IconKeyboard, IconSearch, IconSettings } from './feature-icons'

interface CarouselProps {
	children: React.ReactNode[]
	onSlideChange: (index: number) => void
	activeIndex: number
}

const FeatureCarousel: React.FC<CarouselProps> = ({ children, onSlideChange, activeIndex }) => {
	const [isTransitioning, setIsTransitioning] = useState(false)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const handleSlideChange = useCallback(
		(newIndex: number) => {
			if (isTransitioning) return

			setIsTransitioning(true)
			onSlideChange(newIndex)

			// Reset transition flag after animation completes
			setTimeout(() => {
				setIsTransitioning(false)
			}, 300)
		},
		[isTransitioning, onSlideChange]
	)

	// 使用useCallback包装resetAutoRotation
	const resetAutoRotation = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}

		intervalRef.current = setInterval(() => {
			handleSlideChange((activeIndex + 1) % features.length)
		}, 5000)
	}, [activeIndex, handleSlideChange])

	// Auto rotate feature every 5 seconds
	useEffect(() => {
		resetAutoRotation()

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [resetAutoRotation]) // 现在只依赖于resetAutoRotation

	// Function to render feature button based on index
	const renderFeatureIcon = (index: number) => {
		switch (index) {
			case 0: // 搜索
				return <IconSearch className='w-5 h-5' />
			case 1: // 数据来源
				return <IconDatabase className='w-5 h-5' />
			case 2: // 纯键盘操作
				return <IconKeyboard className='w-5 h-5' />
			case 3: // 自定义设置
				return <IconSettings className='w-5 h-5' />
			default:
				return <IconSearch className='w-5 h-5' />
		}
	}

	return (
		<div className='content-placeholder flex items-center justify-center'>
			{/* Content slides */}
			<div
				className='w-full h-full absolute top-0 left-0'
				style={{
					opacity: isTransitioning ? 0.5 : 1,
					transition: 'opacity 300ms ease-in-out',
				}}
			>
				{children[activeIndex]}
			</div>

			{/* Command bar for feature selection, always visible at bottom */}
			<div className='absolute bottom-4 left-0 right-0 flex justify-center space-x-4'>
				{features.map((_, index) => (
					<button
						// Replace the index with a unique identifier from the features array
						key={features[index].id || index}
						type='button'
						className={`feature-command ${activeIndex === index ? 'active' : ''}`}
						onClick={() => handleSlideChange(index)}
						aria-label={`Feature ${index + 1}`}
					>
						{renderFeatureIcon(index)}
					</button>
				))}
			</div>
		</div>
	)
}

export default FeatureCarousel
