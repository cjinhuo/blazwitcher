import { windowsGetCurrent } from "~promisify";





const SEARCH_WINDOW_WIDTH = 900
const SEARCH_WINDOW_HEIGHT = 500
console.log('background running')
async function main(){
  
  
}
let isShow = false
chrome.action.onClicked.addListener(async () => {
  console.log("click")
  chrome.windows.getCurrent((currentWindow) => {
      chrome.windows.create(
        {
          width: SEARCH_WINDOW_WIDTH,
          height: SEARCH_WINDOW_HEIGHT,
          // use width instead of availWidth could make it looks more centered
          left: Math.floor(
            (currentWindow.width - SEARCH_WINDOW_WIDTH) / 2
          ),
          top: Math.floor(
            (currentWindow.height - SEARCH_WINDOW_HEIGHT) / 2
          ),
          focused: true,
          type: "popup",
          url: "./sidepanel.html"
        },
        (window) => {
          chrome.storage.session.set({
            selfWindowId: window.id
          })
          console.log("created window", window)
        }
      )
  })

})