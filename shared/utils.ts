import { SELF_WINDOW_ID_KEY } from "./constants";
import { ItemType, type ListItemType } from "./types";


export function isChineseChar(char) {
  const chineseCharRegex = /[\u4E00-\u9FFF]/
  return chineseCharRegex.test(char)
}



export function scrollIntoViewIfNeeded(element: HTMLElement, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  if (elementRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - elementRect.top
  } else if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop += elementRect.bottom - containerRect.bottom
  }
}

export function isTabItem(item: ListItemType): item is ListItemType<ItemType.Tab> {
  return item.itemType === ItemType.Tab;
}

export function isBookmarkItem(
  item: ListItemType
): item is ListItemType<ItemType.Bookmark> {
  return item.itemType === ItemType.Bookmark
}

export function isHistoryItem(
  item: ListItemType
): item is ListItemType<ItemType.History> {
  return item.itemType === ItemType.History
}


// todo 需要做一个每次首次都不需要等待的节流函数
export function throttle(delay: number) {
  let timer = undefined
  return function (fn: Function, ...args) {
    if (timer) return
    if (timer === undefined) {
      fn.apply(this, args)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}



export const closeCurrentWindow = () => {
  chrome.storage.session.get(SELF_WINDOW_ID_KEY, (result) => {
    const selfWindowId = result[SELF_WINDOW_ID_KEY]
    selfWindowId && chrome.windows.remove(selfWindowId)
  })
}

export const activeTab = (item: ListItemType<ItemType.Tab>) => {
  chrome.tabs.update(item.data.id, {
    active: true
  })
}