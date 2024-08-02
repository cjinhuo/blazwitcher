import chromeIcon from "data-base64:~assets/chrome-icon.svg"
import { useMemo } from "react"
import BookmarkSvg from "react:~assets/bookmark.svg"
import HistorySvg from "react:~assets/history.svg"
import NewWindow from "react:~assets/new-window.svg"
import RightArrow from "react:~assets/right-arrow.svg"
import TabSvg from "react:~assets/tab.svg"
import styled from "styled-components"

import { type ListItemType } from "~shared/types"
import { isBookmarkItem, isTabItem } from "~shared/utils"

export const VISIBILITY_CLASS = "list-visibility"
const ContentContainer = styled.div`
  display: flex;
  padding: 0 5px;
  width: 100%;
`
export const IMAGE_CLASS = "image-container"
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
        onError={(e) => (e.currentTarget.src = chromeIcon)}
        width={20}
        height={20}></img>
    </ImageContainer>
  )
}

export const TITLE_CLASS = "title-text"
export const HOST_CLASS = "host-text"
export const SVG_CLASS = "svg-icon"
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
const TitleDiv = styled.div`
  font-size: 14px;
  color: var(--color-neutral-2);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const HostDiv = styled.div`
  font-size: 10px;
  height: 14px;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: var(--color-neutral-4);
`

const ActiveStatus = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: green;
`

const LabelContainer = styled.div`
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 30px;
`

const SVGDivContainer = styled.div`
  width: 16px;
  height: 16px;
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
const SvgTag = styled.div`
  height: 13px;
  padding: 2px;
  line-height: 9px;
  font-size: 10px;
  border-radius: 2px;
  background-color: var(--color-neutral-7);
  color: var(--color-neutral-2);
  margin-left: 4px;
`

const SvgContainer = ({
  children,
  content
}: {
  children: React.ReactNode
  content: string
}) => (
  <>
    <SVGDivContainer>
      <>{children}</>
    </SVGDivContainer>
    <SvgTag className={VISIBILITY_CLASS}>{content}</SvgTag>
  </>
)

const BookmarkLabel = () => {
  return (
    <LabelContainer>
      <SvgContainer content="Bookmark">
        <BookmarkSvg className={SVG_CLASS}></BookmarkSvg>
      </SvgContainer>
    </LabelContainer>
  )
}

const TabLabel = ({ active }: { active: boolean }) => {
  return (
    <LabelContainer>
      {active && <ActiveStatus></ActiveStatus>}
      <SvgContainer content="Tab">
        <TabSvg className={SVG_CLASS}></TabSvg>
      </SvgContainer>
    </LabelContainer>
  )
}

const HistoryLabel = () => (
  <LabelContainer>
    <SvgContainer content="History">
      <HistorySvg className={SVG_CLASS}></HistorySvg>
    </SvgContainer>
  </LabelContainer>
)

export const RenderTitle = ({ item }: { item: ListItemType }) => {
  const host = useMemo(() => {
    const urlObj = new URL(item.data.url)
    return urlObj.host
  }, [item.data.url])
  return (
    <TitleContainer>
      <TitleDiv className={TITLE_CLASS}>{item.data.title}</TitleDiv>
      <HostDiv className={HOST_CLASS}>
        <span>{host}</span>
        {isTabItem(item) ? (
          <TabLabel active={item.data.active}></TabLabel>
        ) : isBookmarkItem(item) ? (
          <BookmarkLabel></BookmarkLabel>
        ) : (
          <HistoryLabel></HistoryLabel>
        )}
        {/* <ActiveStatus></ActiveStatus> */}
      </HostDiv>
    </TitleContainer>
  )
}

const OperationContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const OperationLinkIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-9);
  svg {
    fill: var(--color-neutral-3);
  }
`

const RenderOperation = ({ item }: { item: ListItemType }) => {
  return (
    <OperationContainer className={VISIBILITY_CLASS}>
      <OperationLinkIcon>
        {isTabItem(item) ? <RightArrow></RightArrow> : <NewWindow></NewWindow>}
      </OperationLinkIcon>
    </OperationContainer>
  )
}

export const RenderItem = ({ item }: { item: ListItemType }) => {
  return (
    <ContentContainer>
      <RenderIcon iconUrl={item.data.favIconUrl} />
      <RenderTitle item={item}></RenderTitle>
      <RenderOperation item={item}></RenderOperation>
    </ContentContainer>
  )
}
