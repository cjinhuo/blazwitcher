import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://blazwitcher.vercel.app'

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
			alternates: {
				languages: {
					en: `${baseUrl}/en`,
					zh: `${baseUrl}/zh`,
				},
			},
		},
		{
			url: `${baseUrl}/en`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/zh`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
	]
}
