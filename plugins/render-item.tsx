import { useSetAtom } from 'jotai'
import React from 'react'
import type { CommandPlugin } from '~shared/types'
import { SearchValueAtom } from '~sidepanel/atom'

interface RenderPluginItemProps {
	item: CommandPlugin
}
export function RenderPluginItem({ item }: RenderPluginItemProps) {
	return <div>{item.command}</div>
}

export function usePluginClickItem() {
	const setSearchValue = useSetAtom(SearchValueAtom)

	const handlePluginClick = (plugin: CommandPlugin) => {
		setSearchValue({ value: plugin.command })
	}

	return handlePluginClick
}
