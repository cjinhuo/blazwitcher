import { IconDesktop, IconLanguage, IconMoon, IconSun } from '@douyinfe/semi-icons'
import { Card, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue } from 'jotai'
import styled from 'styled-components'
import { DEFAULT_LANGUAGE_KEY, LanguageType } from '~shared/constants'
import { i18nAtom, languageAtom } from '~sidepanel/atom'

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
	const handleLanguageChange = (value: string) => {
		localStorage.setItem(DEFAULT_LANGUAGE_KEY, value)
		setLanguage(value as LanguageType)
	}

	return (
		<StyledCard title={i18n('themeSettings')}>
			<Container>
				<div>
					<Section>{i18n('appearanceMode')}</Section>
					<RadioGroup type='button' defaultValue='system'>
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

				<div>
					<Section>{i18n('windowSize')}</Section>
					<RadioGroup type='button' defaultValue='medium'>
						<Radio value='small'>{i18n('small')}</Radio>
						<Radio value='medium'>{i18n('medium')}</Radio>
						<Radio value='large'>{i18n('large')}</Radio>
					</RadioGroup>
				</div>

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
