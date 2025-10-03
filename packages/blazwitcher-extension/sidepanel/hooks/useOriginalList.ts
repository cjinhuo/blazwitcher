import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import type { AiGroupingProgress, ListItemType } from '~shared/types'
import { currentAITabGroupProgressAtom, originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import { processTabsForAI } from '../utils/process-tabs-by-window'
import { useDebug } from './useDebug'

export default function useOriginalList() {
	const debug = useDebug()
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const setWindowDataList = useSetAtom(windowDataListAtom)
	const setCurrentAITabGroupProgress = useSetAtom(currentAITabGroupProgressAtom)

	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener(
			(message: {
				processedList: ListItemType[]
				lastTimeTabGroupProgress: AiGroupingProgress
			}) => {
				const { processedList, lastTimeTabGroupProgress } = message

				portConnectStatus = true
				// TODO:看下是否要在background中处理processedList
				const windowDataList = processTabsForAI(processedList)
				if (debug) {
					console.log('processedList', processedList)
					console.log('windowDataList for AI:', windowDataList)
				}
				setOriginalList(processedList)
				setWindowDataList(windowDataList)

				// 更新 AI 分组进度状态
				setCurrentAITabGroupProgress(lastTimeTabGroupProgress)
			}
		)

		const postMessageToCloseWindow = () => {
			if (!portConnectStatus) return
			port.postMessage({ type: 'close' })
			port.disconnect()
			portConnectStatus = false
		}

		window.addEventListener('unload', postMessageToCloseWindow)
		// 打开 debug 模式时，如果窗口失去焦点，则不关闭窗口
		if (!debug) {
			window.addEventListener('blur', postMessageToCloseWindow)
		}
		return () => {
			window.removeEventListener('unload', postMessageToCloseWindow)
			window.removeEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList, setWindowDataList, setCurrentAITabGroupProgress, debug])
	return originalList
}
