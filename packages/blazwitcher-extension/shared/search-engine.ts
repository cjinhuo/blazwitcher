import { SEARCH_QUERY_PLACEHOLDER } from './constants'
import { faviconURL } from './favicon'

export const buildSearchUrl = (query: string, queryTemplate: string) => {
	return queryTemplate.trim().replaceAll(SEARCH_QUERY_PLACEHOLDER, encodeURIComponent(query.trim()))
}

export const parseSearchEngineQueryTemplate = (queryTemplate: string) => {
	const template = queryTemplate.trim()
	if (!template.includes(SEARCH_QUERY_PLACEHOLDER)) return undefined
	try {
		const url = new URL(template.replaceAll(SEARCH_QUERY_PLACEHOLDER, 'blazwitcher'))
		if (!['http:', 'https:'].includes(url.protocol)) return undefined
		return url
	} catch {
		return undefined
	}
}

export const isValidSearchEngineQueryTemplate = (queryTemplate: string) => {
	return !!parseSearchEngineQueryTemplate(queryTemplate)
}

export const getSearchEngineIconUrl = (queryTemplate: string) => {
	const url = parseSearchEngineQueryTemplate(queryTemplate)
	return url ? faviconURL(url.origin) : undefined
}
