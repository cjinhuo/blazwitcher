import GithubSvg from 'react:~assets/github.svg'
import IssueSvg from 'react:~assets/issue.svg'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { PopoverWrapper } from '~shared/common-styles'
import { GITHUB_ISSUE_URL, GITHUB_URL } from '~shared/constants'
import { createTabWithUrl } from '~shared/utils'
import { i18nAtom } from '../atom'

const SvgWithStrokeStyle = styled.button`
  cursor: pointer;
  display: flex;
	padding: 3px 4px;
	border-radius: 4px;
	border: none;
	background: transparent;
  > svg {
    stroke: var(--color-neutral-5);
    stroke-width: 3px;
  }
  &:hover {
		background-color: var(--semi-color-fill-0);
    > svg {
      stroke: var(--color-neutral-3);
    }
  }
	&:active {
		background-color: var(--semi-color-fill-1);
	}
`

const SvgWithFileStyle = styled.div`
  cursor: pointer;
	padding: 3px 4px;
	border-radius: 4px;
	border: none;
	background: transparent;
  display: flex;
  > svg {
    fill: var(--color-neutral-5);
  }
  &:hover {
		background-color: var(--semi-color-fill-0);
    > svg {
      fill: var(--color-neutral-3);
    }
  }
	&:active {
		background-color: var(--semi-color-fill-1);
	}
`

const LeftIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export default function LeftIcon() {
	const i18n = useAtomValue(i18nAtom)

	return (
		<LeftIconContainer>
			<PopoverWrapper content={i18n('githubTooltip')} position='top'>
				<SvgWithStrokeStyle onClick={() => createTabWithUrl(GITHUB_URL)}>
					<GithubSvg style={{ width: '18px', height: '18px' }} />
				</SvgWithStrokeStyle>
			</PopoverWrapper>
			<PopoverWrapper content={i18n('issueTooltip')} position='top'>
				<SvgWithFileStyle
					onClick={() => {
						createTabWithUrl(GITHUB_ISSUE_URL)
					}}
				>
					<IssueSvg style={{ width: '18px', height: '18px' }} />
				</SvgWithFileStyle>
			</PopoverWrapper>
		</LeftIconContainer>
	)
}
