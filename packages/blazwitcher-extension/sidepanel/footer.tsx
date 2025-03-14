import GithubSvg from 'react:~assets/github.svg'
import SettingSvg from 'react:~assets/setting.svg'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { PopoverWrapper } from '~shared/common-styles'
import { GITHUB_URL } from '~shared/constants'
import { createTabWithUrl } from '~shared/utils'
import { i18nAtom } from './atom'

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
	const i18n = useAtomValue(i18nAtom)
	return (
		<FooterContainer>
			<PopoverWrapper content={i18n('settingTooltip')} position='top'>
				<SvgWithFileStyle
					onClick={() => {
						const optionsPageUrl = chrome.runtime.getURL('options.html')
						createTabWithUrl(optionsPageUrl)
					}}
				>
					<SettingSvg style={{ width: '16px', height: '16px' }} />
				</SvgWithFileStyle>
			</PopoverWrapper>
			<PopoverWrapper content={i18n('githubTooltip')} position='top'>
				<SvgWithStrokeStyle onClick={() => createTabWithUrl(GITHUB_URL)}>
					<GithubSvg style={{ width: '16px', height: '16px' }} />
				</SvgWithStrokeStyle>
			</PopoverWrapper>
		</FooterContainer>
	)
}
