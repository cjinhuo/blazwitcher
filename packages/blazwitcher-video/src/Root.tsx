import { useEffect, useState } from 'react'
import { Composition, cancelRender, continueRender, delayRender, staticFile } from 'remotion'
import { HeroVideo } from './HeroVideo'

export const VideoRoot = () => {
	const [fontHandle] = useState(() => delayRender('Load the product monospace font'))
	useEffect(() => {
		const font = new FontFace('SourceCodePro', `url(${staticFile('generated/SourceCodePro.ttf')})`)
		void font
			.load()
			.then((loaded) => {
				document.fonts.add(loaded)
				continueRender(fontHandle)
			})
			.catch(cancelRender)
	}, [fontHandle])
	return (
		<>
			{(
				[
					{ id: 'BlazwitcherHero', locale: 'zh' },
					{ id: 'BlazwitcherHeroEn', locale: 'en' },
				] as const
			).map(({ id, locale }) => (
				<Composition
					key={id}
					id={id}
					component={HeroVideo}
					defaultProps={{ locale }}
					durationInFrames={840}
					fps={30}
					width={1920}
					height={1080}
				/>
			))}
		</>
	)
}
