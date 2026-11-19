import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { languageUrls } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
	return routing.locales.map((locale) => ({
		url: languageUrls[locale],
		alternates: { languages: languageUrls },
	}))
}
