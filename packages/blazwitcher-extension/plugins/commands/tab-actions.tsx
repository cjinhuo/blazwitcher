import DuplicateSvg from 'react:~assets/duplicate.svg'
import PinSvg from 'react:~assets/pin.svg'
import type { CommandPlugin } from '~shared/types'
import { getActiveTabInUserWindow } from '~shared/utils'
import type { i18nFunction } from '~sidepanel/atom'

export const pinCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/pin',
	description: i18n('pinCurrentTab'),
	icon: <PinSvg width={24} height={24} />,
	action: async (_context) => {
		const tab = await getActiveTabInUserWindow()
		if (tab?.id) {
			await chrome.tabs.update(tab.id, { pinned: !tab.pinned })
		}
	},
})

export const duplicateCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/duplicate',
	description: i18n('duplicateCurrentTab'),
	icon: <DuplicateSvg width={24} height={24} />,
	action: async (_context) => {
		const tab = await getActiveTabInUserWindow()
		if (tab?.id) {
			await chrome.tabs.duplicate(tab.id)
		}
	},
})
