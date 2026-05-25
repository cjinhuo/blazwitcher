import { IconLink, IconSearch } from '@douyinfe/semi-icons'
import styled from 'styled-components'
import { ContentContainer, IMAGE_CLASS, NORMAL_TEXT_CLASS } from '~shared/common-styles'
import { ItemType, type ListItemType } from '~shared/types'
import { useColorMap } from '~sidepanel/hooks/useTheme'
import HighlightText from './highlight-text'
import { RenderSearchActionOperation } from './operation'

// 普通列表没有命中时，渲染“打开输入内容”或“使用默认搜索引擎搜索”的兜底项。
const ActionIcon = styled.div`
	position: relative;
	width: 40px;
	height: 40px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--color-neutral-8);
	color: var(--color-neutral-4);
`

const FaviconBadge = styled.img`
	position: absolute;
	right: -2px;
	bottom: -2px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background-color: var(--color-neutral-10);
`

const SearchIconWrapper = styled.span`
	transform: scaleX(-1);
	display: inline-flex;
`

const ActionTitle = styled.div`
	height: 40px;
	flex: 1;
	display: flex;
	align-items: center;
	padding: 0 4px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`

const TextPart = styled.span`
	flex-shrink: 0;
`

export const RenderSearchActionItem = ({ item }: { item: ListItemType<ItemType.SearchAction> }) => {
	const colorMap = useColorMap()
	const valueHitRanges: [number, number][] = item.data.value ? [[0, item.data.value.length - 1]] : []
	return (
		<ContentContainer $colorMap={colorMap}>
			<ActionIcon className={IMAGE_CLASS}>
				{item.data.actionType === 'search' ? (
					<SearchIconWrapper>
						<IconSearch size='default' />
					</SearchIconWrapper>
				) : (
					<IconLink size='default' />
				)}
				{item.data.favIconUrl && <FaviconBadge src={item.data.favIconUrl} alt='' />}
			</ActionIcon>
			<ActionTitle className={NORMAL_TEXT_CLASS}>
				<TextPart>{item.data.prefix}&nbsp;</TextPart>
				<HighlightText source={item.data.value} hitRanges={valueHitRanges} id={item.data.id} />
				{item.data.suffix && <TextPart>&nbsp;{item.data.suffix}</TextPart>}
			</ActionTitle>
			<RenderSearchActionOperation item={item} />
		</ContentContainer>
	)
}
