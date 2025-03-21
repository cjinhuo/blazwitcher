// 客户端交互式功能轮播组件
'use client'

import { cn } from '@/lib/utils'
import { Calculator, Clipboard, Clock, Grid, History } from 'lucide-react'
import * as React from 'react'
import { TerminalWindow } from './terminal-window'

/**
 * 功能项类型定义
 * @property {string} title - 主标题
 * @property {string} subtitle - 副标题
 * @property {React.ComponentType} icon - Lucide 图标组件
 * @property {React.ReactNode} content - 详情内容区域
 */
interface FeatureItem {
	title: string
	subtitle: string
	icon: React.ComponentType<{ className?: string }>
	content: React.ReactNode
}

// 功能项数据配置
const features: FeatureItem[] = [
	{
		title: 'Remember Everything.',
		subtitle: "Stop playing Clipboard ping pong - with Clipboard History you'll never forget anything.",
		icon: Clipboard,
		content: (
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Clipboard History</h3>
				<div className='space-y-2 text-sm text-muted-foreground'>
					<p>Access your clipboard history with:</p>
					<ol className='list-decimal list-inside space-y-1'>
						<li>Press ⌘+⇧+V to open Clipboard History</li>
						<li>Browse through recent items</li>
						<li>Press Return to paste selected item</li>
					</ol>
				</div>
			</div>
		),
	},
	{
		title: 'Quick Calculations.',
		subtitle: 'Perform calculations instantly without leaving your current task.',
		icon: Calculator,
		content: (
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Calculator</h3>
				<div className='space-y-2 text-sm text-muted-foreground'>
					<p>Instant calculations:</p>
					<ul className='list-disc list-inside space-y-1'>
						<li>Basic arithmetic</li>
						<li>Unit conversions</li>
						<li>Advanced functions</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		title: 'Time Management.',
		subtitle: 'Track time, set reminders, and manage your schedule efficiently.',
		icon: Clock,
		content: (
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Time Tracking</h3>
				<div className='space-y-2 text-sm text-muted-foreground'>
					<p>Stay organized with:</p>
					<ul className='list-disc list-inside space-y-1'>
						<li>Quick timers</li>
						<li>Meeting reminders</li>
						<li>Time zone conversion</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		title: 'Window Management.',
		subtitle: 'Organize your workspace with powerful window controls.',
		icon: Grid,
		content: (
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Window Management</h3>
				<div className='space-y-2 text-sm text-muted-foreground'>
					<p>Efficiently manage windows:</p>
					<ul className='list-disc list-inside space-y-1'>
						<li>Snap windows to positions</li>
						<li>Create custom layouts</li>
						<li>Multiple display support</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		title: 'Command History.',
		subtitle: 'Quick access to your most used commands and recent actions.',
		icon: History,
		content: (
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Recent Commands</h3>
				<div className='space-y-2 text-sm text-muted-foreground'>
					<p>Access your history:</p>
					<ul className='list-disc list-inside space-y-1'>
						<li>View recent commands</li>
						<li>Quick re-run actions</li>
						<li>Favorite commands</li>
					</ul>
				</div>
			</div>
		),
	},
]

/**
 * 功能轮播组件
 * @returns 带状态切换的交互式功能展示区
 */
export function FeatureCarousel() {
	const [activeIndex, setActiveIndex] = React.useState(0)

	return (
		<section className='py-24'>
			<div className='w-full max-w-5xl mx-auto px-4'>
				{/* 标题区域 */}
				<div className='flex flex-col items-center text-center space-y-4 mb-8'>
					<h2 className='text-2xl font-bold'>{features[activeIndex].title}</h2>
					<p className='text-muted-foreground max-w-2xl'>{features[activeIndex].subtitle}</p>
				</div>

				{/* 终端样式内容容器 */}
				<TerminalWindow>
					<div
						className='transition-all duration-300 ease-in-out transform'
						style={{ opacity: 1, transform: 'translateY(0)' }}
					>
						{features[activeIndex].content}
					</div>
				</TerminalWindow>

				{/* 导航按钮组 */}
				<div className='flex justify-center mt-8 gap-2'>
					{features.map((feature, index) => {
						const Icon = feature.icon
						return (
							<button
								key={`${feature.title}-index`}
								onClick={() => setActiveIndex(index)}
								className={cn(
									'p-3 rounded-full transition-all duration-300 ease-in-out',
									'hover:bg-primary/10',
									activeIndex === index ? 'bg-primary/20 scale-125' : 'bg-background scale-100'
								)}
								type={'button'}
							>
								<Icon
									className={cn(
										'w-5 h-5 transition-all duration-300',
										activeIndex === index ? 'text-primary opacity-100' : 'text-muted-foreground opacity-70'
									)}
								/>
							</button>
						)
					})}
				</div>
			</div>
		</section>
	)
}
