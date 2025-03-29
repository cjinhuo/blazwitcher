import CustomSetting from '@/public/custom-setting.gif'
import MultiResource from '@/public/multi-resource.gif'
import MultiSearch from '@/public/multi-search.gif'
import OnlyKeyboard from '@/public/only-keyboard.gif'

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
		gifUrl: MultiSearch,
	},
	{
		id: 2,
		title: 'features.list.2.title',
		description: 'features.list.2.description',
		gifUrl: MultiResource,
	},
	{
		id: 3,
		title: 'features.list.3.title',
		description: 'features.list.3.description',
		gifUrl: OnlyKeyboard,
	},
	{
		id: 4,
		title: 'features.list.4.title',
		description: 'features.list.4.description',
		gifUrl: CustomSetting,
	},
]
