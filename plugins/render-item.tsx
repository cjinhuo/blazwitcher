import React from 'react'
import type { CommandPlugin } from '~shared/types'

interface RenderPluginItemProps {
	item: CommandPlugin
}
export default function RenderPluginItem({ item }: RenderPluginItemProps) {
	return <div>{item.command}</div>
}
