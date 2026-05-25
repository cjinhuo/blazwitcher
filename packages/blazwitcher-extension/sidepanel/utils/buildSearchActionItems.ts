import { faviconURL } from '~shared/favicon'
import { getSearchEngineIconUrl, resolveSearchInput } from '~shared/search-engine'
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

	const resolvedSearchInput = resolveSearchInput(
		input,
		searchConfig.searchEngines,
		searchConfig.defaultSearchEngineId,
		isLikelyUrl,
		toNavigableUrl
	)
	const items: ListItemType<ItemType.SearchAction>[] = []
	if (resolvedSearchInput.openUrl) {
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: 'go-to-url',
				actionType: 'open',
				prefix: i18n('goToUrl'),
				value: resolvedSearchInput.openUrl,
				url: resolvedSearchInput.openUrl,
				favIconUrl: faviconURL(resolvedSearchInput.openUrl),
			},
		})
	}

	if (resolvedSearchInput.searchEngine && resolvedSearchInput.searchUrl) {
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: `search-${resolvedSearchInput.searchEngine.id}`,
				actionType: 'search',
				prefix: i18n('searchWithEngine', resolvedSearchInput.searchEngine.name),
				value: input,
				suffix: i18n('searchWithEngineSuffix', resolvedSearchInput.searchEngine.name),
				url: resolvedSearchInput.searchUrl,
				favIconUrl: getSearchEngineIconUrl(resolvedSearchInput.searchEngine.queryTemplate) || '',
			},
		})
	}

	return items
}
