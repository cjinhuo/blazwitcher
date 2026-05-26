import { IconDelete, IconEdit, IconInfoCircle, IconPlus, IconRefresh, IconSearch } from '@douyinfe/semi-icons'
import {
	Button,
	Card,
	Col,
	Input,
	InputNumber,
	List,
	Modal,
	Radio,
	Row,
	Switch,
	Toast,
	Tooltip,
} from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import styled from 'styled-components'
import {
	MAX_BOOKMARK_DISPLAY_COUNT,
	MAX_DAYS_HISTORY_CAN_RETRIEVE,
	MAX_HISTORY_DISPLAY_COUNT,
	MAX_RESULTS_HISTORY_CAN_RETRIEVE,
	MAX_TOP_SUGGESTIONS_DISPLAY_COUNT,
	SEARCH_ENGINE_PRESETS,
	SEARCH_QUERY_PLACEHOLDER,
	type SearchEngineConfig,
} from '~shared/constants'
import { buildSearchUrl, getSearchEngineIconUrl, isValidSearchEngineQueryTemplate } from '~shared/search-engine'
import {
	historyMaxDaysAtom,
	historyMaxResultsAtom,
	i18nAtom,
	resetSearchConfigAtom,
	type SearchConfigAtomType,
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

const SearchEngineHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 8px;
`

const SearchEngineItem = styled.div`
	display: grid;
	grid-template-columns: 28px minmax(0, 1fr) auto auto;
	align-items: center;
	gap: 10px;
	width: 100%;
`

const SearchEngineIcon = styled.div`
	width: 24px;
	height: 24px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--semi-color-text-2);

	img {
		width: 20px;
		height: 20px;
		border-radius: 4px;
	}
`

const SearchEngineText = styled.div`
	min-width: 0;
`

const SearchEngineName = styled.div`
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const SearchEngineTemplate = styled.div`
	color: var(--semi-color-text-2);
	font-size: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const SearchEngineActions = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
`

const ModalField = styled.div`
	margin-bottom: 16px;
`

const ModalLabel = styled.div`
	margin-bottom: 6px;
	font-weight: 500;
`

const PreviewUrl = styled.div`
	color: var(--semi-color-text-2);
	font-size: 12px;
	overflow-wrap: anywhere;
`

const StyledInputNumber = styled(InputNumber)`
  width: 120px;
`

const StyledInput = styled(Input)`
  width: 100%;
`

const InfoIcon = styled(IconInfoCircle)`
  color: var(--semi-color-text-2);
  cursor: help;
`

