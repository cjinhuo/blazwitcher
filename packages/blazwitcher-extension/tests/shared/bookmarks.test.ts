import { beforeEach, describe, expect, it, vi } from 'vitest'
import { removeBookmarkWithUndo } from '~shared/bookmarks'

const createBookmark = vi.mocked(
	chrome.bookmarks.create as (details: chrome.bookmarks.BookmarkCreateArg) => Promise<chrome.bookmarks.BookmarkTreeNode>
)

const bookmark = {
	id: '42',
	parentId: '1',
	index: 2,
	title: 'Example',
	url: 'https://example.com',
}

describe('removeBookmarkWithUndo', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.mocked(chrome.bookmarks.get).mockResolvedValue([{ ...bookmark }])
		vi.mocked(chrome.bookmarks.remove).mockResolvedValue(undefined)
		vi.mocked(chrome.bookmarks.getChildren).mockResolvedValue([bookmark, bookmark, bookmark])
		createBookmark.mockResolvedValue({ ...bookmark, id: '99' })
	})

	it('deletes by ID and restores the current title, URL, folder and position with a new ID', async () => {
		const restore = await removeBookmarkWithUndo('42')
		expect(chrome.bookmarks.get).toHaveBeenCalledWith('42')
		expect(chrome.bookmarks.remove).toHaveBeenCalledWith('42')
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()

		expect(await restore()).toEqual({ ...bookmark, id: '99' })
		expect(chrome.bookmarks.getChildren).toHaveBeenCalledWith('1')
		expect(chrome.bookmarks.create).toHaveBeenCalledWith({
			parentId: '1',
			index: 2,
			title: 'Example',
			url: 'https://example.com',
		})
	})

	it('clamps the position when other bookmarks were deleted before undo', async () => {
		const restore = await removeBookmarkWithUndo('42')
		vi.mocked(chrome.bookmarks.getChildren).mockResolvedValue([])
		await restore()
		expect(chrome.bookmarks.create).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }))
	})

	it('appends when Chrome does not provide a position', async () => {
		vi.mocked(chrome.bookmarks.get).mockResolvedValue([{ ...bookmark, index: undefined }])
		const restore = await removeBookmarkWithUndo('42')
		await restore()
		expect(chrome.bookmarks.create).toHaveBeenCalledWith(expect.objectContaining({ index: 3 }))
	})

	it.each([
		{ nodes: [], kind: 'missing bookmarks' },
		{ nodes: [{ id: 'folder', title: 'Folder', parentId: '1' }], kind: 'folders' },
	])('refuses $kind', async ({ nodes }) => {
		vi.mocked(chrome.bookmarks.get).mockResolvedValue(nodes)
		await expect(removeBookmarkWithUndo('42')).rejects.toThrow()
		expect(chrome.bookmarks.remove).not.toHaveBeenCalled()
	})

	it('propagates deletion failures without creating an undo action', async () => {
		vi.mocked(chrome.bookmarks.remove).mockRejectedValue(new Error('Managed bookmark'))
		await expect(removeBookmarkWithUndo('42')).rejects.toThrow('Managed bookmark')
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()
	})

	it('creates only one bookmark for concurrent or repeated undo calls', async () => {
		const restore = await removeBookmarkWithUndo('42')
		const [first, second] = await Promise.all([restore(), restore()])
		expect(first).toEqual(second)
		expect(await restore()).toEqual(first)
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(1)
	})

	it('allows retrying a failed restore without changing the destination folder', async () => {
		const restore = await removeBookmarkWithUndo('42')
		createBookmark.mockRejectedValueOnce(new Error('Create failed'))
		await expect(restore()).rejects.toThrow('Create failed')
		expect(await restore()).toEqual({ ...bookmark, id: '99' })
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(2)
	})

	it('reports a missing parent without silently restoring into a different folder', async () => {
		const restore = await removeBookmarkWithUndo('42')
		vi.mocked(chrome.bookmarks.getChildren).mockRejectedValue(new Error('Folder removed'))
		await expect(restore()).rejects.toThrow('Folder removed')
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()
	})
})
