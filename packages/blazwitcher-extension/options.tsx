import './options.css'
import { SettingPanels } from '~plugins/settingPanels'
import { useTheme } from '~sidepanel/hooks/useTheme'

// options page 是个独立页面
export default function Options() {
	useTheme()
	return <>{<SettingPanels />}</>
}
