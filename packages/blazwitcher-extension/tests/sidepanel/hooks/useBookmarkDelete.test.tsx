import { Toast } from '@douyinfe/semi-ui'
import { createStore, Provider } from 'jotai'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DefaultSearchConfig } from '~shared/constants'
import { traversalBookmarkTreeNode } from '~shared/data-processing'
import { ItemType, type ListItemType, OperationItemPropertyTypes } from '~shared/types'
import { orderList } from '~shared/utils'
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
	let anotherRowOperations: ReturnType<typeof useListOperations>

	function Harness() {
		operations = useListOperations()
		// 不同行各自调用 Hook，仍应共享同一个面板的 Undo 通知。
		anotherRowOperations = useListOperations()
		return null
	}

	beforeEach(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		vi.clearAllMocks()
		let toastSequence = 0
		vi.mocked(Toast.success).mockImplementation(() => `toast-${++toastSequence}`)
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
		expect(Toast.close).toHaveBeenCalledWith('toast-1')
	})

	it.each([
		0,
		4,
		DefaultSearchConfig.bookmarkDisplayCount - 1,
	])('returns undone bookmark %i to its visible position when the list exceeds the display limit', async (deletedIndex) => {
		const bookmarks = Array.from({ length: DefaultSearchConfig.bookmarkDisplayCount + 1 }, (_, index) =>
			makeBookmark({
				...node,
				id: String(index),
				index,
				title: `Bookmark ${index}`,
				url: `https://example.com/${index}`,
			})
		)
		act(() => store.set(originalListAtom, bookmarks))
		getBookmark.mockResolvedValue([bookmarks[deletedIndex].data])
		createBookmark.mockResolvedValue({ ...bookmarks[deletedIndex].data, id: 'restored' })
		await deleteBookmark(bookmarks[deletedIndex])
		const visibleAfterDelete = orderList(store.get(originalListAtom), DefaultSearchConfig)
		expect(visibleAfterDelete.some((item) => item.data.id === bookmarks[deletedIndex].data.id)).toBe(false)
		const undo = renderUndo()
		await act(async () => undo.click())
		const visibleAfterUndo = orderList(store.get(originalListAtom), DefaultSearchConfig)
		expect(visibleAfterUndo.map((item) => item.data.title)).toEqual(
			bookmarks.slice(0, DefaultSearchConfig.bookmarkDisplayCount).map((item) => item.data.title)
		)
		expect(visibleAfterUndo[deletedIndex].data.id).toBe('restored')
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

	it('only keeps the latest undo across deletions from different rows', async () => {
		const second = { ...node, id: '43', title: 'Second', url: 'https://second.com' }
		act(() => store.set(originalListAtom, [makeBookmark(), makeBookmark(second)]))
		getBookmark.mockImplementation(async (id) => [id === '42' ? node : second])
		createBookmark.mockImplementation(async (details) => ({ ...node, ...details, id: `restored-${details.title}` }))
		await deleteBookmark()
		await act(async () =>
			anotherRowOperations.handleOperations(OperationItemPropertyTypes.delete, makeBookmark(second))
		)
		expect(store.get(originalListAtom)).toEqual([])
		expect(Toast.close).toHaveBeenCalledWith('toast-1')
		// 旧按钮在关闭动画期间被点击，也不能恢复更早删除的书签。
		const firstUndo = renderUndo(0)
		await act(async () => firstUndo.click())
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()
		// 旧通知延迟触发 onClose，不能使新通知失效。
		const firstToast = vi.mocked(Toast.success).mock.calls[0][0] as { onClose: () => void }
		firstToast.onClose()
		const secondUndo = renderUndo(1)
		await act(async () => secondUndo.click())
		expect(store.get(originalListAtom).map((item) => item.data.id)).toEqual(['restored-Second'])
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(1)
		expect(Toast.close).toHaveBeenLastCalledWith('toast-2')
	})

	it('keeps the previous undo available if the next deletion fails', async () => {
		await deleteBookmark()
		vi.mocked(chrome.bookmarks.remove).mockRejectedValueOnce(new Error('Managed bookmark'))
		await deleteBookmark(makeBookmark({ ...node, id: '43' }))
		expect(Toast.success).toHaveBeenCalledTimes(1)
		expect(Toast.close).not.toHaveBeenCalled()
		const undo = renderUndo()
		await act(async () => undo.click())
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(1)
	})

	it('does not replace the latest undo when an earlier deletion completes late', async () => {
		const second = { ...node, id: '43', title: 'Second', url: 'https://second.com' }
		act(() => store.set(originalListAtom, [makeBookmark(), makeBookmark(second)]))
		getBookmark.mockImplementation(async (id) => [id === node.id ? node : second])
		const finish = new Map<string, () => void>()
		vi.mocked(chrome.bookmarks.remove).mockImplementation(
			(id) => new Promise<void>((resolve) => finish.set(id, resolve))
		)
		let firstDeletion!: Promise<void>
		let secondDeletion!: Promise<void>
		await act(async () => {
			firstDeletion = operations.handleOperations(OperationItemPropertyTypes.delete, makeBookmark())
			secondDeletion = anotherRowOperations.handleOperations(OperationItemPropertyTypes.delete, makeBookmark(second))
		})
		expect(finish.size).toBe(2)
		await act(async () => {
			finish.get(second.id)?.()
			await secondDeletion
		})
		await act(async () => {
			finish.get(node.id)?.()
			await firstDeletion
		})
		expect(store.get(originalListAtom)).toEqual([])
		expect(Toast.success).toHaveBeenCalledTimes(1)
		const undo = renderUndo()
		await act(async () => undo.click())
		expect(chrome.bookmarks.create).toHaveBeenCalledWith(
			expect.objectContaining({ title: second.title, url: second.url })
		)
	})

	it('ignores undo after its notification is closed or expires', async () => {
		await deleteBookmark()
		const undo = renderUndo()
		const toast = vi.mocked(Toast.success).mock.calls[0][0] as { onClose: () => void }
		toast.onClose()
		await act(async () => undo.click())
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()
		expect(store.get(originalListAtom)).toEqual([])
	})

	it('finishes an already started undo without closing a newer notification', async () => {
		const second = { ...node, id: '43', title: 'Second', url: 'https://second.com' }
		act(() => store.set(originalListAtom, [makeBookmark(), makeBookmark(second)]))
		getBookmark.mockImplementation(async (id) => [id === node.id ? node : second])
		await deleteBookmark()
		const firstUndo = renderUndo()
		let finishRestore!: (bookmark: chrome.bookmarks.BookmarkTreeNode) => void
		createBookmark.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finishRestore = resolve
				})
		)
		await act(async () => firstUndo.click())
		await deleteBookmark(makeBookmark(second))
		await act(async () => finishRestore({ ...node, id: 'restored-first' }))
		expect(Toast.close).not.toHaveBeenCalledWith('toast-2')
		const secondUndo = renderUndo(1)
		await act(async () => secondUndo.click())
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(2)
		expect(Toast.close).toHaveBeenLastCalledWith('toast-2')
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
