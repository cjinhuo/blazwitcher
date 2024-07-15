import pinyin from "tiny-pinyin";
import { ItemType, type ListItemType } from "./types";


export function isChineseChar(char) {
  const chineseCharRegex = /[\u4E00-\u9FFF]/
  return chineseCharRegex.test(char)
}

export interface RecordItem extends chrome.bookmarks.BookmarkTreeNode {
  searchTarget: string
  folderName: string
}

export const traversal = (
  bookmarks: chrome.bookmarks.BookmarkTreeNode[],
  result: RecordItem[] = [],
  parent?: chrome.bookmarks.BookmarkTreeNode
) => {
  bookmarks.forEach((bookmark) => {
    const { children, ...rest } = bookmark
    if (children) {
      traversal(children, result, rest)
    }
    if (rest.url) {
      const chineseChars = Array.from(rest.title).filter((char) =>
        isChineseChar(char)
      )
      result.push({
        ...rest,
        searchTarget: `${rest.title} ${pinyin.convertToPinyin(chineseChars.join(""), "", true)} ${rest.url.replace(/^https?:\/\//, "")}`,
        folderName: parent?.title ?? "root"
      })
    }
  })
  return result
}

export function scrollIntoViewIfNeeded(element: HTMLElement, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  console.log('containerRect', containerRect, 'elementRect', elementRect, 'container', container.scrollTop)
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