import DuplicateSvg from 'react:~assets/duplicate.svg'
import PinSvg from 'react:~assets/pin.svg'
import type { CommandPlugin } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'

export const pinCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/pin',
	description: i18n('pinCurrentTab'),
	icon: <PinSvg width={24} height={24} />,
	action: async (context) => {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
		if (tabs[0]?.id) {
			await chrome.tabs.update(tabs[0].id, { pinned: !tabs[0].pinned })
		}
		context?.setSearchValue?.('')
	},
})

export const duplicateCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/duplicate',
	description: i18n('duplicateCurrentTab'),
	icon: <DuplicateSvg width={24} height={24} />,
	action: async (context) => {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
		if (tabs[0]?.id) {
			await chrome.tabs.duplicate(tabs[0].id)
		}
		context?.setSearchValue?.('')
	},
})
