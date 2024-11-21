import SettingSvg from 'react:~assets/setting.svg'
import type { CommandPlugin } from '~shared/types'

export const settingPlugin: CommandPlugin = {
	command: '/setting',
	description: 'Setting Page',
	icon: <SettingSvg width={24} height={24} />,
	render: () => <div>Setting</div>,
}
