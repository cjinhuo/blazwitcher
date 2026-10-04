import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ItemType, type ListItemType } from '~shared/types'
import { handleItemClick } from '~shared/utils'
import { i18nAtom, searchConfigAtom } from '~sidepanel/atom'
import List from '~sidepanel/list'
import { RenderSearchActionItem } from '~sidepanel/search-action-item'
import { buildSearchActionItems } from '~sidepanel/utils/buildSearchActionItems'

interface SearchEngineCommandProps {
	searchValue?: string
}

export function SearchEngineCommand({ searchValue = '' }: SearchEngineCommandProps) {
	const searchConfig = useAtomValue(searchConfigAtom)
	const i18n = useAtomValue(i18nAtom)

	const searchItems = useMemo<ListItemType<ItemType.SearchAction>[]>(
		() => buildSearchActionItems(searchValue, searchConfig, i18n).filter((item) => item.data.actionType === 'search'),
		[searchConfig, searchValue, i18n]
	)

	return (
		<List
			list={searchItems}
			RenderItem={RenderSearchActionItem}
			handleItemClick={handleItemClick}
			emptyDescription={!searchValue.trim() ? i18n('searchEngineInputHint') : undefined}
		/>
	)
}
