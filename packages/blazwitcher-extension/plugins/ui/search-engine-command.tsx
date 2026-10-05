import { IconSearch } from '@douyinfe/semi-icons'
import { Empty } from '@douyinfe/semi-ui'
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

	if (!searchValue.trim() || searchItems.length === 0) {
		return (
			<Empty
				image={<IconSearch size='extra-large' style={{ color: 'var(--semi-color-text-2)' }} />}
				title={i18n(!searchValue.trim() ? 'searchEngineInputHint' : 'searchEngineNotConfigured')}
				description={!searchValue.trim() ? i18n('searchEngineKeyboardHint') : undefined}
				style={{ padding: 30 }}
			/>
		)
	}

	return <List list={searchItems} RenderItem={RenderSearchActionItem} handleItemClick={handleItemClick} />
}
