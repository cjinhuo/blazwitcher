import type { CommandPlugin } from '~shared/types'

export const settingPlugin: CommandPlugin = {
	command: '/setting',
	placeholder: 'Setting Page',
	render: () => <div>Setting</div>,
}
