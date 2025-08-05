import { IconInfoCircle, IconRefresh } from '@douyinfe/semi-icons'
import { Button, Card, Col, InputNumber, Row, Switch, Tooltip } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import {
	historyMaxDaysAtom,
	historyMaxResultsAtom,
	i18nAtom,
	resetSearchConfigAtom,
	searchConfigAtom,
} from '~sidepanel/atom'

const StyledCard = styled(Card)`
  width: 100%;
	align-items: center;
`

const Section = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
`

const ConfigItem = styled.div`
  margin-bottom: 24px;
`

const StyledInputNumber = styled(InputNumber)`
  width: 120px; 
`

const InfoIcon = styled(IconInfoCircle)`
  color: var(--semi-color-text-2);
  cursor: help;
`

export const SearchPanel: React.FC = () => {
	const [config, setConfig] = useAtom(searchConfigAtom)
	const [historyMaxDays, setHistoryMaxDays] = useAtom(historyMaxDaysAtom)
	const [historyMaxResults, setHistoryMaxResults] = useAtom(historyMaxResultsAtom)
	const resetConfig = useSetAtom(resetSearchConfigAtom)
	const i18n = useAtomValue(i18nAtom)

	const handleConfigChange = (key: string, value: number | boolean) => {
		setConfig((prev) => ({ ...prev, [key]: value }))
	}

	return (
		<StyledCard
			title={i18n('searchSettings')}
			headerExtraContent={
				<Button type='tertiary' icon={<IconRefresh />} onClick={() => resetConfig()}>
					{i18n('restoreDefaults')}
				</Button>
			}
		>
			<Row gutter={[12, 6]}>
				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxDays')}</Section>
						<StyledInputNumber
							min={7}
							max={100}
							value={historyMaxDays}
							onChange={(value: number) => setHistoryMaxDays(value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxResults')}</Section>
						<StyledInputNumber
							min={100}
							max={2000}
							value={historyMaxResults}
							onChange={(value: number) => setHistoryMaxResults(value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyDisplayCount')}</Section>
						<StyledInputNumber
							min={1}
							max={20}
							value={config.historyDisplayCount}
							onChange={(value: number) => handleConfigChange('historyDisplayCount', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('bookmarkDisplayCount')}</Section>
						<StyledInputNumber
							min={1}
							max={20}
							value={config.bookmarkDisplayCount}
							onChange={(value: number) => handleConfigChange('bookmarkDisplayCount', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('topSuggestionsCount')}</Section>
						<StyledInputNumber
							min={1}
							max={10}
							value={config.topSuggestionsCount}
							onChange={(value: number) => handleConfigChange('topSuggestionsCount', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>
							{i18n('enableConsecutiveSearch')}{' '}
							<Tooltip content={i18n('enableConsecutiveSearchDesc')}>
								<InfoIcon size='small' />
							</Tooltip>
						</Section>
						<Switch
							checked={config.enableConsecutiveSearch}
							onChange={(checked: boolean) => handleConfigChange('enableConsecutiveSearch', checked)}
						/>
					</ConfigItem>
				</Col>
			</Row>
		</StyledCard>
	)
}
