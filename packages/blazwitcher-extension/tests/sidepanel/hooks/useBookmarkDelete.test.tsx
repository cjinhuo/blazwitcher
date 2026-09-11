import { Toast } from '@douyinfe/semi-ui'
import { createStore, Provider } from 'jotai'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { traversalBookmarkTreeNode } from '~shared/data-processing'
import { ItemType, type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { originalListAtom } from '~sidepanel/atom'
import { useListOperations } from '~sidepanel/hooks/useOperations'

vi.mock('~sidepanel/atom', async () => {
	const { atom } = await import('jotai')
	return {
		originalListAtom: atom<ListItemType[]>([]),
		i18nAtom: atom(() => (key: string) => key),
	}
})

vi.mock('@douyinfe/semi-ui', () => ({
	Toast: { success: vi.fn(() => 'toast-id'), error: vi.fn(), close: vi.fn() },
}))

const getBookmark = vi.mocked(chrome.bookmarks.get as (id: string) => Promise<chrome.bookmarks.BookmarkTreeNode[]>)
const createBookmark = vi.mocked(
	chrome.bookmarks.create as (details: chrome.bookmarks.BookmarkCreateArg) => Promise<chrome.bookmarks.BookmarkTreeNode>
)

const node = { id: '42', parentId: '1', index: 0, title: 'Example', url: 'https://example.com' }
const makeBookmark = (bookmark = node): ListItemType<ItemType.Bookmark> => ({
	itemType: ItemType.Bookmark,
	data: traversalBookmarkTreeNode([bookmark], [], 'Bookmarks bar')[0],
})

describe('bookmark delete operation', () => {
	let store: ReturnType<typeof createStore>
	let root: Root
	let toastRoot: Root
	let container: HTMLDivElement
	let toastContainer: HTMLDivElement
	let operations: ReturnType<typeof useListOperations>

	function Harness() {
		operations = useListOperations()
		return null
	}

	beforeEach(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		vi.clearAllMocks()
		getBookmark.mockResolvedValue([{ ...node }])
		vi.mocked(chrome.bookmarks.remove).mockResolvedValue(undefined)
		vi.mocked(chrome.bookmarks.getChildren).mockResolvedValue([])
		createBookmark.mockResolvedValue({ ...node, id: '99' })
		store = createStore()
		store.set(originalListAtom, [makeBookmark()])
		container = document.createElement('div')
		toastContainer = document.createElement('div')
		document.body.append(container, toastContainer)
		root = createRoot(container)
		toastRoot = createRoot(toastContainer)
		act(() =>
			root.render(
				<Provider store={store}>
					<Harness />
				</Provider>
			)
		)
	})

	afterEach(() => {
		act(() => {
			root.unmount()
			toastRoot.unmount()
		})
		container.remove()
		toastContainer.remove()
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
	})

	async function deleteBookmark(item = makeBookmark()) {
		await act(async () => operations.handleOperations(OperationItemPropertyTypes.delete, item))
	}

	function renderUndo(index = 0) {
		const toast = vi.mocked(Toast.success).mock.calls[index][0] as { content: React.ReactNode }
		act(() => toastRoot.render(toast.content))
		return toastContainer.querySelector('button') as HTMLButtonElement
	}

	it('removes only the bookmark after Chrome succeeds, preserving concurrent updates and matching history IDs', async () => {
		let finishDelete!: () => void
		vi.mocked(chrome.bookmarks.remove).mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishDelete = resolve
				})
		)
		let deletion!: Promise<void>
		await act(async () => {
			deletion = operations.handleOperations(OperationItemPropertyTypes.delete, makeBookmark())
		})
		expect(store.get(originalListAtom)).toHaveLength(1)
		expect(Toast.success).not.toHaveBeenCalled()

		const history = { itemType: ItemType.History, data: { id: '42', url: node.url } }
		act(() => store.set(originalListAtom, (list) => [...list, history]))
		await act(async () => {
			finishDelete()
			await deletion
		})
		expect(store.get(originalListAtom)).toEqual([history])
		expect(chrome.history.deleteUrl).not.toHaveBeenCalled()
		expect(Toast.success).toHaveBeenCalledWith(expect.objectContaining({ duration: 10, showClose: true }))
	})

	it('keeps the list intact and shows an error when deletion fails', async () => {
		vi.mocked(chrome.bookmarks.remove).mockRejectedValueOnce(new Error('Managed bookmark'))
		await deleteBookmark()
		expect(store.get(originalListAtom)).toEqual([makeBookmark()])
		expect(Toast.error).toHaveBeenCalledWith('bookmarkDeleteFailed')
		expect(Toast.success).not.toHaveBeenCalled()
	})

	it('restores a searchable bookmark with its new ID without replacing newer list entries', async () => {
		await deleteBookmark()
		const button = renderUndo()
		const history = { itemType: ItemType.History, data: { id: 'new-history' } }
		act(() => store.set(originalListAtom, [history]))
		await act(async () => button.click())
		const list = store.get(originalListAtom)
		expect(list[0]).toEqual(history)
		expect(list[1]).toEqual(makeBookmark({ ...node, id: '99' }))
		expect(Toast.close).toHaveBeenCalledWith('toast-id')
	})

	it('allows retrying undo after an API failure', async () => {
		await deleteBookmark()
		const button = renderUndo()
		createBookmark.mockRejectedValueOnce(new Error('Temporary error'))
		await act(async () => button.click())
		expect(store.get(originalListAtom)).toEqual([])
		expect(Toast.error).toHaveBeenCalledWith('bookmarkRestoreFailed')
		expect(Toast.close).not.toHaveBeenCalled()
		expect(button.disabled).toBe(false)
		await act(async () => button.click())
		expect(store.get(originalListAtom)).toHaveLength(1)
	})

	it('ignores repeated undo clicks and keeps Enter away from list shortcuts', async () => {
		await deleteBookmark()
		const button = renderUndo()
		const windowKeydown = vi.fn()
		window.addEventListener('keydown', windowKeydown)
		try {
			button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
			expect(windowKeydown).not.toHaveBeenCalled()
		} finally {
			window.removeEventListener('keydown', windowKeydown)
		}
		await act(async () => {
			button.click()
			button.click()
		})
		await act(async () => button.click())
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(1)
		expect(store.get(originalListAtom)).toHaveLength(1)
	})

	it('keeps separate undo actions for consecutive deletions', async () => {
		const second = { ...node, id: '43', title: 'Second', url: 'https://second.com' }
		act(() => store.set(originalListAtom, [makeBookmark(), makeBookmark(second)]))
		getBookmark.mockImplementation(async (id) => [id === '42' ? node : second])
		createBookmark.mockImplementation(async (details) => ({ ...node, ...details, id: `restored-${details.title}` }))
		await deleteBookmark()
		await deleteBookmark(makeBookmark(second))
		expect(store.get(originalListAtom)).toEqual([])
		const secondUndo = renderUndo(1)
		await act(async () => secondUndo.click())
		const firstUndo = renderUndo(0)
		await act(async () => firstUndo.click())
		expect(store.get(originalListAtom).map((item) => item.data.id)).toEqual(['restored-Second', 'restored-Example'])
	})

	it('preserves bookmarks when deleting a history item with the same ID', async () => {
		const history = { itemType: ItemType.History, data: { id: '42', url: node.url } }
		act(() => store.set(originalListAtom, [makeBookmark(), history]))
		await act(async () => operations.handleOperations(OperationItemPropertyTypes.delete, history))
		expect(chrome.history.deleteUrl).toHaveBeenCalledWith({ url: node.url })
		expect(store.get(originalListAtom)).toEqual([makeBookmark()])
		expect(Toast.success).not.toHaveBeenCalled()
	})
})
