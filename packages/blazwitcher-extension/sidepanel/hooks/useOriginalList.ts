import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import type { AiGroupingProgress, ListItemType, WindowData } from '~shared/types'
import { aiTabGroupProgressAtom, originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import { useDebug } from './useDebug'

type PortMessage =
	| { type: 'initial'; processedList: ListItemType[]; lastTimeTabGroupProgress: AiGroupingProgress }
	| { type: 'tab_chunk'; data: ListItemType[] }
	| { type: 'history_chunk'; data: ListItemType[] }
	| { type: 'bookmark_chunk'; data: ListItemType[] }
	| { type: 'window_data_list'; data: WindowData[] }

export default function useOriginalList() {
	const debug = useDebug()
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const setWindowDataList = useSetAtom(windowDataListAtom)
	const setAITabGroupProgress = useSetAtom(aiTabGroupProgressAtom)
	// 缓冲队列：暂存接收到的分片数据，避免频繁 setState 导致卡顿
	const pendingChunks = useRef<ListItemType[]>([])
	const rafId = useRef<number | null>(null)

	// 将缓冲区的数据合并到列表状态中
	const flushChunks = useCallback(() => {
		if (pendingChunks.current.length === 0) return
		const toAppend = pendingChunks.current
		pendingChunks.current = []
		setOriginalList((prev) => [...prev, ...toAppend])
	}, [setOriginalList])

	// 使用 requestAnimationFrame 调度更新，确保 UI 线程空闲时才处理数据渲染
	const scheduleFlush = useCallback(() => {
		if (rafId.current !== null) return
		rafId.current = requestAnimationFrame(() => {
			rafId.current = null
			flushChunks()
			if (pendingChunks.current.length > 0) scheduleFlush()
		})
	}, [flushChunks])

	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((message: PortMessage) => {
			portConnectStatus = true
			if (message.type === 'initial') {
				// 首屏数据：直setData
				setOriginalList(message.processedList)
				setAITabGroupProgress(message.lastTimeTabGroupProgress)
				if (debug) console.log('initial processedList', message.processedList)
			} else if (
				message.type === 'tab_chunk' ||
				message.type === 'history_chunk' ||
				message.type === 'bookmark_chunk'
			) {
				// 后续分片数据：推入缓冲队列并调度更新
				pendingChunks.current.push(...message.data)
				scheduleFlush()
			} else if (message.type === 'window_data_list') {
				// 最终数据：强制刷新缓冲区，并设置 AI 分组所需的完整数据
				flushChunks()
				if (rafId.current !== null) {
					cancelAnimationFrame(rafId.current)
					rafId.current = null
				}
				setWindowDataList(message.data)
				if (debug) console.log('window_data_list for AI:', message.data)
			}
		})

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
			if (rafId.current !== null) {
				cancelAnimationFrame(rafId.current)
				rafId.current = null
			}
			window.removeEventListener('unload', postMessageToCloseWindow)
			window.removeEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList, setWindowDataList, setAITabGroupProgress, debug, flushChunks, scheduleFlush])
	return originalList
}
