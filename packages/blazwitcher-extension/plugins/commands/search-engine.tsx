import QueryIcon from 'react:~assets/query.svg'
import { SearchEngineCommand } from '~plugins/ui/search-engine-command'
import type { CommandPlugin } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'

export const searchEnginePlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/se',
	description: i18n('searchEngineCommand'),
	icon: <QueryIcon width={24} height={24} />,
	render: (mainSearchValue?: string) => <SearchEngineCommand searchValue={mainSearchValue} />,
})
