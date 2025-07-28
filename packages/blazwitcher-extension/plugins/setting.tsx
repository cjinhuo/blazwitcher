import SettingSvg from 'react:~assets/setting.svg'
import { SettingPanels } from '~plugins/settingPanels'
import { SettingPanelKey } from '~shared/constants'
import type { CommandPlugin } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'

export const settingPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/s',
	description: i18n('settingPage'),
	icon: <SettingSvg width={24} height={24} />,
	render: (searchValue?: string) => {
		const panelMatch = searchValue?.match(/\/s\s+(\w+)/)
		const panelName = panelMatch?.[1]

		// 输入 /s + 对应panelKey也能跳转到对应的设置界面
		const panelMap: Record<string, SettingPanelKey> = {
			appearance: SettingPanelKey.APPEARANCE,
			keyboard: SettingPanelKey.KEYBOARD,
			search: SettingPanelKey.SEARCH,
			changelog: SettingPanelKey.CHANGELOG,
			contact: SettingPanelKey.CONTACT,
		}

		const initialPanel = panelName && panelMap[panelName] ? panelMap[panelName] : undefined

		return <SettingPanels initialPanel={initialPanel} />
	},
})
