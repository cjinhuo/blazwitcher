import { CONTEXT_MENU_HOMEPAGE, CONTEXT_MENU_SHORTCUT, GITHUB_URL, MAIN_WINDOW } from "~shared/constants";
import { dataProcessing } from "~shared/data-processing";
import { weakUpWindowIfActiveByUser } from "~shared/open-window";
import { closeCurrentWindowAndClearStorage } from "~shared/utils";

const appendContextMenus = () => {
  chrome.contextMenus.create(
    {
      ...CONTEXT_MENU_SHORTCUT,
      contexts: ["action"]
    }
  )
  chrome.contextMenus.create(
    {
      ...CONTEXT_MENU_HOMEPAGE,
      contexts: ["action"]
    },
    () => {
      chrome.contextMenus.onClicked.addListener((info) => {
        if (info.menuItemId === CONTEXT_MENU_SHORTCUT.id) {
          chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
        } else if(info.menuItemId === CONTEXT_MENU_HOMEPAGE.id) {
          chrome.tabs.create({ url: GITHUB_URL })
        }
      })
    }
  )
}



async function main() {
  weakUpWindowIfActiveByUser()
  appendContextMenus()
  // It can not be an sync calculation, since maybe the bookmarks data of user is way too large.
  const getProcessedData = dataProcessing()
  chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name === MAIN_WINDOW) {
      // 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
      port.postMessage(await getProcessedData())
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