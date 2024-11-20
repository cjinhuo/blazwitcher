import './sidepanel.css'

import { Layout } from '@douyinfe/semi-ui'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
	DEFAULT_BOOKMARK_DISPLAY_COUNT,
	DEFAULT_HISTORY_DISPLAY_COUNT,
	DEFAULT_STRICTNESS_COEFFICIENT,
	MAIN_CONTENT_CLASS,
	MAIN_WINDOW,
} from '~shared/constants'
import type { ItemType, ListItemType } from '~shared/types'
import {
	isBookmarkItem,
	isDarkMode,
	isHistoryItem,
	isTabItem,
	setDarkTheme,
	splitCompositeHitRanges,
} from '~shared/utils'

import {
	type Matrix,
	isStrictnessSatisfied,
	mergeSpacesWithRanges,
	searchSentenceByBoundaryMapping,
} from 'text-search-engine'
import Footer from './footer'
import useOriginalList from './hooks/useOriginalList'
import List from './list'
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

const orderList = (list: ListItemType[]) => {
	const tabs: ListItemType<ItemType.Tab>[] = []
	const bookmarks: ListItemType<ItemType.Bookmark>[] = []
	const histories: ListItemType<ItemType.History>[] = []
	const set = new Set()
	for (const item of list) {
		const { title, url } = item.data
		const hasSameItemInTabs = () => {
			if (set.has(title) || (url && set.has(url))) {
				return true
			}
			set.add(title)
			set.add(url)
			return false
		}

		if (isTabItem(item)) {
			tabs.push(item)
			set.add(title)
			set.add(url)
		} else if (isBookmarkItem(item) && !hasSameItemInTabs()) {
			bookmarks.push(item)
		} else if (isHistoryItem(item) && !hasSameItemInTabs()) {
			histories.push(item)
		}
	}
	const compareForLastAccess = (a: ListItemType<ItemType.Tab>, b: ListItemType<ItemType.Tab>) =>
		a.data.lastAccessed ? b.data.lastAccessed - a.data.lastAccessed : -1

	const compareForLastVisitTime = (a: ListItemType<ItemType.History>, b: ListItemType<ItemType.History>) =>
		a.data.lastVisitTime ? b.data.lastVisitTime - a.data.lastVisitTime : -1

	const compareForHitRangeLength = (a: ListItemType, b: ListItemType) => {
		if (a.data.compositeHitRanges && b.data.compositeHitRanges) {
			return a.data.compositeHitRanges.length - b.data.compositeHitRanges.length
		}
		return 0
	}

	const compareForActiveStatus = (a: ListItemType<ItemType.Tab>, _b: ListItemType<ItemType.Tab>) =>
		a.data.active ? -1 : 1

	return [
		...tabs
			.filter((item) => !item.data.url.includes(chrome.runtime.id))
			.toSorted(compareForLastAccess)
			.toSorted(compareForHitRangeLength)
			.toSorted(compareForActiveStatus),
		...histories
			.toSorted(compareForLastVisitTime)
			.toSorted(compareForHitRangeLength)
			.slice(0, DEFAULT_HISTORY_DISPLAY_COUNT),
		...bookmarks.toSorted(compareForHitRangeLength).slice(0, DEFAULT_BOOKMARK_DISPLAY_COUNT),
	].toSorted(compareForHitRangeLength)
}

export default function SidePanel() {
	const originalList = useOriginalList()
	const [searchValue, setSearchValue] = useState('')

	useEffect(() => {
		setDarkTheme()
	}, [])

	const RenderList = useMemo(() => {
		let filteredList = originalList
		if (searchValue.trim() !== '') {
			filteredList = originalList.reduce<ListItemType[]>((acc, item) => {
				let hitRanges: Matrix | undefined
				hitRanges = searchSentenceByBoundaryMapping(item.data.compositeBoundaryMapping, searchValue)
				if (hitRanges) {
					const mergedHitRanges = mergeSpacesWithRanges(item.data.compositeSource, hitRanges)
					if (isStrictnessSatisfied(DEFAULT_STRICTNESS_COEFFICIENT, searchValue, mergedHitRanges)) {
						const [titleHitRanges, hostHitRanges] = splitCompositeHitRanges(mergedHitRanges, [
							item.data.title.length,
							item.data.host.length,
						])
						acc.push({
							...item,
							data: { ...item.data, compositeHitRanges: mergedHitRanges, titleHitRanges, hostHitRanges },
						})
					}
				}
				return acc
			}, [])
		}
		return <List list={orderList(filteredList)}></List>
	}, [searchValue, originalList])

	const handleSearch = (value: string) => setSearchValue(value)

	return (
		<Container>
			<Header style={{ flex: '0 0 50px' }}>
				<Search onSearch={handleSearch}></Search>
			</Header>
			<ContentWrapper className={MAIN_CONTENT_CLASS}>{RenderList}</ContentWrapper>
			<Footer />
		</Container>
	)
}
