import GithubSvg from 'react:~assets/github.svg'
import SettingSvg from 'react:~assets/setting.svg'
import styled from 'styled-components'

import { GITHUB_URL } from '~shared/constants'
import { createTabWithUrl } from '~shared/utils'

const FooterContainer = styled.div`
  flex: 0 0 20px;
  background-color: var(--color-neutral-8);
  border-top: 1px solid var(--color-neutral-7);
  padding: 0 10px;
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`
const SvgWithStrokeStyle = styled.div`
  cursor: pointer;
  display: flex;
  > svg {
    stroke: var(--color-neutral-5);
    stroke-width: 3px;
  }
  &:hover {
    > svg {
      stroke: var(--color-neutral-2);
    }
  }
`

const SvgWithFileStyle = styled.div`
  cursor: pointer;
  display: flex;
  > svg {
    fill: var(--color-neutral-5);
  }
  &:hover {
    > svg {
      fill: var(--color-neutral-2);
    }
  }
`
export default function Footer() {
	return (
		<FooterContainer>
			<SvgWithFileStyle
				onClick={() => {
					const optionsPageUrl = chrome.runtime.getURL('options.html')
					createTabWithUrl(optionsPageUrl)
				}}
			>
				<SettingSvg style={{ width: '16px', height: '16px' }} />
			</SvgWithFileStyle>
			<SvgWithStrokeStyle onClick={() => createTabWithUrl(GITHUB_URL)}>
				<GithubSvg style={{ width: '16px', height: '16px' }} />
			</SvgWithStrokeStyle>
		</FooterContainer>
	)
}
