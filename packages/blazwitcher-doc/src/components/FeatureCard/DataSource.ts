import AiGroupingGif from '@/public/ai_grouping.gif'
import CommandFilterGif from '@/public/command_filter.gif'
import SearchGif from '@/public/search.gif'
import SettingGif from '@/public/setting.gif'

export interface ResultItem {
	type: string
	title: string
	subtitle: string
	shortcut?: string
}

export interface Command {
	icon: string
	label: string
}

export interface Feature {
	id: number
	title: string
	description: string
	gifUrl: any
}

export const features: Feature[] = [
	{
		id: 1,
		title: 'features.list.1.title',
		description: 'features.list.1.description',
		gifUrl: SearchGif,
	},
	{
		id: 2,
		title: 'features.list.2.title',
		description: 'features.list.2.description',
		gifUrl: AiGroupingGif,
	},
	{
		id: 3,
		title: 'features.list.3.title',
		description: 'features.list.3.description',
		gifUrl: CommandFilterGif,
	},
	{
		id: 4,
		title: 'features.list.4.title',
		description: 'features.list.4.description',
		gifUrl: SettingGif,
	},
]
