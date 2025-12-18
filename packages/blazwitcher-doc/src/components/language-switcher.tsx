'use client'

import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

/**
 * 语言切换器组件
 * 支持中文和英文切换
 */
export function LanguageSwitcher() {
	const locale = useLocale()
	const router = useRouter()

	const handleLanguageChange = () => {
		const newLocale = locale === 'zh' ? 'en' : 'zh'
		router.replace(`/${newLocale}`)
	}

	return (
		<Button
			variant='outline'
			size='icon'
			onClick={handleLanguageChange}
			title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
		>
			{locale === 'zh' ? <Languages className='h-4 w-4' /> : <span className='text-sm font-bold'>中</span>}
		</Button>
	)
}
