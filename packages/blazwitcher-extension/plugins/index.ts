import { ItemType, type ListItemType } from '~shared/types'
import type { i18nFunction } from '~sidepanel/atom'
import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin } from './filters'
import { settingPlugin } from './setting'

const plugins = (i18n: i18nFunction): ListItemType<ItemType.Plugin>[] =>
	[filterByTabPlugin(i18n), filterByHistoryPlugin(i18n), filterByBookmarkPlugin(i18n), settingPlugin(i18n)].map(
		(plugin) => ({
			itemType: ItemType.Plugin,
			data: plugin,
		})
	)

export default plugins
