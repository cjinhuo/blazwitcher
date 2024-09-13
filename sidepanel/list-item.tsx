import chromeIcon from "data-base64:~assets/chrome-icon.svg"
import { useMemo } from "react"
import BookmarkSvg from "react:~assets/bookmark.svg"
import DeleteIcon from "react:~assets/delete.svg"
import FindIcon from "react:~assets/find.svg"
import CloseIcon from "react:~assets/close.svg"
import HistorySvg from "react:~assets/history.svg"
import NewWindow from "react:~assets/new-window.svg"
import RightArrow from "react:~assets/right-arrow.svg"
import TabSvg from "react:~assets/tab.svg"
import styled from "styled-components"

import { timeAgo } from '~shared/time'
import type { BookmarkItemType, HistoryItemType, ListItemType, TabItemType } from '~shared/types'
import { isBookmarkItem, isTabItem } from '~shared/utils'

import HighlightText from './highlight-text'

export const VISIBILITY_CLASS = 'list-visibility'
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

// export const TooltipWrap = styled(Tooltip)`
//   &.semi-tooltip-wrapper {
//     padding: 0 2px;
//     font-size: 12px;
//     border-radius: 2px;
//     background-color: var(--color-neutral-8);
//     color: var(--color-neutral-2);
//   }
// `
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
	const host = useMemo(() => {
		const urlObj = new URL(data.url)
		return urlObj.host
	}, [data.url])
	return (
		<TitleContainer>
			<HighlightText source={data.title} hitRanges={data.hitRanges} id={String(data.id)} />
			<SecondaryContainer>
				<HighlightText source={host} containerStyle={{ fontSize: '10px', fontWeight: '400' }} />
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

const OperationContainer = styled.div`
  /* width: 40px; */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const OprationButtonWrapper = styled.div`
  padding: 0 8px;
  margin-right: 16px;
  width: 96px;
  height: 36px;
  display: flex;
  justify-content: flex-end;
  gap:18px;
  align-items: center;

  .btns {
    width: 18px;
    height: 18px;
    /* background-color: var(--color-neutral-9); */
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      cursor: pointer;
      transform: scale(1.08);
      opacity: 0.88;
    }
    svg {
      fill: #fff;
    }
  }
`
// const OperationLinkIcon = styled.div`
//   width: 36px;
//   height: 36px;
//   border-radius: 4px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-color: var(--color-neutral-9);
//   svg {
//     fill: var(--color-neutral-3);
//     width: 20px;
//   }
// `

const RenderOperation = ({ item }: { item: ListItemType }) => {
  return (
    <OperationContainer className={VISIBILITY_CLASS}>
      <OprationButtonWrapper>
        {
          <>
            <div className="btns" title="跳转">
              <NewWindow data-name="linkTo"></NewWindow>
            </div>
            {isBookmarkItem(item) ? (
              <div className="btns" title="查找">
                <FindIcon data-name="find"></FindIcon>
              </div>
            ) : null}
            {!isTabItem(item) ? (
              <div className="btns" title="删除">
                <DeleteIcon data-name="remove"></DeleteIcon>
              </div>
            ) : (
              <div className="btns" title="关闭">
                <CloseIcon data-name="close"></CloseIcon>
              </div>
            )}
          </>
        }
      </OprationButtonWrapper>
      {/* <OperationLinkIcon>{isTabItem(item) ? <RightArrow></RightArrow> : <NewWindow></NewWindow>}</OperationLinkIcon> */}
    </OperationContainer>
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
