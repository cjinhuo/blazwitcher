import './sidepanel.css'

import { Empty, Layout } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_TOP_SUGGESTIONS_COUNT, LanguageType, MAIN_CONTENT_CLASS } from '~shared/constants'
import { handleItemClick, orderList, searchWithList, setDarkTheme, splitToGroup } from '~shared/utils'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import plugins from '~plugins'
import { matchPlugin } from '~plugins/helper'
import { RenderPluginItem, usePluginClickItem } from '~plugins/render-item'
import { ItemType, type ListItemType } from '~shared/types'
import { i18nAtom, languageAtom } from '~sidepanel/atom'
import Footer from './footer'
import useOriginalList from './hooks/useOriginalList'
import List from './list'
import { RenderItem as ListItemRenderItem } from './list-item'
import Search from './search'

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

export default function SidePanel() {
	const i18n = useAtomValue(i18nAtom)
	const setLanguage = useSetAtom(languageAtom)
	const originalList = useOriginalList()
	const [searchValue, setSearchValue] = useState('')
	const handlePluginItemClick = usePluginClickItem()

	useEffect(() => {
		setDarkTheme()
		navigator.language.toLowerCase().startsWith('zh') ? setLanguage(LanguageType.zh) : setLanguage(LanguageType.en)
	}, [setLanguage])

	const RenderList = useCallback(
		(list: ListItemType[], hasInput: boolean) => {
			const orderedList = orderList(list)
			let restList = orderedList
			const itemsWithDivide: ListItemType[] = []
			if (hasInput && orderedList.length > 0) {
				const topSuggestions = orderedList.slice(0, DEFAULT_TOP_SUGGESTIONS_COUNT).map((item) => {
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
				restList = orderedList.slice(DEFAULT_TOP_SUGGESTIONS_COUNT)
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
		[i18n]
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
			const [hitPlugin, mainSearchValue] = matchPlugin(plugins(i18n), searchValue)
			if (!hitPlugin)
				return (
					<List
						list={plugins(i18n) as any}
						handleItemClick={handlePluginItemClick as any}
						RenderItem={RenderPluginItem as any}
					/>
				)
			if (hitPlugin.render) {
				return hitPlugin.render()
			}
			realList = hitPlugin.dataProcessing(originalList)
			realSearchValue = mainSearchValue
		}

		const filteredList = searchWithList(realList, realSearchValue)
		return RenderList(filteredList, true)
	}, [searchValue, originalList, handlePluginItemClick, i18n, RenderList])

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
