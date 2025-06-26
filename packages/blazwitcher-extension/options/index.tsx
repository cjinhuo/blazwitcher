import './options.css'
import { SettingPanels } from '~plugins/settingPanels'
import { useTheme } from '~sidepanel/hooks/useTheme'

// 自定义设置页面
export default function Options() {
	useTheme()
	return <SettingPanels />
}
