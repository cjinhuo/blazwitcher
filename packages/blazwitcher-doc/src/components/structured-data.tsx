import Script from 'next/script'

interface StructuredDataProps {
	locale: string
}

export function StructuredData({ locale }: StructuredDataProps) {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'BlazWitcher',
		alternateName: ['Pinyin Search Engine', '拼音搜索引擎'],
		description:
			locale === 'zh'
				? 'BlazWitcher 是一款强大的 Chrome 浏览器扩展，提供先进的拼音搜索功能。支持标签页、书签和历史记录的模糊拼音搜索，文本搜索引擎和 AI 智能分组。'
				: 'BlazWitcher is a powerful Chrome extension with advanced pinyin search capabilities. Search tabs, bookmarks, and history with fuzzy pinyin search, text search engine, and AI grouping.',
		url: 'https://blazwitcher.vercel.app',
		applicationCategory: 'BrowserApplication',
		operatingSystem: 'Chrome, Edge, Firefox',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		author: {
			'@type': 'Organization',
			name: 'BlazWitcher Team',
			url: 'https://blazwitcher.vercel.app',
		},
		publisher: {
			'@type': 'Organization',
			name: 'BlazWitcher',
			url: 'https://blazwitcher.vercel.app',
		},
		keywords: [
			'pinyin search',
			'blazwitcher',
			'text search engine',
			'拼音模糊搜索',
			'chrome extension',
			'browser extension',
			'tab search',
			'bookmark search',
			'fuzzy search',
			'chinese search',
			'pinyin fuzzy search',
			'browser productivity',
			'tab management',
		],
		featureList: [
			'Fuzzy Pinyin Search',
			'AI-powered Tab Grouping',
			'Global Search (tabs, bookmarks, history)',
			'Full Keyboard Operation',
			'Multi-language Support',
		],
		screenshot: 'https://blazwitcher.vercel.app/icon.svg',
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.8',
			ratingCount: '1000',
		},
	}

	const websiteStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'BlazWitcher',
		url: 'https://blazwitcher.vercel.app',
		description:
			locale === 'zh'
				? '拼音搜索引擎 Chrome 扩展官网'
				: 'Official website of BlazWitcher - Pinyin Search Engine Chrome Extension',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://blazwitcher.vercel.app/search?q={search_term_string}',
			},
			'query-input': 'required name=search_term_string',
		},
		inLanguage: [locale === 'zh' ? 'zh-CN' : 'en-US'],
		publisher: {
			'@type': 'Organization',
			name: 'BlazWitcher',
			url: 'https://blazwitcher.vercel.app',
		},
	}

	return (
		<>
			<Script id='software-application-structured-data' type='application/ld+json'>
				{JSON.stringify(structuredData)}
			</Script>
			<Script id='website-structured-data' type='application/ld+json'>
				{JSON.stringify(websiteStructuredData)}
			</Script>
		</>
	)
}
