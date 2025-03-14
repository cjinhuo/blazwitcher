import type { i18nFunction } from '~sidepanel/atom'
import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin } from './filters'
import { settingPlugin } from './setting'

// settingPlugin
const plugins = (i18n: i18nFunction) => [
	filterByTabPlugin(i18n),
	filterByHistoryPlugin(i18n),
	filterByBookmarkPlugin(i18n),
	settingPlugin(i18n),
]

export default plugins
