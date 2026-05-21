import './sidepanel.css'

import { Empty, Layout } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import plugins, { matchPlugin } from '~plugins'
import { RenderPluginItem, usePluginClickItem } from '~plugins/ui/render-item'
import { MAIN_CONTENT_CLASS } from '~shared/constants'
import { faviconURL } from '~shared/favicon'
import { buildSearchUrl, getSearchEngineIconUrl } from '~shared/search-engine'
import { ItemType, type ListItemType } from '~shared/types'
import {
	createTabWithUrl,
	handleItemClick,
	isLikelyUrl,
	orderList,
	searchWithList,
	splitToGroup,
	toNavigableUrl,
} from '~shared/utils'
import { i18nAtom, type i18nFunction, type SearchConfigAtomType, searchConfigAtom } from '~sidepanel/atom'
import useOriginalList from '~sidepanel/hooks/useOriginalList'
import { useTheme } from '~sidepanel/hooks/useTheme'
import Footer from './footer'
import { useEscapeKey } from './hooks/useEscapeKey'
import { useLanguage } from './hooks/useLanguage'
import { usePerformanceReport } from './hooks/usePerformanceReport'
import List from './list'
import { RenderItem as ListItemRenderItem } from './list-item'
import Search from './search'
import { RenderSearchActionItem } from './search-action-item'
import { startup } from './utils/startup'

const { Header, Content } = Layout
const Container = styled(Layout)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
const ContentWrapper = styled(Content)`
  flex: 1;
  overflow-y: scroll;
  padding: 0;
`

startup()

const normalizeSearchValue = (value: string) => {
	const trimmedValue = value.trim()
	if (trimmedValue.startsWith('、')) {
		return `/${trimmedValue.slice(1)}`
	}
	return trimmedValue
}

const buildSearchActionItems = (
	searchValue: string,
	searchConfig: SearchConfigAtomType,
	i18n: i18nFunction
): ListItemType<ItemType.SearchAction>[] => {
	const input = searchValue.trim()
	if (!input) return []

	const items: ListItemType<ItemType.SearchAction>[] = []
	if (isLikelyUrl(input)) {
		const url = toNavigableUrl(input)
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: 'go-to-url',
				actionType: 'open',
				prefix: i18n('goToUrl'),
				value: url,
				url,
				favIconUrl: faviconURL(url),
			},
		})
	}

	const searchEngine = searchConfig.searchEngines.find((engine) => engine.id === searchConfig.defaultSearchEngineId)
	if (searchEngine) {
		items.push({
			itemType: ItemType.SearchAction,
			data: {
				id: `search-${searchEngine.id}`,
				actionType: 'search',
				prefix: i18n('searchWithEngine', searchEngine.name),
				value: input,
				suffix: i18n('searchWithEngineSuffix', searchEngine.name),
				url: buildSearchUrl(input, searchEngine.queryTemplate),
				favIconUrl: getSearchEngineIconUrl(searchEngine.queryTemplate) || '',
			},
		})
	}

	return items
}

export default function SidePanel() {
	useTheme()
	useLanguage()
	useEscapeKey()

	const originalList = useOriginalList()

	usePerformanceReport(originalList.length)

	const i18n = useAtomValue(i18nAtom)
	const searchConfig = useAtomValue(searchConfigAtom)
	const [searchValue, setSearchValue] = useState('')

	const handlePluginItemClick = usePluginClickItem()
	const handleSearchActionClick = useCallback((item: ListItemType) => {
		if (item.itemType === ItemType.SearchAction) {
			void createTabWithUrl(item.data.url)
		}
	}, [])

	const RenderList = useCallback(
		(list: ListItemType[], hasInput: boolean) => {
			const orderedList = orderList(list, searchConfig)
			let restList = orderedList
			const itemsWithDivide: ListItemType[] = []
			if (hasInput && orderedList.length > 0) {
				const topSuggestions = orderedList.slice(0, searchConfig.topSuggestionsCount).map((item) => {
					item.data.isShowType = true
					return item
				})
				itemsWithDivide.push(
					...[
						{
							itemType: ItemType.Divide,
							data: {
								name: i18n('topSuggestions'),
							},
						},
						...topSuggestions,
					]
				)
				restList = orderedList.slice(searchConfig.topSuggestionsCount)
			}
			const { tabs, bookmarks, histories } = splitToGroup(restList)
			itemsWithDivide.push(
				// Tabs section
				...(tabs.length > 0 ? [{ itemType: ItemType.Divide, data: { name: i18n('openedTabs') } }, ...tabs] : []),
				// History section
				...(histories.length > 0
					? [{ itemType: ItemType.Divide, data: { name: i18n('recentHistories') } }, ...histories]
					: []),
				// Bookmarks section
				...(bookmarks.length > 0
					? [{ itemType: ItemType.Divide, data: { name: i18n('bookmarks') } }, ...bookmarks]
					: [])
			)
			// RenderItem 如果使用函数，会导致每次渲染都会重新创建一个新的函数，从而导致性能问题
			return (
				<List
					list={itemsWithDivide}
					RenderItem={ListItemRenderItem}
					handleItemClick={handleItemClick}
					searchValue={searchValue}
				/>
			)
		},
		[i18n, searchConfig, searchValue]
	)

	const RenderContent = useMemo(() => {
		if (originalList.length === 0) {
			return <Empty description={''} />
		}
		if (searchValue === '') {
			return RenderList(originalList, false)
		}

		let realSearchValue = searchValue.toLowerCase()
		let realList = originalList

		// 插件匹配
		if (searchValue.startsWith('/')) {
			const [hitPlugin, pluginList, mainSearchValue] = matchPlugin(plugins(i18n), searchValue.toLowerCase())
			if (!hitPlugin || hitPlugin?.action)
				return (
					<List
						list={pluginList}
						handleItemClick={handlePluginItemClick}
						RenderItem={RenderPluginItem}
						searchValue={searchValue}
					/>
				)
			if (hitPlugin.render) {
				return hitPlugin.render(mainSearchValue)
			}
			if (hitPlugin.dataProcessing) {
				realList = hitPlugin.dataProcessing(originalList)
				realSearchValue = mainSearchValue.toLowerCase()
			}
		}

		const filteredList = searchWithList(realList, realSearchValue, searchConfig)
		if (realSearchValue && filteredList.length === 0) {
			const searchActionItems = buildSearchActionItems(searchValue, searchConfig, i18n)
			if (searchActionItems.length > 0) {
				return (
					<List
						list={[{ itemType: ItemType.Divide, data: { name: i18n('topSuggestions') } }, ...searchActionItems]}
						RenderItem={RenderSearchActionItem}
						handleItemClick={handleSearchActionClick}
						searchValue={searchValue}
					/>
				)
			}
		}
		return RenderList(filteredList, realSearchValue !== '')
	}, [searchValue, originalList, handlePluginItemClick, i18n, RenderList, searchConfig, handleSearchActionClick])

	const handleSearch = useCallback((value: string) => {
		setSearchValue(normalizeSearchValue(value))
	}, [])

	return (
		<Container>
			<Header style={{ flex: '0 0 50px' }}>
				<Search onSearch={handleSearch}></Search>
			</Header>
			<ContentWrapper className={MAIN_CONTENT_CLASS}>{RenderContent}</ContentWrapper>
			<Footer />
		</Container>
	)
}
