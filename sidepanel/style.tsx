import Tooltip from "@douyinfe/semi-ui/lib/es/tooltip/index"
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

export const TooltipWrap = styled(Tooltip)`
  &.semi-tooltip-wrapper {
    padding: 0 2px;
    font-size: 12px;
    border-radius: 2px;
    background-color: var(--color-neutral-8);
    color: var(--color-neutral-2);
  }
`

const SvgContainer = ({
  children,
  content
}: {
  children: React.ReactNode
  content: string
}) => (
  <TooltipWrap
    content={content}
    showArrow={false}
    position="right"
    mouseEnterDelay={50}>
    <SVGDivContainer>
      <>{children}</>
    </SVGDivContainer>
  </TooltipWrap>
)

const BookmarkLabel = () => {
  return (
    <LabelContainer>
      <Tooltip content="Bookmark">
        <SvgContainer content="bookmark">
          <BookmarkSvg className={SVG_CLASS}></BookmarkSvg>
        </SvgContainer>
      </Tooltip>
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
    <SvgContainer content="history">
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
export const OPERATION_CLASS = "operation-container"
const RenderOperation = ({ item }: { item: ListItemType }) => {
  return (
    <OperationContainer className={OPERATION_CLASS}>
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
