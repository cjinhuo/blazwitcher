/** 删除书签并保留恢复所需的快照；恢复失败可重试，成功后不会重复创建。 */
export async function removeBookmarkWithUndo(id: string) {
	// 删除前读取最新位置，之前的删除操作可能已改变同级书签的下标。
	const [bookmark] = await chrome.bookmarks.get(id)
	if (!bookmark?.url || !bookmark.parentId) {
		throw new Error('Only bookmarks with a parent folder can be deleted')
	}
	const { parentId, index, title, url } = bookmark
	await chrome.bookmarks.remove(id)

	let restoration: Promise<chrome.bookmarks.BookmarkTreeNode> | undefined
	return () => {
		if (!restoration) {
			restoration = (async () => {
				const siblings = await chrome.bookmarks.getChildren(parentId)
				return chrome.bookmarks.create({
					parentId,
					index: index === undefined ? siblings.length : Math.min(index, siblings.length),
					title,
					url,
				})
			})().catch((error) => {
				restoration = undefined
				throw error
			})
		}
		return restoration
	}
}
