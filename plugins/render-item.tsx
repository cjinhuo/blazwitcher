import { useSetAtom } from 'jotai'
import React from 'react'
import styled from 'styled-components'
import {
	ContentContainer,
	IMAGE_CLASS,
	ImageContainer,
	NORMAL_TEXT_CLASS,
	SecondaryContainer,
	TitleContainer,
} from '~shared/common-styles'
import type { CommandPlugin } from '~shared/types'
import { SearchValueAtom } from '~sidepanel/atom'

interface RenderPluginItemProps {
	item: CommandPlugin
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

export function RenderPluginItem({ item }: RenderPluginItemProps) {
	return (
		<PluginContainer>
			<ImageContainer className={IMAGE_CLASS}>{item.icon}</ImageContainer>
			<TitleContainer>
				<CommandText className={NORMAL_TEXT_CLASS}>{item.command}</CommandText>
				<SecondaryContainer className={NORMAL_TEXT_CLASS}>{item.description}</SecondaryContainer>
			</TitleContainer>
		</PluginContainer>
	)
}

export function usePluginClickItem() {
	const setSearchValue = useSetAtom(SearchValueAtom)

	const handlePluginClick = (plugin: CommandPlugin) => {
		// 额外添加一个空格，方便 alt 删除单个单词
		setSearchValue({ value: `${plugin.command} ` })
	}

	return handlePluginClick
}
