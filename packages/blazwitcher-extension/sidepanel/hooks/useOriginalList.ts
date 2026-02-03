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

	const pendingChunks = useRef<ListItemType[]>([])
	const rafId = useRef<number | null>(null)

	const flushChunksRef = useRef<() => void>(() => {})
	const scheduleFlushRef = useRef<() => void>(() => {})

	flushChunksRef.current = () => {
		if (pendingChunks.current.length === 0) return
		const toAppend = pendingChunks.current
		pendingChunks.current = []
		setOriginalList((prev) => [...prev, ...toAppend])
	}

	scheduleFlushRef.current = () => {
		if (rafId.current !== null) return
		rafId.current = requestAnimationFrame(() => {
			rafId.current = null
			flushChunksRef.current()
			if (pendingChunks.current.length > 0) scheduleFlushRef.current()
		})
	}

	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((message: PortMessage) => {
			portConnectStatus = true
			if (message.type === PortMessageType.Initial) {
				setOriginalList(message.processedList)
				setAITabGroupProgress(message.lastTimeTabGroupProgress)
				if (debug) console.log('initial processedList', message.processedList)
			} else if (
				message.type === PortMessageType.TabChunk ||
				message.type === PortMessageType.HistoryChunk ||
				message.type === PortMessageType.BookmarkChunk
			) {
				pendingChunks.current.push(...message.data)
				scheduleFlushRef.current()
			} else if (message.type === PortMessageType.WindowDataList) {
				if (rafId.current !== null) {
					cancelAnimationFrame(rafId.current)
					rafId.current = null
				}
				flushChunksRef.current()
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
