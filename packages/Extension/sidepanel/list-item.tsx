import chromeIcon from 'data-base64:~assets/chrome-icon.svg'
import BookmarkSvg from 'react:~assets/bookmark.svg'
import HistorySvg from 'react:~assets/history.svg'
import TabSvg from 'react:~assets/tab.svg'
import styled from 'styled-components'

import { timeAgo } from '~shared/time'
import type { BookmarkItemType, HistoryItemType, ListItemType, TabItemType } from '~shared/types'
import { isBookmarkItem, isTabItem } from '~shared/utils'

import { useAtomValue } from 'jotai'
import {
	ContentContainer,
	type ContentContainerProps,
	IMAGE_CLASS,
	ImageContainer,
	InlineSvgWrapper,
	SVG_CLASS,
	SecondaryContainer,
	TitleContainer,
} from '~shared/common-styles'
import { i18nAtom } from '~sidepanel/atom'
import { useColorMap } from '~sidepanel/hooks/useTheme'
import HighlightText from './highlight-text'
import { RenderOperation } from './operation'

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

const TabGroup = styled.div<ContentContainerProps>`
	background-color: ${(props) => props.$colorMap[props.$tabGroup.color]};
	color: var(--color-neutral-10);
	height: 16px;
	line-height: 16px;
	padding: 0 4px;
	border-radius: 4px;
	font-size: 9px;
	font-weight: 500;
	max-width: 100px;
	white-space: nowrap;
	overflow: hidden;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		width: 15%;
		height: 100%;
		background: linear-gradient(to right, transparent, ${(props) => props.$colorMap[props.$tabGroup.color]});
	}
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
	font-size: 9px;
	border-radius: 2px;
	background-color: var(--color-neutral-8);
	color: var(--color-neutral-4);
	text-wrap: nowrap;
`

const TabLabel = ({ data }: { data: TabItemType }) => {
	const i18n = useAtomValue(i18nAtom)
	const colorMap = useColorMap()

	return (
		<LabelContainer>
			<InlineSvgWrapper title={i18n('tab')}>
				<TabSvg className={SVG_CLASS}></TabSvg>
			</InlineSvgWrapper>

			{data.tabGroup && (
				<TabGroup $colorMap={colorMap} $tabGroup={data.tabGroup}>
					{data.tabGroup.title}
				</TabGroup>
			)}
			{data.isShowType && <Tag>{i18n('tab')}</Tag>}
			{data.active && (
				<>
					<ActiveStatus></ActiveStatus>
					<Tag>{i18n('active')}</Tag>
				</>
			)}
			{data.active || (data.lastAccessed && <Tag>{timeAgo(data.lastAccessed, i18n)}</Tag>)}
		</LabelContainer>
	)
}

const HistoryLabel = ({ data }: { data: HistoryItemType }) => {
	const i18n = useAtomValue(i18nAtom)
	return (
		<LabelContainer>
			<InlineSvgWrapper title={i18n('history')}>
				<HistorySvg className={SVG_CLASS}></HistorySvg>
			</InlineSvgWrapper>
			{data.isShowType && <Tag>{i18n('history')}</Tag>}
			{data.lastVisitTime && <Tag>{timeAgo(data.lastVisitTime, i18n)}</Tag>}
		</LabelContainer>
	)
}

const BookmarkLabel = ({ data }: { data: BookmarkItemType }) => {
	const i18n = useAtomValue(i18nAtom)
	return (
		<LabelContainer>
			<InlineSvgWrapper title={i18n('bookmark')}>
				<BookmarkSvg className={SVG_CLASS}></BookmarkSvg>
			</InlineSvgWrapper>
			{data.isShowType && <Tag>{i18n('bookmark')}</Tag>}
			{data.folderName.trim().length !== 0 && <Tag>{data.folderName}</Tag>}
		</LabelContainer>
	)
}

export const RenderContent = ({ item }: { item: ListItemType }) => {
	const { data } = item
	return (
		<TitleContainer>
			<HighlightText source={data.title} hitRanges={data.titleHitRanges} id={String(data.id)} />
			<SecondaryContainer>
				<HighlightText
					source={data.host}
					hitRanges={data.hostHitRanges}
					containerStyle={{ fontSize: '10px', fontWeight: '400', minHeight: '16px', lineHeight: '16px' }}
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
	const colorMap = useColorMap()
	return (
		<ContentContainer $tabGroup={isTabItem(item) && item.data?.tabGroup} $colorMap={colorMap}>
			<RenderIcon iconUrl={item.data.favIconUrl} />
			<RenderContent item={item}></RenderContent>
			<RenderOperation item={item}></RenderOperation>
		</ContentContainer>
	)
}
