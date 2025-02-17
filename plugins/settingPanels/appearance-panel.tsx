import { IconDesktop, IconLanguage, IconMoon, IconSun } from '@douyinfe/semi-icons'
import { Card, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { useSetAtom } from 'jotai'
import styled from 'styled-components'
import { LanguageType } from '~shared/constants'
import { t } from '~shared/utils'
import { languageAtom } from '~sidepanel/atom'

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
	const setLanguage = useSetAtom(languageAtom)
	const handleLanguageChange = (value: string) => {
		// todo 需要存在 Localstorage，然后在 index 加载时先从 localstorage 读取
		setLanguage(value as LanguageType)
	}
	return (
		<StyledCard title={t('theme_settings')}>
			<Container>
				<div>
					<Section>{t('appearance_mode')}</Section>
					<RadioGroup type='button' defaultValue='system'>
						<Radio value='light'>
							<IconWrapper>
								<IconSun />
								<span>{t('light')}</span>
							</IconWrapper>
						</Radio>
						<Radio value='dark'>
							<IconWrapper>
								<IconMoon />
								<span>{t('dark')}</span>
							</IconWrapper>
						</Radio>
						<Radio value='system'>
							<IconWrapper>
								<IconDesktop />
								<span>{t('follow_system')}</span>
							</IconWrapper>
						</Radio>
					</RadioGroup>
				</div>

				<div>
					<Section>{t('window_size')}</Section>
					<RadioGroup type='button' defaultValue='medium'>
						<Radio value='small'>{t('small')}</Radio>
						<Radio value='medium'>{t('medium')}</Radio>
						<Radio value='large'>{t('large')}</Radio>
					</RadioGroup>
				</div>

				<div>
					<Section>{t('language')}</Section>
					<RadioGroup onChange={(e) => handleLanguageChange(e.target.value)} type='button' defaultValue='en'>
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
