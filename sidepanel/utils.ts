import pinyin from "tiny-pinyin";





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