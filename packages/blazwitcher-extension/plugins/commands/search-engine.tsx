import QueryIcon from 'react:~assets/query.svg'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import type { CommandPlugin } from '~shared/types'
import { handleItemClick } from '~shared/utils'
import { i18nAtom, type i18nFunction, searchConfigAtom } from '~sidepanel/atom'
import List from '~sidepanel/list'
import { RenderSearchActionItem } from '~sidepanel/search-action-item'
import { buildSearchActionItems } from '~sidepanel/utils/buildSearchActionItems'

function SearchEngineCommand({ searchValue = '' }: { searchValue?: string }) {
	const searchConfig = useAtomValue(searchConfigAtom)
	const i18n = useAtomValue(i18nAtom)
	const searchItems = useMemo(
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

export const searchEnginePlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/se',
	description: i18n('searchEngineCommand'),
	icon: <QueryIcon width={24} height={24} />,
	render: (searchValue) => <SearchEngineCommand searchValue={searchValue} />,
})
