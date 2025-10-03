import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import { originalListAtom } from '~sidepanel/atom'
import { useDebug } from './useDebug'

export default function useOriginalList() {
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	const debug = useDebug()
	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((processedList) => {
			portConnectStatus = true
			if (debug) {
				console.log('processedList', processedList)
			}
			setOriginalList(processedList)
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
			window.removeEventListener('unload', postMessageToCloseWindow)
			window.removeEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList, debug])
	return originalList
}
