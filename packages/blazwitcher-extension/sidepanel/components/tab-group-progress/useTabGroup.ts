import { Toast } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
import { safeSendMessage } from '~shared/utils'
import { aiTabGroupProgressAtom, pluginContextAtom, searchValueAtom, windowDataListAtom } from '~sidepanel/atom'

export const useTabGroup = () => {
	const [aiTabGroupProgress, setAITabGroupProgress] = useAtom(aiTabGroupProgressAtom)
	const windowDataList = useAtomValue(windowDataListAtom)
	const setPluginContext = useSetAtom(pluginContextAtom)
	const setSearchValue = useSetAtom(searchValueAtom)
	const [isCompleted, setIsCompleted] = useState<boolean>(false)

	// 监听来自 background 的实时进度更新
	useEffect(() => {
		const handleProgressUpdate = (message: any) => {
			if (message.type === AI_TAB_GROUP_MESSAGE_TYPE) {
				const isProcessing = message.isProcessing as boolean
				const progress = message.progress as number | undefined
				setAITabGroupProgress({ isProcessing, progress })

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
	}, [setAITabGroupProgress])

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
		safeSendMessage(
			{
				type: HANDLE_TAB_GROUP_MESSAGE_TYPE,
				currentWindowData,
			},
			(error) => {
				console.error('executeAIGrouping: communicate with background error:', error)
				Toast.error('executeAIGrouping: communicate with background error')
			}
		)
	}, [])

	const handleAIGroupingClick = useCallback(async () => {
		if (aiTabGroupProgress.isProcessing) return
		setAITabGroupProgress({ isProcessing: true, progress: 0 })
		const currentWindowData = await getCurrentWindowData()
		if (currentWindowData) {
			await executeAIGrouping(currentWindowData)
		}
	}, [aiTabGroupProgress.isProcessing, getCurrentWindowData, executeAIGrouping, setAITabGroupProgress])

	const resetAIGrouping = useCallback(async () => {
		safeSendMessage(
			{
				type: RESET_AI_TAB_GROUP_MESSAGE_TYPE,
			},
			(error) => {
				console.error('resetAIGrouping: communicate with background error:', error)
				Toast.error('resetAIGrouping: communicate with background error')
			}
		)
	}, [])

	useEffect(() => {
		setPluginContext((prev) => ({
			...prev,
			handleAIGroupingClick,
			setSearchValue: (value) => setSearchValue({ value }),
		}))
	}, [handleAIGroupingClick, setPluginContext, setSearchValue])
	return {
		aiTabGroupProgress,
		isCompleted,
		isProcessing: aiTabGroupProgress.isProcessing,
		percentage: aiTabGroupProgress.progress,
		handleAIGroupingClick,
		resetAIGrouping,
		executeAIGrouping,
		getCurrentWindowData,
	}
}
