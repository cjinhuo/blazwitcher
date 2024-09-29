import chromeIcon from 'data-base64:~assets/chrome-icon.svg'
import BookmarkSvg from 'react:~assets/bookmark.svg'
import HistorySvg from 'react:~assets/history.svg'
import TabSvg from 'react:~assets/tab.svg'
import { useMemo } from 'react'
import styled from 'styled-components'

import { timeAgo } from '~shared/time'
import type { BookmarkItemType, HistoryItemType, ListItemType, TabItemType } from '~shared/types'
import { isBookmarkItem, isTabItem } from '~shared/utils'

import HighlightText from './highlight-text'
import { RenderOperation } from './operation'

const ContentContainer = styled.div`
  display: flex;
  padding: 0 5px;
  width: 100%;
`
export const IMAGE_CLASS = 'image-container'
const ImageContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-8);
`

export const RenderIcon = ({ iconUrl }: { iconUrl: string }) => {
	return (
		<ImageContainer className={IMAGE_CLASS}>
			<img
				src={iconUrl || chromeIcon}
				onError={(e) => {
					e.currentTarget.src = chromeIcon
				}}
				width={20}
				height={20}
				alt='icon'
			></img>
		</ImageContainer>
	)
}

export const HOST_CLASS = 'host-text'
export const SVG_CLASS = 'svg-icon'
const TitleContainer = styled.div`
  height: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 4px;
  overflow: hidden;
  /* user-select: none; */
`

const SecondaryContainer = styled.div`
  font-size: 10px;
  height: 20px;
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: var(--color-neutral-4);
`

const ActiveStatus = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #0bc40b;
`

const LabelContainer = styled.div`
  margin-left: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const Tag = styled.div`
  padding: 0 2px;
  line-height: 14px;
  /* 比如 domain 少一个像素 */
  font-size: 9px;
  border-radius: 2px;
  background-color: var(--color-neutral-8);
  /* 字体颜色比 title 少一个级*/
  color: var(--color-neutral-4);
  text-wrap: nowrap;
`

const BookmarkLabel = ({ data }: { data: BookmarkItemType }) => {
	return (
		<LabelContainer>
			<BookmarkSvg className={SVG_CLASS}></BookmarkSvg>
			{data.folderName.trim().length !== 0 && <Tag>{data.folderName}</Tag>}
		</LabelContainer>
	)
}

const TabLabel = ({ data }: { data: TabItemType }) => {
	return (
		<LabelContainer>
			<TabSvg className={SVG_CLASS}></TabSvg>
			{data.active && (
				<>
					<ActiveStatus></ActiveStatus>
					<Tag>Active</Tag>
				</>
			)}
			{data.active || (data.lastAccessed && <Tag>{timeAgo(data.lastAccessed)}</Tag>)}
		</LabelContainer>
	)
}

const HistoryLabel = ({ data }: { data: HistoryItemType }) => {
	return (
		<LabelContainer>
			<HistorySvg className={SVG_CLASS}></HistorySvg>
			{data.lastVisitTime && <Tag>{timeAgo(data.lastVisitTime)}</Tag>}
		</LabelContainer>
	)
}

export const RenderContent = ({ item }: { item: ListItemType }) => {
	const { data } = item
	return (
		<TitleContainer>
			<HighlightText source={data.title} hitRanges={data.hitRanges} id={String(data.id)} />
			<SecondaryContainer>
				<HighlightText
					source={data.host}
					hitRanges={data.hostHitRanges}
					containerStyle={{ fontSize: '10px', fontWeight: '400' }}
				/>
				{isTabItem(item) ? (
					<TabLabel data={item.data}></TabLabel>
				) : isBookmarkItem(item) ? (
					<BookmarkLabel data={item.data}></BookmarkLabel>
				) : (
					<HistoryLabel data={item.data as HistoryItemType}></HistoryLabel>
				)}
			</SecondaryContainer>
		</TitleContainer>
	)
}

export const RenderItem = ({ item }: { item: ListItemType }) => {
	return (
		<ContentContainer>
			<RenderIcon iconUrl={item.data.favIconUrl} />
			<RenderContent item={item}></RenderContent>
			<RenderOperation item={item}></RenderOperation>
		</ContentContainer>
	)
}
