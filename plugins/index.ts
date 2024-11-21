import { filterByBookmarkPlugin, filterByHistoryPlugin, filterByTabPlugin } from './filters'
import { settingPlugin } from './setting'

const plugins = [filterByTabPlugin, filterByHistoryPlugin, filterByBookmarkPlugin, settingPlugin]

export default plugins
