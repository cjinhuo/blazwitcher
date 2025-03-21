// 客户端组件，用于展示动态功能卡片
'use client'

// 导入工具函数和动画库
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

/**
 * 功能卡片类型定义
 * @property {string} title - 卡片标题
 * @property {string} description - 卡片描述
 * @property {string} gradient - Tailwind 渐变类名
 */
interface FeatureCard {
	title: string
	description: string
	gradient: string
}

// 功能卡片数据配置
const features: FeatureCard[] = [
	{
		title: '极速响应',
		description: '专为性能优化设计，每个交互都经过极致优化',
		gradient: 'from-orange-400 to-orange-500', // 橙色渐变
	},
	{
		title: '无限扩展',
		description: '通过自定义扩展实现工作流程自动化',
		gradient: 'from-blue-400 to-blue-500', // 蓝色渐变
	},
	{
		title: '优雅界面',
		description: '符合 macOS 设计语言的现代简洁界面',
		gradient: 'from-pink-400 to-pink-500', // 粉色渐变
	},
]

/**
 * 功能卡片组件
 * @returns 带入场动画的响应式卡片布局
 */
export function FeatureCards() {
	return (
		<motion.div
			// 容器动画配置
			initial={{ opacity: 0, y: -20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
			className='container max-w-4xl mx-auto px-4'
		>
			{/* 响应式网格布局 */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{features.map((feature, index) => (
					<motion.div
						key={`${feature.title}-index`}
						// 卡片项动画配置
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: index * 0.1 }} // 序列延迟动画
						className='group relative'
					>
						{/* 动态渐变边框效果 */}
						<div
							className='absolute -inset-[1px] rounded-lg bg-gradient-to-r opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md'
							style={{
								backgroundImage: 'linear-gradient(to right, rgb(var(--primary)), rgb(var(--primary)))',
							}}
						/>

						{/* 卡片内容容器 */}
						<div className='relative rounded-lg bg-card/50 p-6 backdrop-blur-sm border border-border/50'>
							{/* 渐变标识块 */}
							<div className={cn('size-12 rounded-lg bg-gradient-to-br mb-4', feature.gradient)} />
							<h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
							<p className='text-muted-foreground'>{feature.description}</p>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	)
}
