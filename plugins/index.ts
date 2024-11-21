import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin } from './filters'
import { settingPlugin } from './setting'

// settingPlugin
const plugins = [filterByTabPlugin, filterByHistoryPlugin, filterByBookmarkPlugin]

export default plugins
