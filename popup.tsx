import { useEffect } from "react"

function IndexPopup() {
  useEffect(() => {
    const SEARCH_WINDOW_WIDTH = 900
    const SEARCH_WINDOW_HEIGHT = 500
    chrome.windows.create(
      {
        width: SEARCH_WINDOW_WIDTH,
        height: SEARCH_WINDOW_HEIGHT,
        // use width instead of availWidth could make it looks more centered
        left: Math.floor((window.screen.width - SEARCH_WINDOW_WIDTH) / 2),
        top: Math.floor((window.screen.availHeight - SEARCH_WINDOW_HEIGHT) / 2),
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
  }, [])
  return (
    <div>
      <img src="chrome://favicon/https://github.com/XanderXu/SceneKit-AR-VR-information" />
    </div>
  )
}

export default IndexPopup
