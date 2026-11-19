import { languageUrls, siteUrl } from '@/lib/site'

export function StructuredData({ locale, description }: { locale: 'en' | 'zh'; description: string }) {
	const url = languageUrls[locale]
	const data = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'BlazWitcher',
		url,
		description,
		inLanguage: locale,
		applicationCategory: 'BrowserApplication',
		applicationSubCategory: 'Browser extension',
		operatingSystem: 'Chrome, Microsoft Edge',
		image: `${siteUrl}/880x440-radius.png`,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		author: { '@type': 'Organization', name: 'BlazWitcher Team', url: siteUrl },
	}
	return <script type='application/ld+json'>{JSON.stringify(data).replace(/</g, '\\u003c')}</script>
}
