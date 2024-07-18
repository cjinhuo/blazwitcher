import chromeIcon from "data-base64:~assets/chrome-icon.svg"
import { useMemo } from "react"
import BookmarkSvg from "react:~assets/bookmark.svg"
import TabSvg from "react:~assets/tab.svg"
import styled from "styled-components"

import {
  ItemType,
  type BookmarkItemType,
  type ListItemType,
  type TabItemType
} from "~shared/types"
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

const OperationContainer = styled.div`
  width: 40px;
  height: 40px;
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
  user-select: none;
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

const BookmarkLabel = () => {
  return (
    <LabelContainer>
      <BookmarkSvg className={SVG_CLASS}></BookmarkSvg>
    </LabelContainer>
  )
}

const TabLabel = ({ active }: { active: boolean }) => {
  return (
    <LabelContainer>
      {/* <Tooltip content="Opened Tab"> */}
      {active && <ActiveStatus></ActiveStatus>}
      <TabSvg className={SVG_CLASS}></TabSvg>
      {/* </Tooltip> */}
    </LabelContainer>
  )
}

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
        ) : (
          <BookmarkLabel></BookmarkLabel>
        )}
        {/* <ActiveStatus></ActiveStatus> */}
      </HostDiv>
    </TitleContainer>
  )
}

const RenderOperation = () => {
  return (
    <OperationContainer>
      {/* <Button type="secondary" icon={<IconCamera />} aria-label="截屏" /> */}
    </OperationContainer>
  )
}

export const RenderTab = ({ item }: { item: ListItemType }) => {
  return (
    <ContentContainer>
      <RenderIcon iconUrl={item.data.favIconUrl} />
      <RenderTitle item={item}></RenderTitle>
      <RenderOperation></RenderOperation>
    </ContentContainer>
  )
}

export const RenderBookmark = ({ item }: { item: ListItemType }) => {
  return (
    <ContentContainer>
      <RenderIcon iconUrl={item.data.favIconUrl} />
      <RenderTitle item={item}></RenderTitle>
      <RenderOperation></RenderOperation>
    </ContentContainer>
  )
}

export const RenderItem = ({ item }: { item: ListItemType }) => {
  if (isTabItem(item)) {
    return <RenderTab item={item} />
  } else if (isBookmarkItem(item)) {
    return <RenderBookmark item={item} />
  } else return <div>{item.data.title}</div>
}
