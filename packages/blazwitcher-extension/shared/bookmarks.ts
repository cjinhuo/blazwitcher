/** Remove a bookmark and retain a snapshot for a retryable, one-time restore. */
export async function removeBookmarkWithUndo(id: string) {
	// Read the current position: earlier deletions may have changed sibling indices.
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
