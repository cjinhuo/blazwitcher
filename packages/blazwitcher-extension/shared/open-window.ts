import {
	BodyBackgroundThemeColorMap,
	DisplayMode,
	LAST_ACTIVE_WINDOW_ID_KEY,
	SELF_WINDOW_ID_KEY,
	SELF_WINDOW_STATE,
	ThemeColor,
	URL_DARK_PARAM,
	type WindowConfig,
} from './constants'
import { getWindowConfig } from './data-processing'
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
	const isSmallerThanCurrentWindow =
		windowConfig.width <= currentWindow.width && windowConfig.height <= currentWindow.height
	if (
		(windowConfig.displayMode === DisplayMode.IFRAME || currentWindow.state === 'fullscreen') &&
		// only when the windowConfig is smaller than the current window, it will be opened in iframe mode, otherwise the content will be blocked
		isSmallerThanCurrentWindow &&
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

/**
 * 获取实际的主题颜色，如果是系统主题则在页面上下文中检测，在某些页面 sidepanel.html 下的 window.matchMedia?.('(prefers-color-scheme: dark)') 值和系统不符合
 */
async function getActualThemeByTab(theme: ThemeColor, tabId?: number): Promise<ThemeColor> {
	if (theme !== ThemeColor.System) {
		return theme
	}
	if (!tabId) {
		return ThemeColor.Light
	}
	try {
		const result = await chrome.scripting.executeScript({
			target: { tabId },
			world: 'ISOLATED',
			func: () => {
				return window.matchMedia?.('(prefers-color-scheme: dark)').matches
			},
			injectImmediately: true,
		})
		return result[0]?.result ? ThemeColor.Dark : ThemeColor.Light
	} catch (error) {
		console.error('Failed to detect system theme, fallback to light', error)
		return ThemeColor.Light
	}
}

async function injectScriptToOpenModal(windowConfig: WindowConfig) {
	try {
		const tabs = await tabsQuery({ active: true, currentWindow: true })
		const activeTab = tabs[0]
		const actualTheme = await getActualThemeByTab(windowConfig.theme, activeTab.id)
		const bodyBackground = BodyBackgroundThemeColorMap[actualTheme]

		if (activeTab.id) {
			const url = chrome.runtime.getURL('sidepanel.html')
			// https://chromewebstore.google.com/  插件商店也不能注入脚本
			// chrome:// 开头的不能注入 脚本
			await chrome.scripting.executeScript({
				target: { tabId: activeTab.id },
				world: 'ISOLATED',
				func: injectModal,
				args: [{ url, windowConfig, bodyBackground, urlDarkParam: URL_DARK_PARAM }, chrome.runtime.id],
				injectImmediately: true,
			})
		}
	} catch (error) {
		console.error('injectScriptToOpenModal error', error)
		return false
	}
	return true
}

/**
 * 注入 modal 到页面中，不能使用外部变量，只能通过参数传进来
 * @param url
 * @param windowConfig
 * @param bodyBackground
 * @param id
 * @returns
 */
async function injectModal(
	{
		url,
		windowConfig,
		bodyBackground,
		urlDarkParam,
	}: { url: string; windowConfig: WindowConfig; bodyBackground: string; urlDarkParam: string },
	id?: string
) {
	const iframeWidth = windowConfig.width
	// 27 是浏览器标题栏高度
	const iframeHeight = windowConfig.height - 27
	const NAMESPACE = `blazwitcher-chrome-ext-modal-${id || chrome.runtime.id}`
	if (process.env.NODE_ENV !== 'production') {
		console.log(
			'blazwitcher injectModalModal',
			NAMESPACE,
			'windowConfig',
			windowConfig,
			'bodyBackground',
			bodyBackground
		)
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
		background: ${bodyBackground};
		z-index: 10000000;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 0 10px rgba(0,0,0,0.16);
	`

	const iframe = document.createElement('iframe')
	const isSystemDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches
	iframe.src = isSystemDarkMode ? `${url}?${urlDarkParam}=${isSystemDarkMode}` : url
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
		background: rgba(0, 0, 0, 0.16);
		z-index: 9999999;
	`

	const container = document.createElement('div')
	container.id = NAMESPACE
	container.appendChild(overlay)
	container.appendChild(modal)

	const mount = () => {
		document.body.appendChild(container)
		// 在 sidepanel 中已监听 Escape 键盘事件，不需要重复监听
	}

	const unmount = () => {
		container.remove()
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
