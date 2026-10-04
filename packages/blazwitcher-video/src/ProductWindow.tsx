import type { ReactNode } from 'react'
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion'

type ProductView = 'search' | 'commands' | 'settings'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

// Reference pixels stay intact; framing and emphasis are video layers.
const Screenshot = ({ name, opacity = 1 }: { name: string; opacity?: number }) => (
	<Img
		src={staticFile(`generated/${name}.png`)}
		style={{ position: 'absolute', inset: 0, width: 1280, height: 800, opacity }}
	/>
)

const WindowHeader = () => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: 1280,
			height: 45,
			background: '#fff',
			borderBottom: '1px solid #e5e5e5',
			display: 'flex',
			alignItems: 'center',
			gap: 13,
			padding: '0 13px',
			boxSizing: 'border-box',
		}}
	>
		{['#ff605b', '#ffc52f', '#56c95e'].map((color) => (
			<span
				key={color}
				style={{ width: 20, height: 20, borderRadius: '50%', background: color, border: '1px solid #0001' }}
			/>
		))}
		<span style={{ marginLeft: 8, fontSize: 21, color: '#555', fontWeight: 650 }}>Blazwitcher</span>
	</div>
)

const SearchPlayback = () => {
	const frame = useCurrentFrame()
	const query = 'pinyin'.slice(0, Math.max(0, Math.floor((frame - 20) / 6)))
	const bodyMask = interpolate(frame, [35, 60], [1, 0], clamp)
	return (
		<>
			<Screenshot name='search-results' />
			<div
				style={{
					position: 'absolute',
					left: 52,
					top: 54,
					width: 1150,
					height: 48,
					background: '#fff',
					display: 'flex',
					alignItems: 'center',
					fontFamily: 'SourceCodePro, monospace',
					fontSize: 26,
					color: '#23272d',
				}}
			>
				{query}
				<span
					style={{
						marginLeft: 2,
						width: 2,
						height: 28,
						background: '#737373',
						opacity: frame < 76 && Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
					}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 113,
					width: 1280,
					height: 632,
					background: '#fafafa',
					opacity: bodyMask,
				}}
			/>
		</>
	)
}

const CommandPlayback = () => {
	const frame = useCurrentFrame()
	const top = frame < 55 ? 302 : frame < 100 ? 468 : 386
	const opacity = interpolate(frame, [15, 30], [0, 1], clamp)
	return (
		<>
			<Screenshot name='command-menu' />
			<div
				style={{
					position: 'absolute',
					left: 8,
					top,
					width: 1255,
					height: 72,
					border: '2px solid #8f69e5',
					borderRadius: 8,
					background: '#a855f708',
					boxSizing: 'border-box',
					opacity,
				}}
			/>
		</>
	)
}

const SettingsPlayback = () => {
	const frame = useCurrentFrame()
	const crossfade = interpolate(frame, [53, 65], [0, 1], clamp)
	return (
		<>
			<Screenshot name='appearance-settings' />
			<Screenshot name='search-settings' opacity={crossfade} />
		</>
	)
}

export const ProductWindow = ({ view }: { view: ProductView }) => {
	const frame = useCurrentFrame()
	const entrance = interpolate(frame, [5, 28], [0, 1], clamp)
	const zoom = interpolate(frame, [28, view === 'search' ? 210 : 135], [1, 1.018], clamp)
	const content: Record<ProductView, ReactNode> = {
		search: <SearchPlayback />,
		commands: <CommandPlayback />,
		settings: <SettingsPlayback />,
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: 745,
				top: 204,
				width: 1088,
				height: 680,
				opacity: entrance,
				transform: `translateY(${(1 - entrance) * 24}px) scale(${zoom})`,
				transformOrigin: 'center',
			}}
		>
			<div
				style={{
					width: 1280,
					height: 800,
					transform: 'scale(0.85)',
					transformOrigin: 'top left',
					position: 'relative',
					borderRadius: 20,
					overflow: 'hidden',
					background: '#fff',
					border: '1px solid #d8d2df',
					boxShadow: '0 32px 90px #5a347c26, 0 5px 14px #4b2d6912',
				}}
			>
				{content[view]}
				<WindowHeader />
			</div>
		</div>
	)
}
