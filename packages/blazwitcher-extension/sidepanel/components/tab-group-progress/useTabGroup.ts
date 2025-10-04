import { Toast } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
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

	// 监听来自 background 的消息
	useEffect(() => {
		const handleMessage = (message: any) => {
			switch (message.type) {
				case AI_TAB_GROUP_MESSAGE_TYPE: {
					const isProcessing = message.isProcessing as boolean
					const progress = message.progress as number | undefined
					const showReset = message.showReset as boolean
					setAITabGroupProgress({ isProcessing, progress, showReset })
					break
				}
				case ERROR_MESSAGE_TYPE: {
					Toast.error(message.error)
					break
				}
			}
		}

		chrome.runtime.onMessage.addListener(handleMessage)

		return () => {
			chrome.runtime.onMessage.removeListener(handleMessage)
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
		setAITabGroupProgress({ isProcessing: true, progress: 0, showReset: false })
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
		handleAIGroupingClick,
		resetAIGrouping,
		executeAIGrouping,
		getCurrentWindowData,
	}
}
