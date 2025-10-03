import { useAtomValue } from '~node_modules/jotai'
import { DebugMode } from '~shared/constants'
import { debugAtom } from '~sidepanel/atom/windowAtom'

export function useDebug() {
	const debugMode = useAtomValue(debugAtom)
	// 开发环境或生产环境且 debug 模式为开启时，返回 true
	return process.env.NODE_ENV === 'development' || (process.env.NODE_ENV === 'production' && debugMode === DebugMode.ON)
}
