import { faviconURL } from '~shared/favicon'
import { buildSearchUrl, getSearchEngineIconUrl } from '~shared/search-engine'
import { ItemType, type ListItemType } from '~shared/types'
import { isLikelyUrl, toNavigableUrl } from '~shared/utils'
import type { i18nFunction, SearchConfigAtomType } from '~sidepanel/atom'

export const buildSearchActionItems = (
	searchValue: string,
	searchConfig: SearchConfigAtomType,
	i18n: i18nFunction
): ListItemType<ItemType.SearchAction>[] => {
	const input = searchValue.trim()
	if (!input) return []

	const openUrl = isLikelyUrl(input) ? toNavigableUrl(input) : undefined
	const items: ListItemType<ItemType.SearchAction>[] = []
	if (openUrl) {
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: 'go-to-url',
				actionType: 'open',
				prefix: i18n('goToUrl'),
				value: openUrl,
				url: openUrl,
				favIconUrl: faviconURL(openUrl),
			},
		})
	}

	const engines = [...searchConfig.searchEngines].sort(
		(a, b) => Number(b.id === searchConfig.defaultSearchEngineId) - Number(a.id === searchConfig.defaultSearchEngineId)
	)
	for (const engine of engines) {
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: `search-${engine.id}`,
				actionType: 'search',
				prefix: i18n('searchWithEngine', engine.name),
				value: input,
				suffix: i18n('searchWithEngineSuffix', engine.name),
				url: buildSearchUrl(input, engine.queryTemplate),
				favIconUrl: getSearchEngineIconUrl(engine.queryTemplate) || '',
			},
		})
	}

	return items
}
