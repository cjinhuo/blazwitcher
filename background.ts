import { MAIN_WINDOW } from "~shared/constants"
import { dataProcessing } from "~shared/data-processing"
import { weakUpWindowIfActiveByUser } from "~shared/open-window"
import { closeCurrentWindowAndClearStorage } from "~shared/utils"

async function main() {
  weakUpWindowIfActiveByUser()
  // It can not be an sync calculation, since maybe the bookmarks data of user is way too large.
  // todo fix it
  const getProcessedData = await dataProcessing()
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === MAIN_WINDOW) {
      // 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
      port.postMessage(getProcessedData())
      port.onMessage.addListener((message) => {
        if (message.type === "close") {
          {
            closeCurrentWindowAndClearStorage()
          }
        }
      })
    }
  })
}

main()
