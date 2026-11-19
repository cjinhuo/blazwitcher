'use client'

import { Languages } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
	const english = useLocale() === 'zh'
	const label = english ? 'Switch to English' : '切换到中文'
	return (
		<Button variant='outline' size='icon' asChild>
			<Link href={english ? '/en' : '/zh'} hrefLang={english ? 'en' : 'zh'} aria-label={label} title={label}>
				{english ? <Languages className='h-4 w-4' /> : <span className='text-sm font-bold'>中</span>}
			</Link>
		</Button>
	)
}
