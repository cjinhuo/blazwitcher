import { Toast } from '@douyinfe/semi-ui'
import { createStore, Provider } from 'jotai'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { traversalBookmarkTreeNode } from '~shared/data-processing'
import { ItemType, type ListItemType } from '~shared/types'
import { originalListAtom } from '~sidepanel/atom'
import { useBookmarkDelete } from '~sidepanel/hooks/useBookmarkDelete'

// 只加载真实 Toast，避免整个 Semi 入口引入与测试无关的 Canvas / Lottie 组件。
vi.mock('@douyinfe/semi-ui', async () => ({
	Toast: (await import('@douyinfe/semi-ui/lib/es/toast')).default,
}))

vi.mock('~sidepanel/atom', async () => {
	const { atom } = await import('jotai')
	return {
		originalListAtom: atom<ListItemType[]>([]),
		i18nAtom: atom(() => (key: string) => key),
	}
})

const getBookmark = vi.mocked(chrome.bookmarks.get as (id: string) => Promise<chrome.bookmarks.BookmarkTreeNode[]>)
const nodes = ['first', 'second', 'third'].map((id, index) => ({
	id,
	parentId: '1',
	index,
	title: id,
	url: `https://example.com/${id}`,
}))
const items = nodes.map(
	(node): ListItemType<ItemType.Bookmark> => ({
		itemType: ItemType.Bookmark,
		data: traversalBookmarkTreeNode([node], [], 'Bookmarks bar')[0],
	})
)

describe('bookmark undo with the real Semi Toast', () => {
	let store: ReturnType<typeof createStore>
	let root: Root
	let container: HTMLDivElement
	let remove: ReturnType<typeof useBookmarkDelete>

	function Harness() {
		remove = useBookmarkDelete()
		return null
	}

	beforeEach(() => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
		vi.clearAllMocks()
		vi.useFakeTimers()
		getBookmark.mockImplementation(async (id) => nodes.filter((node) => node.id === id))
		vi.mocked(chrome.bookmarks.remove).mockResolvedValue(undefined)
		vi.mocked(chrome.bookmarks.getChildren).mockResolvedValue([])
		vi.mocked(chrome.bookmarks.create).mockImplementation(async (details) => ({ ...details, id: 'restored' }))
		store = createStore()
		store.set(originalListAtom, items)
		container = document.createElement('div')
		document.body.append(container)
		root = createRoot(container)
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
			Toast.destroyAll()
			root.unmount()
		})
		container.remove()
		vi.useRealTimers()
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false })
	})

	it('renders only the latest Undo after successive deletions', async () => {
		for (const item of items) {
			await act(async () => remove(item))
			// 检查真实 DOM，避免只验证 Toast.close 调用却漏掉界面上的多个 Undo。
			expect(document.querySelectorAll('.semi-toast-content-text button')).toHaveLength(1)
		}
		await act(async () => (document.querySelector('.semi-toast-content-text button') as HTMLButtonElement).click())
		expect(chrome.bookmarks.create).toHaveBeenCalledTimes(1)
		expect(chrome.bookmarks.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'third' }))
	})

	it('gives the latest Undo a full ten seconds after replacing the previous notification', async () => {
		await act(async () => remove(items[0]))
		act(() => vi.advanceTimersByTime(8000))
		await act(async () => remove(items[1]))
		act(() => vi.advanceTimersByTime(9999))
		expect(document.querySelectorAll('.semi-toast-content-text button')).toHaveLength(1)
		expect(document.querySelector('.semi-toast-animation-hide')).toBeNull()
		act(() => vi.advanceTimersByTime(1))
		expect(document.querySelector('.semi-toast-animation-hide')).not.toBeNull()
		// 计时结束后，即使关闭动画尚未完成，Undo 也已经失效。
		await act(async () => (document.querySelector('.semi-toast-content-text button') as HTMLButtonElement).click())
		expect(chrome.bookmarks.create).not.toHaveBeenCalled()
	})
})
