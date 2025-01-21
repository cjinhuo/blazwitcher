import { Card, CheckboxGroup, InputNumber, Space } from '@douyinfe/semi-ui'
import styled from 'styled-components'
import { t } from '~shared/utils'

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 32rem;
`

const Section = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
`

export const SearchPanel: React.FC = () => {
	const searchSourceOptions = [
		{ label: 'title', value: 'title' },
		{ label: 'domain', value: 'domain' },
		{ label: 'groupName', value: 'groupName' },
		{ label: 'folderName', value: 'folderName' },
	]

	const searchTypeOptions = [
		{ label: 'tab', value: 'tab' },
		{ label: 'history', value: 'history' },
		{ label: 'bookmark', value: 'bookmark' },
	]

	const defaultSearchSources = ['title', 'domain']
	const defaultSearchTypes = ['tab', 'history', 'bookmark']

	return (
		<StyledCard title={t('search_settings')}>
			<Space vertical align='start' spacing={24} style={{ width: '100%' }}>
				<div>
					<Section>{t('search_history_count')}</Section>
					<InputNumber min={1} max={1000} defaultValue={200} />
				</div>

				<div>
					<Section>{t('search_history_days')}</Section>
					<InputNumber min={1} max={365} defaultValue={14} />
				</div>

				<div>
					<Section>{t('search_source_config')}</Section>
					<CheckboxGroup options={searchSourceOptions} defaultValue={defaultSearchSources} />
				</div>

				<div>
					<Section>{t('default_search_type')}</Section>
					<CheckboxGroup options={searchTypeOptions} defaultValue={defaultSearchTypes} />
				</div>
			</Space>
		</StyledCard>
	)
}
