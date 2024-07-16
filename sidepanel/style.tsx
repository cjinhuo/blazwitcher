import { Button } from "@douyinfe/semi-ui"
import chromeIcon from "data-base64:~assets/chrome-icon.svg"
import { useMemo } from "react"
import styled from "styled-components"

import type { BookmarkItemType, ListItemType, TabItemType } from "~shared/types"
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
const TitleContainer = styled.div`
  height: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 4px;
  overflow: hidden;
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
  color: var(--color-neutral-4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
export const RenderTitle = ({ title, url }: { title: string; url: string }) => {
  const host = useMemo(() => {
    const urlObj = new URL(url)
    return urlObj.host
  }, [url])
  return (
    <TitleContainer>
      <TitleDiv className={TITLE_CLASS}>{title}</TitleDiv>
      <HostDiv className={HOST_CLASS}>{host}</HostDiv>
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

export const RenderTab = ({ data }: { data: TabItemType }) => {
  return (
    <ContentContainer>
      <RenderIcon iconUrl={data.favIconUrl} />
      <RenderTitle title={data.title} url={data.url}></RenderTitle>
      <RenderOperation></RenderOperation>
    </ContentContainer>
  )
}

export const RenderBookmark = ({ data }: { data: BookmarkItemType }) => {
  return (
    <ContentContainer>
      <RenderIcon iconUrl={data.favIconUrl} />
      <RenderTitle title={data.title} url={data.url}></RenderTitle>
      <RenderOperation></RenderOperation>
    </ContentContainer>
  )
}

export const RenderItem = ({ item }: { item: ListItemType }) => {
  if (isTabItem(item)) {
    return <RenderTab data={item.data} />
  } else if (isBookmarkItem(item)) {
    return <RenderBookmark data={item.data} />
  } else return <div>{item.data.title}</div>
}
