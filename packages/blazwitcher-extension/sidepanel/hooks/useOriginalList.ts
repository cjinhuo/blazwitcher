import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import type { AiGroupingProgress, ListItemType } from '~shared/types'
import { aiTabGroupProgressAtom, originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import { processTabsForAI } from '../../shared/process-tabs-by-window'
import { useDebug } from './useDebug'

export default function useOriginalList() {
	const debug = useDebug()
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const setWindowDataList = useSetAtom(windowDataListAtom)
	const setAITabGroupProgress = useSetAtom(aiTabGroupProgressAtom)

	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener(
			(message: {
				type: 'tab_data' | 'history_data' | 'bookmark_data' | 'tab_group_progress'
				data?: ListItemType[]
				isInitial?: boolean
				chunkIndex?: number
				isLastChunk?: boolean
				lastTimeTabGroupProgress?: AiGroupingProgress
				startTime?: number
			}) => {
				const { type, data = [], isInitial, lastTimeTabGroupProgress, startTime } = message
				if (startTime) console.log('post message time:', Date.now() - startTime)
				portConnectStatus = true
				if (type === 'tab_data') {
					setOriginalList((prev) => {
						const nextList = isInitial ? data : [...prev, ...data]
						setWindowDataList(processTabsForAI(nextList))
						return nextList
					})
				} else if (type === 'history_data') {
					console.log('history_data', data)
					setOriginalList((prev) => [...prev, ...data])
				} else if (type === 'bookmark_data') {
					console.log('bookmark_data', data)
					setOriginalList((prev) => [...prev, ...data])
				} else if (type === 'tab_group_progress' && lastTimeTabGroupProgress) {
					setAITabGroupProgress(lastTimeTabGroupProgress)
				}
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
	}, [setOriginalList, setWindowDataList, setAITabGroupProgress, debug])
	return originalList
}