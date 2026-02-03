import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import { type ListItemType, type PortMessage, PortMessageType } from '~shared/types'
import { aiTabGroupProgressAtom, originalListAtom, windowDataListAtom } from '~sidepanel/atom'
import { useDebug } from './useDebug'

export default function useOriginalList() {
	const debug = useDebug()
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const setWindowDataList = useSetAtom(windowDataListAtom)
	const setAITabGroupProgress = useSetAtom(aiTabGroupProgressAtom)

	// 分片缓冲：暂存 tab/history/bookmark 分片，避免每条消息都触发 setState
	const pendingChunks = useRef<ListItemType[]>([])
	const rafId = useRef<number | null>(null)

	// 用 ref 存函数引用，effect 里只依赖 setter，无需把 flush/schedule 放进 deps
	const flushChunksRef = useRef<() => void>(() => {})
	const scheduleFlushRef = useRef<() => void>(() => {})

	// 将缓冲区的分片一次性合并进 originalList，并清空缓冲
	flushChunksRef.current = () => {
		if (pendingChunks.current.length === 0) return
		const toAppend = pendingChunks.current
		pendingChunks.current = []
		setOriginalList((prev) => [...prev, ...toAppend])
	}

	// 在下一帧执行 flush，若 flush 后仍有新分片则递归 schedule，合并为一次渲染
	scheduleFlushRef.current = () => {
		if (rafId.current !== null) return
		rafId.current = requestAnimationFrame(() => {
			rafId.current = null
			flushChunksRef.current()
			if (pendingChunks.current.length > 0) scheduleFlushRef.current()
		})
	}

	// 与 background 建立长连接，按序接收：首包 → 分片 → 最终 window 数据；卸载/失焦时通知 background 关闭
	useEffect(() => {
		let portConnectStatus = false // 仅收到过至少一条消息后才允许 close，避免连接未就绪就断开
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((message: PortMessage) => {
			portConnectStatus = true
			if (message.type === PortMessageType.Initial) {
				setOriginalList(message.processedList)
				setAITabGroupProgress(message.lastTimeTabGroupProgress)
			} else if (
				message.type === PortMessageType.TabChunk ||
				message.type === PortMessageType.HistoryChunk ||
				message.type === PortMessageType.BookmarkChunk
			) {
				// 分片：入缓冲 + rAF 调度合并，减少频繁 setState
				pendingChunks.current.push(...message.data)
				scheduleFlushRef.current()
			} else if (message.type === PortMessageType.WindowDataList) {
				if (rafId.current !== null) {
					cancelAnimationFrame(rafId.current)
					rafId.current = null
				}
				flushChunksRef.current()
				// AI 分组数据
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
	}, [setOriginalList, setWindowDataList, setAITabGroupProgress, debug])
	return originalList
}
