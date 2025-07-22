import { useSetAtom } from 'jotai'
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
import { searchValueAtom } from '~sidepanel/atom'

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

	const handlePluginClick = (plugin: ListItemType<ItemType.Plugin>) => {
		// 额外添加一个空格，方便按住 alt 快捷删除单个单词
		setSearchValue({ value: `${plugin.data.command} ` })
	}

	return handlePluginClick
}
