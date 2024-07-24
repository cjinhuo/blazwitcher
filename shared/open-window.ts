import { SELF_WINDOW_ID_KEY } from "./constants"
import {
  getCurrentWindow,
  getDisplayInfo,
  getWindowById,
  storageGet,
  storageSet
} from "./promisify"

const SEARCH_WINDOW_WIDTH = 800
const SEARCH_WINDOW_HEIGHT = 500

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
  // if (currentWindow.state === 'fullscreen') {
  //   debugger
  //   chrome.sidePanel.setOptions({
  //     path: './sidepanel.html',
  //   })
  //   chrome.sidePanel.open({
  //     tabId: currentWindow.id,
  //   })
  //   return
  // }
  const displays = await getDisplayInfo()
  // find the display that the current window is in
  const focusedDisplay = displays.find((display) => {
    const { width, height, left, top } = display.bounds
    return (
      currentWindow.left >= left &&
      currentWindow.left < left + width &&
      currentWindow.top >= top &&
      currentWindow.top < top + height
    )
  })
  const { width, height, left, top } = focusedDisplay.bounds
  chrome.windows.create(
    {
      width: SEARCH_WINDOW_WIDTH,
      height: SEARCH_WINDOW_HEIGHT,
      left: Math.floor((width - SEARCH_WINDOW_WIDTH) / 2 + left),
      top: Math.floor((height - SEARCH_WINDOW_HEIGHT) / 2 + top),
      focused: true,
      type: "popup",
      url: "./sidepanel.html"
    },
    (window) => {
      storageSet({
        [SELF_WINDOW_ID_KEY]: window.id
      })
    }
  )
}

export function weakUpWindowIfActiveByUser() {
  chrome.action.onClicked.addListener(activeWindow)
  chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
      activeWindow()
    }
  })
}
