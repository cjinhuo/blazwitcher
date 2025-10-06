import AISvg from 'react:~assets/ai.svg'
import type { CommandPlugin } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'

export const aiGroupingPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/ai',
	description: i18n('aiGrouping'),
	icon: <AISvg width={24} height={24} />,
	action: (context) => {
		if (context.handleAIGroupingClick) {
			context.handleAIGroupingClick()
			context.setSearchValue?.('')
		} else {
			console.warn('aiGroupingPlugin action called, but handleAIGroupingClick not available in context')
		}
	},
})
