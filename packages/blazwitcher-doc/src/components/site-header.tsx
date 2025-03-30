import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from './language-switcher'

/**
 * 网站头部组件
 * @returns 包含导航和操作按钮的固定头部
 */
export function SiteHeader() {
	return (
		<header className='fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm'>
			<div className='container flex h-14 max-w-7xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8'>
				{/* 网站 Logo 和标题 */}
				<div>
					<Link href='/' className='flex items-center space-x-2'>
						<span className='font-bold'>Blazwitcher</span>
					</Link>
				</div>

				{/* 右侧操作区域 */}
				<div className='flex items-center space-x-4'>
					{/* 主题切换按钮 */}
					<ModeToggle />
					{/* 语言切换按钮 */}
					<LanguageSwitcher />
					{/* GitHub 链接按钮 */}
					<Button variant='outline' asChild>
						<Link
							href='https://github.com/cjinhuo/blazwitcher'
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center'
						>
							<Github className='mr-2 h-4 w-4' />
							GitHub
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
