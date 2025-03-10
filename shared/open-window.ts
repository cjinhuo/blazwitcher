import { getWindowConfig } from '~sidepanel/atom'
import {
	DisplayMode,
	LAST_ACTIVE_WINDOW_ID_KEY,
	SELF_WINDOW_ID_KEY,
	SELF_WINDOW_STATE,
	type WindowConfig,
} from './constants'
import { getCurrentWindow, getDisplayInfo, getWindowById, storageGet, storageSet, tabsQuery } from './promisify'

async function activeWindow() {
	const sessionStorage = await storageGet(SELF_WINDOW_ID_KEY)
	if (sessionStorage[SELF_WINDOW_ID_KEY]) {
		try {
			const _window = await getWindowById(Number(sessionStorage[SELF_WINDOW_ID_KEY]))
			chrome.windows.update(_window.id, { focused: true })
			return
		} catch (_error) {}
	}
	const currentWindow = await getCurrentWindow()
	await storageSet({ [LAST_ACTIVE_WINDOW_ID_KEY]: currentWindow.id })
	const windowConfig = await getWindowConfig()
	// there is a bug in "window" platform. When the window state is maximized, the left and top are not correct.
	// Normally speaking left and top should be 0. But they are -7 in this case.So reset the left and top to 0 to fix it.
	if (
		(windowConfig.displayMode === DisplayMode.IFRAME || currentWindow.state === 'fullscreen') &&
		// 如果 injectScriptToOpenModal 执行失败，返回 false，则继续走 isolateWindow 模式
		(await injectScriptToOpenModal(windowConfig))
	) {
		return
	}
	if (currentWindow.state === 'maximized') {
		currentWindow.left >= -10 && currentWindow.left < 0 && (currentWindow.left = 0)
		currentWindow.top >= -10 && currentWindow.top < 0 && (currentWindow.top = 0)
	}

	const displays = await getDisplayInfo()
	// find the display that the current window is in
	const focusedDisplay =
		displays.find((display) => {
			const { width, height, left, top } = display.bounds
			// strict bounds detection
			return (
				currentWindow.left >= left &&
				currentWindow.left < left + width &&
				currentWindow.top >= top &&
				currentWindow.top < top + height
			)
		}) ||
		displays.find((display) => {
			const { width, height, left, top } = display.bounds
			//  loose bounds detection
			return (
				(currentWindow.left >= left && currentWindow.left < left + width) ||
				(currentWindow.top >= top && currentWindow.top < top + height)
			)
		}) ||
		displays.pop()

	// if focusedDisplay is not found, just lower the standard about bounds
	const { width, height, left, top } = focusedDisplay.bounds
	const _window = await chrome.windows.create({
		width: windowConfig.width,
		height: windowConfig.height,
		left: Math.floor((width - windowConfig.width) / 2 + left),
		top: Math.floor((height - windowConfig.height) / 2 + top),
		focused: true,
		type: 'popup',
		url: './sidepanel.html',
	})
	storageSet({
		[SELF_WINDOW_ID_KEY]: _window.id,
		[SELF_WINDOW_STATE]: _window.state,
	})
}

async function injectScriptToOpenModal(windowConfig: WindowConfig) {
	try {
		const tabs = await tabsQuery({ active: true, currentWindow: true })
		const activeTab = tabs[0]
		if (activeTab.id) {
			const url = chrome.runtime.getURL('sidepanel.html')
			// https://chromewebstore.google.com/  插件商店也不能注入脚本
			// chrome:// 开头的不能注入 脚本
			await chrome.scripting.executeScript({
				target: { tabId: activeTab.id },
				world: 'ISOLATED',
				func: injectModal,
				args: [url, windowConfig, chrome.runtime.id],
				injectImmediately: true,
			})
		}
	} catch (_error) {
		return false
	}
	return true
}

async function injectModal(url: string, windowConfig: WindowConfig, id?: string) {
	const iframeWidth = windowConfig.width
	// 27 是浏览器标题栏高度
	const iframeHeight = windowConfig.height - 27
	const NAMESPACE = `blazwitcher-chrome-ext-modal-${id || chrome.runtime.id}`
	if (process.env.NODE_ENV !== 'production') {
		console.log('injectModal', NAMESPACE, 'windowConfig', windowConfig)
	}
	if (document.getElementById(NAMESPACE)) return
	const modal = document.createElement('div')
	modal.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: ${iframeWidth}px;
		height: ${iframeHeight}px;
		background: white;
		z-index: 10000000;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 0 10px rgba(0,0,0,0.3);
	`

	const iframe = document.createElement('iframe')
	iframe.src = url
	iframe.style.cssText = `
		width: 100%;
		height: 100%;
		border: none;
	`

	modal.appendChild(iframe)

	// 创建遮罩层
	const overlay = document.createElement('div')
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
		z-index: 9999999;
	`

	const container = document.createElement('div')
	container.id = NAMESPACE
	container.appendChild(overlay)
	container.appendChild(modal)

	const mount = () => {
		document.body.appendChild(container)
		document.addEventListener('keydown', handleEscKey)
	}

	const unmount = () => {
		container.remove()
		document.removeEventListener('keydown', handleEscKey)
	}

	const handleEscKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			unmount()
		}
	}

	// 点击遮罩层时移除 container
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			unmount()
		}
	})

	window.addEventListener('message', (event) => {
		if (event.source === iframe.contentWindow) {
			switch (event.data.type) {
				case 'close':
					unmount()
					break
			}
		}
	})

	mount()
}

export function weakUpWindowIfActiveByUser() {
	chrome.runtime.onInstalled.addListener((detail) => {
		if (detail.reason === 'install') {
			activeWindow()
		}
	})
	chrome.action.onClicked.addListener(activeWindow)
	chrome.commands.onCommand.addListener((command) => {
		if (command === '_execute_action') {
			activeWindow()
		}
	})
}
