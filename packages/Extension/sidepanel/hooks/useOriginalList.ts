import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { MAIN_WINDOW } from '~shared/constants'
import { originalListAtom } from '~sidepanel/atom'

export default function useOriginalList() {
	const [originalList, setOriginalList] = useAtom(originalListAtom)
	useEffect(() => {
		let portConnectStatus = false
		const port = chrome.runtime.connect({ name: MAIN_WINDOW })
		port.onMessage.addListener((processedList) => {
			portConnectStatus = true
			if (process.env.NODE_ENV !== 'production') {
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
		if (process.env.NODE_ENV === 'production') {
			window.addEventListener('blur', postMessageToCloseWindow)
		}
	}, [setOriginalList])
	return originalList
}
