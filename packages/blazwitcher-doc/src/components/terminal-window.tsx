import type * as React from 'react'

/**
 * 终端窗口样式容器组件
 * @param {React.ReactNode} children - 子内容
 * @returns 带渐变背景的终端样式容器
 */
export function TerminalWindow({ children }: { children: React.ReactNode }) {
	return (
		<div className='relative rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden'>
			{/* 右上角渐变背景 */}
			<div className='absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/10 to-transparent' />

			{/* 内容区域 */}
			<div className='relative p-4'>{children}</div>
		</div>
	)
}
