import styled from 'styled-components'
import { HighlightClasses } from 'text-search-engine/react'
import type { ColorTheme } from './types'

export interface ContentContainerProps {
	$tabGroup?: chrome.tabGroups.TabGroup | null
	$colorMap?: ColorTheme
}

export const ContentContainer = styled.div<ContentContainerProps>`
  display: flex;
  padding: 5px;
  width: 100%;
	height: 50px;
	border-radius: 6px;
  border-left: ${(props) => (props.$tabGroup ? `4px solid ${props.$colorMap[props.$tabGroup.color]}` : 'none')};
`
export const IMAGE_CLASS = 'image-container'
export const ImageContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-8);
`

export const SecondaryContainer = styled.div`
  font-size: 10px;
  height: 20px;
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: var(--color-neutral-4);
`

export const HOST_CLASS = 'host-text'
export const SVG_CLASS = 'svg-icon'
export const TitleContainer = styled.div`
  height: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 4px;
  overflow: hidden;
  /* user-select: none; */
`

export const HIGHLIGHT_TEXT_CLASS = HighlightClasses.highlight
export const NORMAL_TEXT_CLASS = HighlightClasses.normal

export const InlineSvgWrapper = styled.div`
  width: 16px;
  height: 16px;
`
