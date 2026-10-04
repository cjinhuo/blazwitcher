import { type ReactNode, useContext } from 'react'
import {
	AbsoluteFill,
	Easing,
	Html5Audio,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion'

import { ProductWindow } from './ProductWindow'
import { useVideoCopy, type VideoLocale, VideoLocaleContext, videoCopy } from './video-copy'

const INK = '#24212f'
const MUTED = '#858093'
const PURPLE = '#a855f7'
const GRADIENT = 'linear-gradient(110deg, #a855f7, #ec4899)'
const FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ease = (frame: number, start = 0, duration = 24) =>
	interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })

const GradientText = ({ children }: { children: ReactNode }) => (
	<span style={{ background: GRADIENT, backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{children}</span>
)

const Brand = ({ large = false }: { large?: boolean }) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: large ? 24 : 14 }}>
		<Img src={staticFile('generated/icon.svg')} style={{ width: large ? 80 : 44, height: large ? 80 : 44 }} />
		<span style={{ fontSize: large ? 44 : 28, fontWeight: 650, letterSpacing: -1 }}>Blazwitcher</span>
	</div>
)

const SceneShell = ({ children, duration }: { children: ReactNode; duration: number }) => {
	const frame = useCurrentFrame()
	const opacity = interpolate(frame, [0, 12, duration - 12, duration - 1], [0, 1, 1, 0], clamp)
	return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

const Copy = ({
	eyebrow,
	title,
	description,
	children,
}: {
	eyebrow: string
	title: ReactNode
	description: ReactNode
	children?: ReactNode
}) => {
	const frame = useCurrentFrame()
	const locale = useContext(VideoLocaleContext)
	const progress = ease(frame, 3)
	return (
		<div
			style={{
				position: 'absolute',
				left: 100,
				top: 290,
				width: 620,
				opacity: progress,
				transform: `translateY(${(1 - progress) * 24}px)`,
			}}
		>
			<div style={{ fontSize: 20, color: PURPLE, letterSpacing: 3, marginBottom: 30, fontWeight: 650 }}>{eyebrow}</div>
			<h1
				style={{
					fontSize: locale === 'en' ? 68 : 78,
					lineHeight: 1.26,
					margin: 0,
					fontWeight: 720,
					letterSpacing: locale === 'en' ? -2 : -3,
				}}
			>
				{title}
			</h1>
			<div style={{ marginTop: 30, fontSize: 26, color: MUTED, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
				{description}
			</div>
			{children}
		</div>
	)
}

const Key = ({ children, active = false }: { children: ReactNode; active?: boolean }) => (
	<span
		style={{
			display: 'inline-flex',
			height: 48,
			minWidth: 48,
			padding: '0 12px',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 11,
			background: active ? '#efe0ff' : '#fff',
			border: `1px solid ${active ? '#cfa2fa' : '#e6e1ee'}`,
			boxShadow: '0 3px 0 #e6e1ee',
			fontSize: 22,
			color: active ? '#8b38cf' : '#625e70',
		}}
	>
		{children}
	</span>
)

const Intro = () => {
	const copy = useVideoCopy()
	return (
		<SceneShell duration={105}>
			<Copy
				eyebrow='YOUR BROWSER, WITH CLARITY'
				title={
					<>
						{copy.intro.title[0]}
						<br />
						{copy.intro.title[1]}
					</>
				}
				description={copy.intro.description}
			/>
			<OffthreadVideo
				muted
				transparent
				src={staticFile('generated/TabSwarm.webm')}
				style={{ position: 'absolute', width: 1200, height: 760, right: -35, top: 155 }}
			/>
		</SceneShell>
	)
}

const SearchScene = () => {
	const frame = useCurrentFrame()
	const copy = useVideoCopy()
	return (
		<SceneShell duration={225}>
			<Copy
				eyebrow='01 / FUZZY PINYIN SEARCH'
				title={
					<>
						{copy.search.title[0]}
						<br />
						<GradientText>{copy.search.title[1]}</GradientText>
					</>
				}
				description={copy.search.description}
			>
				<div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
					<Key>⌘</Key>
					<Key>⇧</Key>
					<Key>K</Key>
					<span style={{ marginLeft: 10, fontSize: 19, color: MUTED, alignSelf: 'center' }}>{copy.openSearch}</span>
				</div>
			</Copy>
			<ProductWindow view='search' />
			<div
				style={{
					position: 'absolute',
					top: 910,
					left: 990,
					display: 'flex',
					gap: 18,
					alignItems: 'center',
					fontSize: 26,
					color: '#746382',
					opacity: ease(frame, 65),
				}}
			>
				<span style={{ fontFamily: 'monospace', background: '#eee5f9', padding: '9px 20px', borderRadius: 10 }}>
					pinyin
				</span>
				<span style={{ color: '#baa8cc' }}>→</span>
				<span>拼音 / Pinyin</span>
				{frame > 135 ? (
					<>
						<span style={{ color: '#baa8cc' }}>→</span>
						<Key active>↵</Key>
						<span style={{ fontSize: 20 }}>{copy.openResult}</span>
					</>
				) : null}
			</div>
		</SceneShell>
	)
}

const SourcesScene = () => {
	const frame = useCurrentFrame()
	const copy = useVideoCopy()
	const activeCommand = frame < 55 ? '/t' : frame < 100 ? '/b' : '/h'
	return (
		<SceneShell duration={150}>
			<Copy
				eyebrow='02 / ONE SEARCH, EVERYWHERE'
				title={
					<>
						{copy.sources.title[0]}
						<br />
						<GradientText>{copy.sources.title[1]}</GradientText>
					</>
				}
				description={copy.sources.description}
			>
				<div style={{ display: 'flex', gap: 12, marginTop: 35 }}>
					{['/t', '/b', '/h'].map((command, i) => (
						<div
							key={command}
							style={{
								display: 'flex',
								gap: 10,
								alignItems: 'center',
								padding: '13px 16px',
								borderRadius: 12,
								background: command === activeCommand ? '#f0e5ff' : '#ffffffa6',
								border: `1px solid ${command === activeCommand ? '#d2b1f4' : '#e6e0ec'}`,
								opacity: ease(frame, 16 + i * 8),
							}}
						>
							<span
								style={{ fontSize: 23, color: command === activeCommand ? PURPLE : '#766a85', fontFamily: 'monospace' }}
							>
								{command}
							</span>
							<span style={{ fontSize: 20, color: MUTED }}>{copy.sourceLabels[i]}</span>
						</div>
					))}
				</div>
			</Copy>
			<ProductWindow view='commands' />
		</SceneShell>
	)
}

const SettingsScene = () => {
	const frame = useCurrentFrame()
	const copy = useVideoCopy()
	return (
		<SceneShell duration={120}>
			<Copy
				eyebrow='03 / MAKE IT YOURS'
				title={
					<>
						{copy.settings.title[0]}
						<br />
						<GradientText>{copy.settings.title[1]}</GradientText>
					</>
				}
				description={copy.settings.description}
			>
				<div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 34 }}>
					<span
						style={{
							padding: '10px 20px',
							fontSize: 25,
							border: '1px solid #dbc6ed',
							borderRadius: 11,
							background: '#fff',
							color: PURPLE,
							fontFamily: 'monospace',
						}}
					>
						{frame < 60 ? '/s' : '/s search'}
					</span>
					<span style={{ color: MUTED, fontSize: 20 }}>{copy.settingLabels[frame < 60 ? 0 : 1]}</span>
				</div>
			</Copy>
			<ProductWindow view='settings' />
		</SceneShell>
	)
}

const GroupingScene = () => {
	const frame = useCurrentFrame()
	const copy = useVideoCopy()
	return (
		<SceneShell duration={150}>
			<Copy
				eyebrow='04 / AI TAB GROUPING'
				title={
					<>
						{copy.grouping.title[0]}
						<br />
						<GradientText>{copy.grouping.title[1]}</GradientText>
					</>
				}
				description={copy.grouping.description}
			>
				<div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 34 }}>
					<span
						style={{
							padding: '10px 20px',
							fontSize: 25,
							border: '1px solid #dbc6ed',
							borderRadius: 11,
							background: '#fff',
							color: PURPLE,
							fontFamily: 'monospace',
						}}
					>
						/ai
					</span>
					<Key active={frame > 30}>↵</Key>
				</div>
			</Copy>
			<OffthreadVideo
				muted
				transparent
				src={staticFile('generated/TabGrouping.webm')}
				style={{ position: 'absolute', width: 1200, height: 760, right: -35, top: 155 }}
			/>
			<div
				style={{
					position: 'absolute',
					left: 930,
					top: 855,
					width: 850,
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 36,
					textAlign: 'center',
					opacity: ease(frame, 78),
					fontSize: 21,
					color: MUTED,
				}}
			>
				{copy.groupingLabels.map((label) => (
					<span key={label}>{label}</span>
				))}
			</div>
		</SceneShell>
	)
}

