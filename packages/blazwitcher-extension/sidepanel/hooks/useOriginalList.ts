import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import type { AiGroupingProgress, ListItemType } from '~shared/types'
import { currentAITabGroupProgressAtom, originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import { processTabsForAI } from '../utils/process-tabs-by-window'

export default function useOriginalList() {
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
				if (process.env.NODE_ENV !== 'production') {
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
		if (process.env.NODE_ENV === 'production') {
			window.addEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList, setWindowDataList, setCurrentAITabGroupProgress])
	return originalList
}
