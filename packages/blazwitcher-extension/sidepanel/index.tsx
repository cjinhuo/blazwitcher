import './sidepanel.css'

import { Empty, Layout } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import plugins, { matchPlugin } from '~plugins'
import { RenderPluginItem, usePluginClickItem } from '~plugins/ui/render-item'
import { MAIN_CONTENT_CLASS } from '~shared/constants'
import { ItemType, type ListItemType } from '~shared/types'
import { handleItemClick, orderList, searchWithList, splitToGroup } from '~shared/utils'
import { i18nAtom, searchConfigAtom } from '~sidepanel/atom'
import useOriginalList from '~sidepanel/hooks/useOriginalList'
import { useTheme } from '~sidepanel/hooks/useTheme'
import Footer from './footer'
import { useEscapeKey } from './hooks/useEscapeKey'
import { useLanguage } from './hooks/useLanguage'
import { usePerformanceReport } from './hooks/usePerformanceReport'
import List from './list'
import { RenderItem as ListItemRenderItem } from './list-item'
import Search from './search'
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
			return <List list={itemsWithDivide} RenderItem={ListItemRenderItem} handleItemClick={handleItemClick} />
		},
		[i18n, searchConfig]
	)

	const RenderContent = useMemo(() => {
		if (originalList.length === 0) {
			return <Empty description={''} />
		}
		if (searchValue === '') {
			return RenderList(originalList, false)
		}

		let realSearchValue = searchValue
		let realList = originalList

		// 插件匹配
		if (searchValue.startsWith('/')) {
			const [hitPlugin, pluginList, mainSearchValue] = matchPlugin(plugins(i18n), searchValue)
			if (!hitPlugin || hitPlugin?.action)
				return <List list={pluginList} handleItemClick={handlePluginItemClick} RenderItem={RenderPluginItem} />
			if (hitPlugin.render) {
				return hitPlugin.render(mainSearchValue)
			}
			if (hitPlugin.dataProcessing) {
				realList = hitPlugin.dataProcessing(originalList)
				realSearchValue = mainSearchValue
			}
		}

		const filteredList = searchWithList(realList, realSearchValue, searchConfig)
		return RenderList(filteredList, realSearchValue !== '')
	}, [searchValue, originalList, handlePluginItemClick, i18n, RenderList, searchConfig])

	// 会影响小部分匹配，比如 ab c，输入 ab 加上一个空格，理论上应该匹配 [ab ]，但现在会被 trim 掉，无伤大雅
	const handleSearch = useCallback((value: string) => {
		setSearchValue(value.trim())
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
