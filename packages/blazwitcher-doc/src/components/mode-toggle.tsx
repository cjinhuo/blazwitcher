// 客户端主题切换组件
'use client'

import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

/**
 * 主题切换按钮组件
 * @returns 带过渡动画的明暗主题切换控件
 */
export function ModeToggle() {
	// 使用 next-themes 的主题管理钩子
	const { theme, setTheme } = useTheme()

	// 切换主题处理函数
	const handleToggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}

	return (
		<Button variant='outline' size='icon' onClick={handleToggleTheme} aria-label='切换主题'>
			{/* 太阳图标（亮色模式可见） */}
			<Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />

			{/* 月亮图标（暗色模式可见） */}
			<Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
		</Button>
	)
}
