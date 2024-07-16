import { SELF_WINDOW_ID_KEY } from "./constants";
import { getCurrentWindow, storageGet, storageSet } from "./promisify";


const SEARCH_WINDOW_WIDTH = 900
const SEARCH_WINDOW_HEIGHT = 500

export function weakUpWindowIfActiveByUser() {
  chrome.action.onClicked.addListener(async () => {
    const storage = await storageGet(SELF_WINDOW_ID_KEY)
    if (storage[SELF_WINDOW_ID_KEY]) {
      chrome.windows.get(Number(storage[SELF_WINDOW_ID_KEY]), (window) => {
        chrome.windows.update(window.id, { focused: true })
      })
      return
    }
    const currentWindow = await getCurrentWindow()
    chrome.windows.create(
      {
        width: SEARCH_WINDOW_WIDTH,
        height: SEARCH_WINDOW_HEIGHT,
        // use width instead of availWidth could make it looks more centered
        // todo 弹出窗口不在当前屏幕，会在主屏幕，和 left 有关系，需要计算当前窗口距离最左侧（屏幕）的距离，可能横跨多个屏幕
        left: Math.floor((currentWindow.width - SEARCH_WINDOW_WIDTH) / 2),
        top: Math.floor((currentWindow.height - SEARCH_WINDOW_HEIGHT) / 2),
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
  })
}