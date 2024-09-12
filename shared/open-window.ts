import { LAST_ACTIVE_WINDOW_ID_KEY, SELF_WINDOW_ID_KEY, SELF_WINDOW_STATE } from './constants'
import { getCurrentWindow, getDisplayInfo, getWindowById, storageGet, storageSet } from './promisify'

const SEARCH_WINDOW_WIDTH = 750
const SEARCH_WINDOW_HEIGHT = 495

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

export function weakUpWindowIfActiveByUser() {
	chrome.action.onClicked.addListener(activeWindow)
	chrome.commands.onCommand.addListener((command) => {
		if (command === '_execute_action') {
			activeWindow()
		}
	})
}
