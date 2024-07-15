import { SELF_WINDOW_ID_KEY } from "~shared/constants";
import { bookmarksProcessing } from "~shared/data-processing";
import { getCurrentWindow } from "~shared/promisify";





const SEARCH_WINDOW_WIDTH = 900
const SEARCH_WINDOW_HEIGHT = 500

chrome.action.onClicked.addListener(async () => {
  const currentWindow = await getCurrentWindow()
  chrome.windows.create(
    {
      width: SEARCH_WINDOW_WIDTH,
      height: SEARCH_WINDOW_HEIGHT,
      // use width instead of availWidth could make it looks more centered
      // todo 弹出窗口不在当前屏幕，会在主屏幕，怀疑是和 left 有关系
      left: Math.floor((currentWindow.width - SEARCH_WINDOW_WIDTH) / 2),
      top: Math.floor((currentWindow.height - SEARCH_WINDOW_HEIGHT) / 2),
      focused: true,
      type: "popup",
      url: "./sidepanel.html"
    },
    (window) => {
      chrome.storage.session.set({
        [SELF_WINDOW_ID_KEY]: window.id
      })
      console.log("created window", window)
    }
  )
})

function sendMessageToPopup() {
  chrome.runtime.sendMessage({
    type: "DATA_FROM_BACKGROUND",
    payload: "Hello from Background Script!"
  })
}

// Listener for connection from popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onMessage.addListener((message) => {
      if (message.type === "POPUP_OPENED") {
        sendMessageToPopup()
      }
    })
  }
})

async function main() {
  await bookmarksProcessing()
}

main()