const createSearchEngineId = () => `search-engine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getInitialEditingEngine = (): SearchEngineConfig => ({
	id: createSearchEngineId(),
	name: '',
	queryTemplate: '',
})

type SearchConfigValueKey = keyof Pick<
	SearchConfigAtomType,
	'historyDisplayCount' | 'bookmarkDisplayCount' | 'topSuggestionsCount' | 'enableConsecutiveSearch'
>

export const SearchPanel: React.FC = () => {
	const [config, setConfig] = useAtom(searchConfigAtom)
	const [historyMaxDays, setHistoryMaxDays] = useAtom(historyMaxDaysAtom)
	const [historyMaxResults, setHistoryMaxResults] = useAtom(historyMaxResultsAtom)
	const resetConfig = useSetAtom(resetSearchConfigAtom)
	const i18n = useAtomValue(i18nAtom)
	const [editingEngine, setEditingEngine] = useState<SearchEngineConfig | null>(null)
	const [isSearchEngineModalVisible, setIsSearchEngineModalVisible] = useState(false)

	const handleConfigChange = (key: SearchConfigValueKey, value: number | boolean) => {
		setConfig((prev) => ({ ...prev, [key]: value }))
	}

	const handleAddSearchEngine = () => {
		setEditingEngine(getInitialEditingEngine())
		setIsSearchEngineModalVisible(true)
	}

	const handleEditSearchEngine = (engine: SearchEngineConfig) => {
		setEditingEngine({ ...engine })
		setIsSearchEngineModalVisible(true)
	}

	const handleDeleteSearchEngine = (id: string) => {
		setConfig((prev) => {
			if (prev.searchEngines.length <= 1) {
				Toast.warning(i18n('atLeastOneSearchEngine'))
				return prev
			}
			const searchEngines = prev.searchEngines.filter((engine) => engine.id !== id)
			const defaultSearchEngineId =
				prev.defaultSearchEngineId === id ? searchEngines[0]?.id || '' : prev.defaultSearchEngineId

			return {
				...prev,
				searchEngines,
				defaultSearchEngineId,
			}
		})
	}

	const handleSetDefaultSearchEngine = (id: string) => {
		setConfig((prev) => ({ ...prev, defaultSearchEngineId: id }))
	}

	const handleSearchEngineModalOk = () => {
		if (!editingEngine?.name.trim()) {
			Toast.error(i18n('searchEngineNameRequired'))
			return
		}
		if (!isValidSearchEngineQueryTemplate(editingEngine.queryTemplate)) {
			Toast.error(i18n('searchEngineQueryTemplateInvalid'))
			return
		}

		const normalizedEngine = {
			...editingEngine,
			name: editingEngine.name.trim(),
			queryTemplate: editingEngine.queryTemplate.trim(),
		}

		setConfig((prev) => {
			const existed = prev.searchEngines.some((engine) => engine.id === normalizedEngine.id)
			const searchEngines = existed
				? prev.searchEngines.map((engine) => (engine.id === normalizedEngine.id ? normalizedEngine : engine))
				: [...prev.searchEngines, normalizedEngine]

			return {
				...prev,
				searchEngines,
				defaultSearchEngineId: prev.defaultSearchEngineId || normalizedEngine.id,
			}
		})
		setIsSearchEngineModalVisible(false)
		setEditingEngine(null)
	}

	const handleSearchEngineModalCancel = () => {
		setIsSearchEngineModalVisible(false)
		setEditingEngine(null)
	}

	const renderSearchEngineIcon = (queryTemplate: string) => {
		const iconUrl = getSearchEngineIconUrl(queryTemplate)
		return <SearchEngineIcon>{iconUrl ? <img src={iconUrl} alt='' /> : <IconSearch />}</SearchEngineIcon>
	}

	const previewUrl =
		editingEngine && isValidSearchEngineQueryTemplate(editingEngine.queryTemplate)
			? buildSearchUrl('blazwitcher', editingEngine.queryTemplate)
			: ''
	const isEditingExistingSearchEngine = config.searchEngines.some((engine) => engine.id === editingEngine?.id)

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
							min={0}
							max={MAX_DAYS_HISTORY_CAN_RETRIEVE}
							value={historyMaxDays}
							onChange={(value: number) => setHistoryMaxDays(value)}
						/>
					</ConfigItem>
				</Col>

				<Col span={12}>
					<ConfigItem>
						<Section>{i18n('historyMaxResults')}</Section>
						<StyledInputNumber
							min={0}
							max={MAX_RESULTS_HISTORY_CAN_RETRIEVE}
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
							max={MAX_HISTORY_DISPLAY_COUNT}
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
							max={MAX_BOOKMARK_DISPLAY_COUNT}
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
							max={MAX_TOP_SUGGESTIONS_DISPLAY_COUNT}
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

				<Col span={24}>
					<ConfigItem>
						<SearchEngineHeader>
							<Section>
								{i18n('searchEngines')}{' '}
								<Tooltip content={i18n('searchEngineQueryTemplateDesc')}>
									<InfoIcon size='small' />
								</Tooltip>
							</Section>
							<Button type='primary' theme='borderless' icon={<IconPlus />} onClick={handleAddSearchEngine}>
								{i18n('addSearchEngine')}
							</Button>
						</SearchEngineHeader>
						<List
							emptyContent={i18n('noSearchEngines')}
							dataSource={config.searchEngines}
							renderItem={(engine) => (
								<List.Item>
									<SearchEngineItem>
										{renderSearchEngineIcon(engine.queryTemplate)}
										<SearchEngineText>
											<SearchEngineName>{engine.name}</SearchEngineName>
											<SearchEngineTemplate>{engine.queryTemplate}</SearchEngineTemplate>
										</SearchEngineText>
										<Radio
											checked={config.defaultSearchEngineId === engine.id}
											onChange={() => handleSetDefaultSearchEngine(engine.id)}
										>
											{i18n('defaultSearchEngine')}
										</Radio>
										<SearchEngineActions>
											<Button
												type='tertiary'
												theme='borderless'
												icon={<IconEdit />}
												onClick={() => handleEditSearchEngine(engine)}
											/>
											<Button
												type='danger'
												theme='borderless'
												icon={<IconDelete />}
												onClick={() => handleDeleteSearchEngine(engine.id)}
											/>
										</SearchEngineActions>
									</SearchEngineItem>
								</List.Item>
							)}
						/>
					</ConfigItem>
				</Col>
			</Row>
			<Modal
				title={i18n(isEditingExistingSearchEngine ? 'editSearchEngine' : 'addSearchEngine')}
				visible={isSearchEngineModalVisible}
				onOk={handleSearchEngineModalOk}
				onCancel={handleSearchEngineModalCancel}
			>
				<ModalField>
					<ModalLabel>{i18n('searchEngineName')}</ModalLabel>
					<StyledInput
						value={editingEngine?.name || ''}
						onChange={(value: string) => setEditingEngine((prev) => (prev ? { ...prev, name: value } : prev))}
						placeholder='Google'
					/>
				</ModalField>
				<ModalField>
					<ModalLabel>{i18n('searchEngineQueryTemplate')}</ModalLabel>
					<StyledInput
						value={editingEngine?.queryTemplate || ''}
						onChange={(value: string) => setEditingEngine((prev) => (prev ? { ...prev, queryTemplate: value } : prev))}
						placeholder={SEARCH_ENGINE_PRESETS[0].queryTemplate}
					/>
				</ModalField>
				<PreviewUrl>
					{previewUrl
						? `${i18n('searchEnginePreview')}: ${previewUrl}`
						: i18n('searchEngineQueryTemplateDesc').replace(SEARCH_QUERY_PLACEHOLDER, SEARCH_QUERY_PLACEHOLDER)}
				</PreviewUrl>
			</Modal>
		</StyledCard>
	)
}
