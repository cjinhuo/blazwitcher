import styled from 'styled-components'

import type { Matrix } from '~shared/types'

export const HIGHLIGHT_TEXT_CLASS = 'hg-text'
export const NORMAL_TEXT_CLASS = 'nm-text'
const HighlightTextContainer = styled.div`
  display: flex;
  max-width: 100%;
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
	content: string
	hitRanges?: Matrix
	style?: React.CSSProperties
	id?: string | number
}
export default function HighlightText({ content, hitRanges, id, style }: PropsType) {
	if (!hitRanges || !hitRanges.length) {
		return (
			<HighlightTextContainer style={style}>
				<div className={NORMAL_TEXT_CLASS}>{content}</div>
			</HighlightTextContainer>
		)
	}
	const uuid = id || Math.random().toString()
	const Renders = []
	let currentIndex = 0
	for (const [start, end] of hitRanges.sort((a, b) => a[0] - b[0])) {
		if (currentIndex < start) {
			Renders.push(
				<div className={NORMAL_TEXT_CLASS} key={`${uuid}-${currentIndex}-${start}`}>
					{/* replace with \u00A0 to avoid ignore space character by browser */}
					{content.slice(currentIndex, start).replace(/ /g, '\u00A0')}
				</div>
			)
		}
		Renders.push(
			<div className={HIGHLIGHT_TEXT_CLASS} key={`${uuid}-${start}-${end + 1}`}>
				{content.slice(start, end + 1).replace(/ /g, '\u00A0')}
			</div>
		)
		currentIndex = end + 1
	}
	if (currentIndex < content.length) {
		Renders.push(
			<div className={NORMAL_TEXT_CLASS} key={`${uuid}-${currentIndex}-${content.length}`}>
				{content.slice(currentIndex, content.length).replace(/ /g, '\u00A0')}
			</div>
		)
	}
	return <HighlightTextContainer style={style}>{...Renders}</HighlightTextContainer>
}
