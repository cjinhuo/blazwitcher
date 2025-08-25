import {
	IconComponent,
	IconDesktop,
	IconExpand,
	IconInfoCircle,
	IconLanguage,
	IconMoon,
	IconRefresh,
	IconSun,
} from '@douyinfe/semi-icons'
import { Button, Card, InputNumber, Radio, RadioGroup, Tooltip } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import {
	DisplayMode,
	LanguageType,
	SEARCH_WINDOW_HEIGHT,
	SEARCH_WINDOW_WIDTH,
	type ThemeColor,
} from '~shared/constants'
import { i18nAtom, languageAtom, restoreAppearanceSettingsAtom, themeAtom } from '~sidepanel/atom'
import { displayModeAtom, heightAtom, widthAtom } from '~sidepanel/atom/windowAtom'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Section = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
	display: flex;
	align-items: center;
	gap: 8px;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StyledCard = styled(Card)`
  width: 100%;
	align-items: center;
`

const SizeInputContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`

const SizeInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SizeLabel = styled.span`
  font-size: 12px;
  color: var(--semi-color-text-2);
`

const InfoIcon = styled(IconInfoCircle)`
  color: var(--semi-color-text-2);
  cursor: help;
`

export const AppearancePanel: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [language, setLanguage] = useAtom(languageAtom)
	const [themeColor, setThemeColor] = useAtom(themeAtom)
	const [displayMode, setDisplayMode] = useAtom(displayModeAtom)
	const [iframeWidth, setIframeWidth] = useAtom(widthAtom)
	const [iframeHeight, setIframeHeight] = useAtom(heightAtom)
	const resetConfig = useSetAtom(restoreAppearanceSettingsAtom)

	const handleChangeWidth = (value: number) => {
		setIframeWidth(value)
	}

	const handleChangeHeight = (value: number) => {
		setIframeHeight(value)
	}

	const handleLanguageChange = (value: string) => {
		setLanguage(value as LanguageType)
	}

	const handleThemeChange = (value: ThemeColor) => {
		setThemeColor(value)
	}

	return (
		<StyledCard
			title={i18n('themeSettings')}
			headerExtraContent={
				<Button type='tertiary' icon={<IconRefresh />} onClick={resetConfig}>
					{i18n('restoreDefaults')}
				</Button>
			}
		>
			<Container>
				<div>
					<Section>{i18n('appearanceMode')}</Section>
					<RadioGroup type='button' onChange={(e) => handleThemeChange(e.target.value)} value={themeColor}>
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
					<Section>
						{i18n('windowMode')}{' '}
						<Tooltip content={i18n('restartRequired')} position='right'>
							<InfoIcon size='small' />
						</Tooltip>
					</Section>

					<RadioGroup
						type='button'
						value={displayMode || DisplayMode.IFRAME}
						defaultValue={DisplayMode.IFRAME}
						onChange={(e) => setDisplayMode(e.target.value)}
					>
						<Radio value={DisplayMode.IFRAME}>
							<IconWrapper>
								<IconComponent />
								<Tooltip content={i18n('iframeTooltipDesc')}>{i18n('iframeMode')}</Tooltip>
							</IconWrapper>
						</Radio>
						<Radio value={DisplayMode.ISOLATE_WINDOW}>
							<IconWrapper>
								<IconExpand />
								<Tooltip content={i18n('isolatedWindowTooltipDesc')}>{i18n('isolatedWindow')}</Tooltip>
							</IconWrapper>
						</Radio>
					</RadioGroup>
					<SizeInputContainer>
						<SizeInputWrapper>
							<SizeLabel>{i18n('iframeWidth')}</SizeLabel>
							<InputNumber
								value={iframeWidth || SEARCH_WINDOW_WIDTH}
								onChange={handleChangeWidth}
								style={{ width: 120 }}
								min={400}
							/>
						</SizeInputWrapper>
						<SizeInputWrapper>
							<SizeLabel>{i18n('iframeHeight')}</SizeLabel>
							<InputNumber
								value={iframeHeight || SEARCH_WINDOW_HEIGHT}
								onChange={handleChangeHeight}
								style={{ width: 120 }}
								min={300}
							/>
						</SizeInputWrapper>
					</SizeInputContainer>
				</div>

				<div>
					<Section>{i18n('language')}</Section>
					<RadioGroup onChange={(e) => handleLanguageChange(e.target.value)} type='button' value={language}>
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
