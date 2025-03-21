'use client'
import { useEffect, useRef } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'

export default function YoutubeEmbed() {
	const videoRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// 当元素进入视口时触发点击事件来播放视频
						const playButton = videoRef.current?.querySelector('.lty-playbtn')
						if (playButton instanceof HTMLElement) {
							playButton.click()
						}
						// 一旦播放就取消观察
						observer.disconnect()
					}
				})
			},
			{ threshold: 0.5 } // 当50%的元素可见时触发
		)

		if (videoRef.current) {
			observer.observe(videoRef.current)
		}

		return () => {
			observer.disconnect()
		}
	}, [])

	return (
		<div className='w-full h-full' ref={videoRef}>
			<LiteYouTubeEmbed
				id='pt5-G2KgHi8'
				playlist={false}
				title='Product Demo Video'
				webp
				noCookie={true}
				wrapperClass='w-full h-full aspect-video rounded-lg overflow-hidden'
			/>
		</div>
	)
}
