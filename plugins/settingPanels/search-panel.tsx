import { IconRefresh } from '@douyinfe/semi-icons'
import { Button, Card, Col, InputNumber, Row } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import { i18nAtom, resetSearchConfigAtom, searchConfigAtom } from '~sidepanel/atom'

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 32rem;
`

const _TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
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

export const SearchPanel: React.FC = () => {
	const [config, setConfig] = useAtom(searchConfigAtom)
	const resetConfig = useSetAtom(resetSearchConfigAtom)
	const i18n = useAtomValue(i18nAtom)

	const handleConfigChange = (key: string, value: number) => {
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
			style={{
				alignItems: 'center',
			}}
		>
			<Row gutter={[24, 0]}>
				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxDays')}</Section>
						<StyledInputNumber
							min={7}
							max={100}
							value={config.historyMaxDays}
							onChange={(value: number) => handleConfigChange('historyMaxDays', value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxResults')}</Section>
						<StyledInputNumber
							min={100}
							max={2000}
							value={config.historyMaxResults}
							onChange={(value: number) => handleConfigChange('historyMaxResults', value)}
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
			</Row>
		</StyledCard>
	)
}
