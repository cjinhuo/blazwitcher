import { useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import {
	ContentContainer,
	IMAGE_CLASS,
	ImageContainer,
	NORMAL_TEXT_CLASS,
	SecondaryContainer,
	TitleContainer,
} from '~shared/common-styles'
import type { ItemType, ListItemType } from '~shared/types'
import { pluginContextAtom, searchValueAtom } from '~sidepanel/atom'

interface RenderPluginItemProps {
	item: ListItemType<ItemType.Plugin>
}

const PluginContainer = styled(ContentContainer)`
	svg {
		fill: var(--color-neutral-4);
	}
`

const CommandText = styled.div`
	font-size: 16px;
	font-weight: 500;
`

export function RenderPluginItem({ item: { data } }: RenderPluginItemProps) {
	return (
		<PluginContainer>
			<ImageContainer className={IMAGE_CLASS}>{data.icon}</ImageContainer>
			<TitleContainer>
				<CommandText className={NORMAL_TEXT_CLASS}>{data.command}</CommandText>
				<SecondaryContainer className={NORMAL_TEXT_CLASS}>{data.description}</SecondaryContainer>
			</TitleContainer>
		</PluginContainer>
	)
}

export function usePluginClickItem() {
	const setSearchValue = useSetAtom(searchValueAtom)
	const pluginContext = useAtomValue(pluginContextAtom)

	const handlePluginClick = (plugin: ListItemType<ItemType.Plugin>) => {
		// 如果插件有 action 函数，直接执行
		if (plugin.data.action) {
			plugin.data.action(pluginContext)
			return
		}

		// 否则设置搜索值，让插件通过 render 或 dataProcessing 处理
		// 额外添加一个空格，方便按住 alt 快捷删除单个单词
		setSearchValue({ value: `${plugin.data.command} ` })
	}

	return handlePluginClick
}
