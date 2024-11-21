import { useSetAtom } from 'jotai'
import React from 'react'
import type { CommandPlugin } from '~shared/types'
import { SearchValueAtom } from '~sidepanel/atom'

interface RenderPluginItemProps {
	item: CommandPlugin
}
export default function RenderPluginItem({ item }: RenderPluginItemProps) {
	const setSearchValue = useSetAtom(SearchValueAtom)

	const handlePluginClick = (plugin: CommandPlugin) => {
		// 更改 atom 去更新 search 组件的 value
		setSearchValue({ value: plugin.command })
	}
	// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
	return <div onClick={() => handlePluginClick(item)}>{item.command}</div>
}
