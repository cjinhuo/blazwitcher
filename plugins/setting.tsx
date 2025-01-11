import SettingSvg from 'react:~assets/setting.svg'
import { SettingPanels } from '~plugins/settingPanels'
import type { CommandPlugin } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'

export const settingPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/setting',
	description: i18n('settingPage'),
	icon: <SettingSvg width={24} height={24} />,
	render: () => <SettingPanels />,
})
