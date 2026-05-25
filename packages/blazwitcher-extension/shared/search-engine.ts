import { SEARCH_QUERY_PLACEHOLDER, type SearchEngineConfig } from './constants'
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

export const resolveSearchInput = (
	input: string,
	searchEngines: SearchEngineConfig[],
	defaultSearchEngineId: string,
	isUrl: (value: string) => boolean,
	toUrl: (value: string) => string
) => {
	const normalizedInput = input.trim()
	const searchEngine = searchEngines.find((engine) => engine.id === defaultSearchEngineId)
	return {
		openUrl: isUrl(normalizedInput) ? toUrl(normalizedInput) : undefined,
		searchEngine,
		searchUrl: searchEngine ? buildSearchUrl(normalizedInput, searchEngine.queryTemplate) : undefined,
	}
}