const Outro = () => {
	const frame = useCurrentFrame()
	const copy = useVideoCopy()
	const progress = ease(frame, 0)
	return (
		<SceneShell duration={90}>
			<AbsoluteFill
				style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - progress) * 20}px)` }}
			>
				<Brand large />
				<h1 style={{ fontSize: 88, lineHeight: 1.28, margin: '38px 0 25px', letterSpacing: -4, textAlign: 'center' }}>
					{copy.outro.title[0]}
					<br />
					<GradientText>{copy.outro.title[1]}</GradientText>
				</h1>
				<div style={{ fontSize: 27, color: MUTED }}>{copy.outro.features}</div>
				<div
					style={{
						marginTop: 36,
						padding: '15px 32px',
						borderRadius: 13,
						background: INK,
						color: '#fff',
						fontSize: 23,
					}}
				>
					{copy.outro.cta} <span style={{ marginLeft: 15 }}>↗</span>
				</div>
				<div style={{ marginTop: 20, fontSize: 19, color: '#aaa1b7' }}>blazwitcher.vercel.app</div>
			</AbsoluteFill>
		</SceneShell>
	)
}

export const HeroVideo = ({ locale }: { locale: VideoLocale }) => {
	const frame = useCurrentFrame()
	const copy = videoCopy[locale]
	return (
		<VideoLocaleContext.Provider value={locale}>
			<AbsoluteFill style={{ fontFamily: FONT, color: INK, background: '#fffafd' }}>
				<Html5Audio src={staticFile('generated/find-your-flow.wav')} name='Find Your Flow' />
				<AbsoluteFill
					style={{
						background:
							'radial-gradient(ellipse at 90% 50%, #ffe6c580, transparent 60%), radial-gradient(ellipse at 10% 80%, #f6c2e460, transparent 55%)',
					}}
				/>
				<div style={{ position: 'absolute', top: 66, left: 100, opacity: frame < 750 ? 1 : 0 }}>
					<Brand />
				</div>
				<div
					style={{
						position: 'absolute',
						top: 80,
						right: 100,
						fontSize: 16,
						letterSpacing: 3,
						color: '#b6adbf',
						opacity: frame < 750 ? 1 : 0,
					}}
				>
					FIND YOUR FLOW
				</div>
				<Sequence from={0} durationInFrames={105} name={copy.intro.title.join(' ')}>
					<Intro />
				</Sequence>
				<Sequence from={105} durationInFrames={225} name={copy.search.title.join(' ')}>
					<SearchScene />
				</Sequence>
				<Sequence from={330} durationInFrames={150} name={copy.sources.title.join(' ')}>
					<SourcesScene />
				</Sequence>
				<Sequence from={480} durationInFrames={120} name={copy.settings.title.join(' ')}>
					<SettingsScene />
				</Sequence>
				<Sequence from={600} durationInFrames={150} name={copy.grouping.title.join(' ')}>
					<GroupingScene />
				</Sequence>
				<Sequence from={750} durationInFrames={90} name={copy.outro.title.join(' ')}>
					<Outro />
				</Sequence>
				<div
					style={{
						position: 'absolute',
						left: 100,
						right: 100,
						bottom: 45,
						height: 2,
						background: '#eee6f3',
						opacity: frame < 750 ? 1 : 0,
					}}
				>
					<div style={{ width: `${Math.min(100, (frame / 750) * 100)}%`, height: '100%', background: GRADIENT }} />
				</div>
			</AbsoluteFill>
		</VideoLocaleContext.Provider>
	)
}
