import styled from "styled-components"

import type { ListItemType } from "~shared/types"

export const HIGHLIGHT_TEXT_CLASS = "hg-text"
export const NORMAL_TEXT_CLASS = "nm-text"
const HighlightTextContainer = styled.div`
  display: flex;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;

  .${NORMAL_TEXT_CLASS} {
    color: var(--color-neutral-3);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .${HIGHLIGHT_TEXT_CLASS} {
    white-space: nowrap;
    color: var(--highlight-text);
    background-color: var(--highlight-bg);
    border-radius: 4px;
    padding: 0 2px;
  }
`
type PropsType = {
  item: ListItemType
}
export default function HighlightText({ item }: PropsType) {
  if (!item.data.hitRanges || !item.data.hitRanges.length) {
    return (
      <HighlightTextContainer>
        <div className={NORMAL_TEXT_CLASS}>{item.data.title}</div>
      </HighlightTextContainer>
    )
  }
  const { data } = item
  const id = data.id || Math.random().toString()
  const hitRanges = data.hitRanges.sort((a, b) => a[0] - b[0])
  const Renders = []
  let currentIndex = 0
  hitRanges.forEach(([start, end]) => {
    if (currentIndex < start) {
      Renders.push(
        <div
          className={NORMAL_TEXT_CLASS}
          key={`${id}-${currentIndex}-${start}`}>
          {/* replace with \u00A0 to avoid ignore space character by browser */}
          {data.title.slice(currentIndex, start).replace(/ /g, "\u00A0")}
        </div>
      )
    }
    Renders.push(
      <div className={HIGHLIGHT_TEXT_CLASS} key={`${id}-${start}-${end + 1}`}>
        {data.title.slice(start, end + 1).replace(/ /g, "\u00A0")}
      </div>
    )
    currentIndex = end + 1
  })
  if (currentIndex < data.title.length) {
    Renders.push(
      <div
        className={NORMAL_TEXT_CLASS}
        key={`${id}-${currentIndex}-${data.title.length}`}>
        {data.title
          .slice(currentIndex, data.title.length)
          .replace(/ /g, "\u00A0")}
      </div>
    )
  }
  return <HighlightTextContainer>{...Renders}</HighlightTextContainer>
}
