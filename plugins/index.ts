import { settingPlugin } from './setting'
import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin } from './filters'

const plugins = [filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin, settingPlugin]

export default plugins
