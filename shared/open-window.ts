import { LAST_ACTIVE_WINDOW_ID_KEY, SELF_WINDOW_ID_KEY, SELF_WINDOW_STATE } from './constants'
import { getCurrentWindow, getDisplayInfo, getWindowById, storageGet, storageSet, tabsQuery } from './promisify'

const SEARCH_WINDOW_WIDTH = 750
const SEARCH_WINDOW_HEIGHT = 450

// const SEARCH_WINDOW_WIDTH = 640
// const SEARCH_WINDOW_HEIGHT = 400
async function activeWindow() {
	const storage = await storageGet(SELF_WINDOW_ID_KEY)
	if (storage[SELF_WINDOW_ID_KEY]) {
		try {
			const _window = await getWindowById(Number(storage[SELF_WINDOW_ID_KEY]))
			chrome.windows.update(_window.id, { focused: true })
			return
		} catch (error) {}
	}
	const currentWindow = await getCurrentWindow()
	await storageSet({ [LAST_ACTIVE_WINDOW_ID_KEY]: currentWindow.id })
	// there is a bug in "window" platform. When the window state is maximized, the left and top are not correct.
	// Normally speaking left and top should be 0. But they are -7 in this case.So reset the left and top to 0 to fix it.
	if (currentWindow.state === 'fullscreen' && (await injectScriptToOpenModal())) {
		return
	}
	if (currentWindow.state === 'maximized') {
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		currentWindow.left >= -10 && currentWindow.left < 0 && (currentWindow.left = 0)
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
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
		width: SEARCH_WINDOW_WIDTH,
		height: SEARCH_WINDOW_HEIGHT,
		left: Math.floor((width - SEARCH_WINDOW_WIDTH) / 2 + left),
		top: Math.floor((height - SEARCH_WINDOW_HEIGHT) / 2 + top),
		focused: true,
		type: 'popup',
		url: './sidepanel.html',
	})
	storageSet({
		[SELF_WINDOW_ID_KEY]: _window.id,
		[SELF_WINDOW_STATE]: _window.state,
	})
}

async function injectScriptToOpenModal() {
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
				args: [url, chrome.runtime.id],
				injectImmediately: true,
			})
		}
	} catch (error) {
		return false
	}
	return true
}

function injectModal(url: string, id?: string) {
	const NAMESPACE = `blazwitcher-chrome-ext-modal-${id || chrome.runtime.id}`
	if (process.env.NODE_ENV !== 'production') {
		console.log('injectModal', NAMESPACE)
	}
	if (document.getElementById(NAMESPACE)) return

	const modal = document.createElement('div')
	modal.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 750px;
		height: 420px;
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

export function wakeUpWindowIfActiveByUser() {
	chrome.runtime.onInstalled.addListener((detail) => {
		// if (detail.reason === 'install') {
		// 	activeWindow()
		// }
	})
	chrome.action.onClicked.addListener(activeWindow)
	chrome.commands.onCommand.addListener((command) => {
		if (command === '_execute_action') {
			activeWindow()
		}
	})
}
