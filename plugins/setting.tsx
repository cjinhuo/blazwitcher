import SettingSvg from 'react:~assets/setting.svg'
import type { i18nFunction } from '~i18n/atom'
import type { CommandPlugin } from '~shared/types'

export const settingPlugin = (i18n: i18nFunction): CommandPlugin => ({
	command: '/setting',
	description: i18n('settingPage'),
	icon: <SettingSvg width={24} height={24} />,
	render: () => <div>{i18n('setting')}</div>,
})
