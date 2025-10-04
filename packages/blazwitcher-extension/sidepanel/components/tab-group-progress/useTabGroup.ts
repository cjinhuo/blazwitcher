import { Toast } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
	AI_TAB_GROUP_MESSAGE_TYPE,
	ERROR_MESSAGE_TYPE,
	HANDLE_TAB_GROUP_MESSAGE_TYPE,
	LAST_ACTIVE_WINDOW_ID_KEY,
	RESET_AI_TAB_GROUP_MESSAGE_TYPE,
} from '~shared/constants'
import { storageGet } from '~shared/promisify'
import type { WindowData } from '~shared/types'
import { currentAITabGroupProgressAtom, windowDataListAtom } from '~sidepanel/atom'

export const useTabGroup = () => {
	const [currentAITabGroupProgress, setCurrentAITabGroupProgress] = useAtom(currentAITabGroupProgressAtom)
	const windowDataList = useAtomValue(windowDataListAtom)
	const [isCompleted, setIsCompleted] = useState<boolean>(false)

	// 监听来自 background 的实时进度更新
	useEffect(() => {
		const handleProgressUpdate = (message: any) => {
			if (message.type === AI_TAB_GROUP_MESSAGE_TYPE) {
				const isProcessing = message.isProcessing as boolean
				const progress = message.progress as number | undefined
				setCurrentAITabGroupProgress({ isProcessing, progress })

				// 检查是否完成
				if (progress === 100) {
					setIsCompleted(true)
					// 3秒后重置完成状态
					setTimeout(() => {
						setIsCompleted(false)
					}, 3000)
				}
			}
		}

		const handleErrorMessage = (message: any) => {
			if (message.type === ERROR_MESSAGE_TYPE) {
				Toast.error(message.error)
			}
		}

		chrome.runtime.onMessage.addListener(handleProgressUpdate)
		chrome.runtime.onMessage.addListener(handleErrorMessage)

		return () => {
			chrome.runtime.onMessage.removeListener(handleProgressUpdate)
			chrome.runtime.onMessage.removeListener(handleErrorMessage)
		}
	}, [setCurrentAITabGroupProgress])

	// 获取当前窗口数据
	const getCurrentWindowData = useCallback(async (): Promise<WindowData | undefined> => {
		try {
			// 获取当前窗口ID
			let currentWindowId: number
			const currentWindow = await chrome.windows.getCurrent()
			if (currentWindow?.type === 'popup') {
				// 当前window为扩展，需要找到上一个active的window
				const storage = await storageGet()
				const lastActiveWindowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
				currentWindowId = lastActiveWindowId
			} else {
				currentWindowId = currentWindow.id
			}
			// 从windowDataList中找到当前窗口的数据
			const result = windowDataList.find((data) => data.windowId === currentWindowId)
			console.log('get window data', result)
			return result
		} catch (error) {
			console.error('获取当前窗口数据失败:', error)
			return undefined
		}
	}, [windowDataList])

	// 执行 AI 分组操作
	const executeAIGrouping = useCallback(async (currentWindowData: WindowData) => {
		try {
			await chrome.runtime.sendMessage({
				type: HANDLE_TAB_GROUP_MESSAGE_TYPE,
				currentWindowData,
			})
		} catch (error) {
			console.error('executeAIGrouping: communicate with background error:', error)
			Toast.error('executeAIGrouping: communicate with background error')
		}
	}, [])

	const handleAIGroupingClick = useCallback(async () => {
		if (currentAITabGroupProgress.isProcessing) return
		const currentWindowData = await getCurrentWindowData()
		if (currentWindowData) {
			await executeAIGrouping(currentWindowData)
		}
	}, [currentAITabGroupProgress.isProcessing, getCurrentWindowData, executeAIGrouping])

	const resetAIGrouping = useCallback(async () => {
		try {
			await chrome.runtime.sendMessage({
				type: RESET_AI_TAB_GROUP_MESSAGE_TYPE,
			})
		} catch (error) {
			console.error('与 background 通信失败:', error)
			Toast.error('与 background 通信失败')
		}
	}, [])

	return {
		currentAITabGroupProgress,
		isCompleted,
		isProcessing: currentAITabGroupProgress.isProcessing,
		percentage: currentAITabGroupProgress.progress,
		handleAIGroupingClick,
		resetAIGrouping,
		executeAIGrouping,
		getCurrentWindowData,
	}
}
