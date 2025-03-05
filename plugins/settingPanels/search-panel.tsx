import { IconRefresh } from '@douyinfe/semi-icons'
import { Button, Card, Col, InputNumber, Row } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import { i18nAtom, resetSearchConfigAtom, searchConfigAtom } from '~sidepanel/atom'

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 32rem;
`
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const Section = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
`

const HelpText = styled.div`
  font-size: 12px;
  color: var(--semi-color-text-2);
  margin-top: 4px;
`

const ConfigItem = styled.div`
  margin-bottom: 24px;
`

const StyledInputNumber = styled(InputNumber)`
  width: 120px; 
`

export const SearchPanel: React.FC = () => {
	const [config, setConfig] = useAtom(searchConfigAtom)
	const resetConfig = useSetAtom(resetSearchConfigAtom)
	const i18n = useAtomValue(i18nAtom)

	const handleConfigChange = (key: string, value: number) => {
		setConfig((prev) => ({ ...prev, [key]: value }))
	}

	return (
		<StyledCard
			title={
				<CardHeader>
					<span>{i18n('searchSettings')}</span>
					<HeaderActions>
						<Button theme='light' type='tertiary' icon={<IconRefresh />} onClick={() => resetConfig()}>
							{i18n('restoreDefaults')}
						</Button>
					</HeaderActions>
				</CardHeader>
			}
			headerStyle={{ padding: '16px 20px' }}
		>
			<Row gutter={[24, 0]}>
				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxDays')}</Section>
						<StyledInputNumber
							min={1}
							max={1000}
							value={config.historyMaxResults}
							onChange={(value: number) => handleConfigChange('historyMaxResults', value)}
						/>
						<HelpText>{i18n('historyMaxResults')}</HelpText>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxDays')}</Section>
						<StyledInputNumber
							min={1}
							max={365}
							value={config.historyMaxDays}
							onChange={(value: number) => handleConfigChange('historyMaxDays', value)}
						/>
						<HelpText>{i18n('historyMaxDays')}</HelpText>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('bookmarkDisplayCount')}</Section>
						<StyledInputNumber
							min={1}
							max={50}
							value={config.bookmarkDisplayCount}
							onChange={(value: number) => handleConfigChange('bookmarkDisplayCount', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyDisplayCount')}</Section>
						<StyledInputNumber
							min={1}
							max={50}
							value={config.historyDisplayCount}
							onChange={(value: number) => handleConfigChange('historyDisplayCount', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('topSuggestionsCount')}</Section>
						<StyledInputNumber
							min={0}
							max={10}
							value={config.topSuggestionsCount}
							onChange={(value: number) => handleConfigChange('topSuggestionsCount', value)}
						/>
					</ConfigItem>
				</Col>
			</Row>
		</StyledCard>
	)
}
