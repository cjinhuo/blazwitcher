import { IconDesktop, IconLanguage, IconMoon, IconSun } from '@douyinfe/semi-icons'
import { Card, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue } from 'jotai'
import styled from 'styled-components'
import { LanguageType } from '~shared/constants'
import { i18nAtom, languageAtom, themeAtom } from '~sidepanel/atom'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Section = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 32rem;
`

export const AppearancePanel: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [language, setLanguage] = useAtom(languageAtom)
	const [themeColor, setThemeColor] = useAtom(themeAtom)
	const handleLanguageChange = (value: string) => {
		setLanguage(value as LanguageType)
	}
	const handleThemeChange = (value: 'dark' | 'light' | 'system') => {
		setThemeColor(value)
	}

	return (
		<StyledCard title={i18n('themeSettings')}>
			<Container>
				<div>
					<Section>{i18n('appearanceMode')}</Section>
					<RadioGroup type='button' onChange={(e) => handleThemeChange(e.target.value)} defaultValue={themeColor}>
						<Radio value='light'>
							<IconWrapper>
								<IconSun />
								<span>{i18n('light')}</span>
							</IconWrapper>
						</Radio>
						<Radio value='dark'>
							<IconWrapper>
								<IconMoon />
								<span>{i18n('dark')}</span>
							</IconWrapper>
						</Radio>
						<Radio value='system'>
							<IconWrapper>
								<IconDesktop />
								<span>{i18n('followSystem')}</span>
							</IconWrapper>
						</Radio>
					</RadioGroup>
				</div>

				{/* TODO: 窗口大小设置 是否默认全屏设置 */}
				{/* <div>
					<Section>{i18n('windowSize')}</Section>
					<RadioGroup type='button' defaultValue='medium'>
						<Radio value='small'>{i18n('small')}</Radio>
						<Radio value='medium'>{i18n('medium')}</Radio>
						<Radio value='large'>{i18n('large')}</Radio>
					</RadioGroup>
				</div> */}

				<div>
					<Section>{i18n('language')}</Section>
					<RadioGroup onChange={(e) => handleLanguageChange(e.target.value)} type='button' defaultValue={language}>
						<Radio value={LanguageType.en}>
							<IconWrapper>
								<IconLanguage />
								<span>English</span>
							</IconWrapper>
						</Radio>
						<Radio value={LanguageType.zh}>
							<IconWrapper>
								<IconLanguage />
								<span>中文</span>
							</IconWrapper>
						</Radio>
					</RadioGroup>
				</div>
			</Container>
		</StyledCard>
	)
}
