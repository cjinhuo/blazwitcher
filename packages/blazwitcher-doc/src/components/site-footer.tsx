import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
const ProductLinkData = [
	{
		label: 'Download',
		cnLabel: '下载',
		href: 'https://github.com/cjinhuo/blazwitcher/raw/refs/heads/master/packages/blazwitcher-extension/build/chrome-mv3-prod.zip',
	},
	{
		label: 'Changelog',
		cnLabel: '更新日志',
		href: 'https://github.com/cjinhuo/blazwitcher/blob/master/packages/blazwitcher-extension/CHANGELOG.md',
	},
]
const ResourceLinkData = [
	{
		label: 'Personal Blog',
		cnLabel: '个人博客',
		href: 'https://cjinhuo.github.io/',
	},
]
export function SiteFooter() {
	const t = useTranslations('LandingPage')
	const locale = useLocale()
	return (
		<footer className='border-t border-border/40 bg-background'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12'>
				<div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4'>
					{/* Logo and Description */}
					<div className='space-y-4'>
						<Link href='/' className='flex items-center space-x-2'>
							<span className='font-bold'>Blazwitcher</span>
						</Link>
						<p className='text-sm text-muted-foreground'>{t('footer.description')}</p>
					</div>

					{/* Product Links */}
					<div className='space-y-4'>
						<h4 className='font-semibold'>{t('footer.product')}</h4>
						<ul className='space-y-3'>
							{ProductLinkData.map((item) => (
								<li key={item.label}>
									<Link
										href={item.href}
										target='_blank'
										rel='noopener noreferrer'
										className='text-sm text-muted-foreground hover:text-foreground transition-colors'
									>
										{locale === 'zh' ? item.cnLabel : item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources Links */}
					<div className='space-y-4'>
						<h4 className='font-semibold'>{t('footer.resources')}</h4>
						<ul className='space-y-3'>
							{ResourceLinkData.map((item) => (
								<li key={item.label}>
									<Link
										href={item.href}
										target='_blank'
										rel='noopener noreferrer'
										className='text-sm text-muted-foreground hover:text-foreground transition-colors'
									>
										{locale === 'zh' ? item.cnLabel : item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className='mt-12 border-t border-border/40 pt-8'>
					<div className='flex flex-col sm:flex-row justify-between items-center'>
						<p className='text-sm text-muted-foreground'>
							© {new Date().getFullYear()} Blazwitcher. All rights reserved.
						</p>
						<div className='flex items-center space-x-6 mt-4 sm:mt-0'>
							<Link
								href='https://github.com/cjinhuo/blazwitcher/blob/master/docs/privacy.md'
								target='_blank'
								rel='noopener noreferrer'
								className='text-sm text-muted-foreground hover:text-foreground transition-colors'
							>
								Privacy Policy
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
