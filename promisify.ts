/* global chrome */

export const tabsQuery = promisifyChromeMethod(
  chrome.tabs.query.bind(chrome.tabs)
)
export const tabsUpdate = promisifyChromeMethod(
  chrome.tabs.update.bind(chrome.tabs)
)
export const sendMessageToTab = promisifyChromeMethod(
  chrome.tabs.sendMessage.bind(chrome.tabs)
)
export const tabsReload = promisifyChromeMethod(
  chrome.tabs.reload.bind(chrome.tabs)
)
export const tabsRemove = promisifyChromeMethod(
  chrome.tabs.remove.bind(chrome.tabs)
)
export const getPlatformInfo = promisifyChromeMethod(
  chrome.runtime.getPlatformInfo.bind(chrome.runtime)
)
export const actionSetTitle = promisifyChromeMethod(
  chrome.action.setTitle.bind(chrome.action)
)
export const windowsGetCurrent = promisifyChromeMethod<Window>(
  chrome.windows.getCurrent.bind(chrome.windows)
)
export const storageGet = promisifyChromeMethod(
  chrome.storage.session.get.bind(chrome.storage.session)
)
export const storageSet = promisifyChromeMethod(
  chrome.storage.session.set.bind(chrome.storage.session)
)

function promisifyChromeMethod<T = any>(method: Function) {
  return (...args: any[]) =>
    new Promise<T>((resolve, reject) => {
      method(...args, (result) => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              chrome.runtime.lastError.message ||
                JSON.stringify(chrome.runtime.lastError)
            )
          )
        } else {
          resolve(result)
        }
      })
    })
}
