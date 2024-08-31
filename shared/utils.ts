import { SELF_WINDOW_ID_KEY } from "./constants";
import { getWindowById, storageGet, storageRemove } from "./promisify";
import { ItemType, type ListItemType, type Matrix } from "./types";


export function isChineseChar(char) {
  const chineseCharRegex = /[\u4E00-\u9FFF]/
  return chineseCharRegex.test(char)
}

export function scrollIntoViewIfNeeded(
  element: HTMLElement,
  container: HTMLElement
) {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  if (elementRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - elementRect.top
  } else if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop += elementRect.bottom - containerRect.bottom + 4 // '+4' is for having margins with Footer Component
  }
}

export function isTabItem(
  item: ListItemType
): item is ListItemType<ItemType.Tab> {
  return item.itemType === ItemType.Tab
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

export const closeCurrentWindowAndClearStorage = async () => {
  const storage = await storageGet(SELF_WINDOW_ID_KEY)
  const selfWindowId = storage[SELF_WINDOW_ID_KEY]
  if (selfWindowId) {
    await storageRemove(SELF_WINDOW_ID_KEY)
    try {
      await getWindowById(selfWindowId)
      chrome.windows.remove(selfWindowId).catch(() => {})
    } catch (error) { 
    }
  }
}

export const activeTab = (item: ListItemType) => {
  if (isTabItem(item)) {
    chrome.tabs.update(
      item.data.id,
      {
        active: true
      },
      (tab) => {
        chrome.windows.update(tab.windowId, { focused: true })
      }
    )
    closeCurrentWindowAndClearStorage()
  } else {
    window.open(item.data.url)
    closeCurrentWindowAndClearStorage()
  }
}

export function faviconURL(u: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"))
  url.searchParams.set("pageUrl", u)
  url.searchParams.set("size", "24")
  return url.toString()
}


export function isDarkMode() {
   return window.matchMedia &&
     window.matchMedia("(prefers-color-scheme: dark)").matches
}


/**
 * merge all blank spaces within hit ranges
 * @param source required, the source string you want to search
 * @param rawHitRanges required
 * @returns
 */
export function mergeSpacesWithRanges(source: string, rawHitRanges: Matrix) {
  if (rawHitRanges.length === 1) return rawHitRanges
  const hitRanges: Matrix = [rawHitRanges[0]]
  let [lastStart, lastEnd] = rawHitRanges[0]
  for (let i = 1; i < rawHitRanges.length; i++) {
    const [start, end] = rawHitRanges[i]
    const gap = source.slice(lastEnd + 1, start)

    // between two ranges, there is a blank space
    if (!gap.trim().length) {
      hitRanges[hitRanges.length - 1] = [lastStart, end]
    } else {
      lastStart = start
      hitRanges.push([start, end])
    }
    lastEnd = end
  }
  return hitRanges
}
