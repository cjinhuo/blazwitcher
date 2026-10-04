'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

export default function HomePromoVideo() {
	const t = useTranslations('LandingPage.video')
	const locale = useLocale() === 'en' ? 'en' : 'zh'
	const videoFile = `/video/blazwitcher-hero-${locale}.mp4`
	const posterFile = `/video/blazwitcher-hero-${locale === 'en' ? 'en-' : ''}poster.jpg`
	const ref = useRef<HTMLVideoElement>(null)
	const [muted, setMuted] = useState(true)
	const toggleMusic = () => {
		const video = ref.current
		if (!video) return
		video.muted = !video.muted
		setMuted(video.muted)
	}

	useEffect(() => {
		const video = ref.current
		if (!video) return
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
		let visible = false
		const updatePlayback = () => {
			if (visible && !document.hidden && !reducedMotion.matches) {
				void video.play().catch(() => {})
			} else {
				video.pause()
			}
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting
				updatePlayback()
			},
			{ threshold: 0.3 }
		)
		observer.observe(video)
		reducedMotion.addEventListener('change', updatePlayback)
		document.addEventListener('visibilitychange', updatePlayback)
		return () => {
			observer.disconnect()
			reducedMotion.removeEventListener('change', updatePlayback)
			document.removeEventListener('visibilitychange', updatePlayback)
			video.pause()
		}
	}, [])

	return (
		<section className='mx-auto mb-20 max-w-6xl' aria-label={t('title')}>
			<video
				ref={ref}
				className='aspect-video w-full rounded-2xl border border-purple-100 shadow-lg'
				width={1920}
				height={1080}
				muted={muted}
				onVolumeChange={() => setMuted(ref.current?.muted ?? true)}
				loop
				playsInline
				controls
				preload='none'
				poster={posterFile}
				aria-label={t('title')}
			>
				<source src={videoFile} type='video/mp4' />
				<track kind='captions' src={`/video/blazwitcher-hero-${locale}.vtt`} srcLang={locale} label={t('captions')} />
				<a href={videoFile}>{t('download')}</a>
			</video>
			<div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
				<p className='text-center text-sm text-muted-foreground'>{t('description')}</p>
				<button
					type='button'
					onClick={toggleMusic}
					className='inline-flex items-center gap-1.5 rounded-full border border-purple-200 px-3 py-1.5 text-xs text-purple-700 transition-colors hover:bg-purple-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
				>
					{muted ? <VolumeX className='size-3.5' aria-hidden /> : <Volume2 className='size-3.5' aria-hidden />}
					{t(muted ? 'enableMusic' : 'muteMusic')}
				</button>
			</div>
		</section>
	)
}
