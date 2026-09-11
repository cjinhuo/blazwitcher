import { Toast } from '@douyinfe/semi-ui'
import { useAtomValue, useSetAtom, useStore } from 'jotai'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { removeBookmarkWithUndo } from '~shared/bookmarks'
import { traversalBookmarkTreeNode } from '~shared/data-processing'
import { ItemType, type ListItemType } from '~shared/types'
import { i18nAtom, originalListAtom } from '~sidepanel/atom'

type UndoNotification = { toastId: string; valid: boolean }
type UndoState = { sequence: number; latestSuccess: number; active?: UndoNotification }

// 每一行和键盘操作都会调用此 Hook，按 store 共享状态，整个面板只保留最新一次成功删除的 Undo。
const undoStates = new WeakMap<ReturnType<typeof useStore>, UndoState>()

const UndoAction = styled.button`
	margin-left: 12px;
	padding: 2px 4px;
	border: 0;
	border-radius: 4px;
	background: transparent;
	color: var(--semi-color-primary);
	font: inherit;
	cursor: pointer;
	&:hover { text-decoration: underline; }
	&:focus-visible { outline: 2px solid var(--semi-color-primary); }
	&:disabled { cursor: wait; opacity: 0.6; }
`

const UndoButton = ({ label, onUndo }: { label: string; onUndo: () => Promise<void> }) => {
	const [loading, setLoading] = useState(false)
	const pending = useRef(false)

	return (
		<UndoAction
			type='button'
			disabled={loading}
			aria-busy={loading}
			onKeyDown={(event) => event.stopPropagation()}
			onClick={async () => {
				if (pending.current) return
				pending.current = true
				setLoading(true)
				try {
					await onUndo()
				} finally {
					pending.current = false
					setLoading(false)
				}
			}}
		>
			{label}
		</UndoAction>
	)
}

export const useBookmarkDelete = () => {
	const i18n = useAtomValue(i18nAtom)
	const setOriginalList = useSetAtom(originalListAtom)
	const store = useStore()

	return useCallback(
		async (item: ListItemType<ItemType.Bookmark>) => {
			let state = undoStates.get(store)
			if (!state) {
				state = { sequence: 0, latestSuccess: 0 }
				undoStates.set(store, state)
			}
			const sequence = ++state.sequence
			let restore: Awaited<ReturnType<typeof removeBookmarkWithUndo>>
			try {
				restore = await removeBookmarkWithUndo(item.data.id)
			} catch {
				Toast.error(i18n('bookmarkDeleteFailed'))
				return
			}

			// 记录当前书签位置，让最新一次 Undo 恢复的书签仍处于列表展示范围内。
			const bookmarkIndex = store
				.get(originalListAtom)
				.filter((entry) => entry.itemType === ItemType.Bookmark)
				.findIndex((entry) => entry.data.id === item.data.id)
			setOriginalList((list) =>
				list.filter((entry) => entry.itemType !== ItemType.Bookmark || entry.data.id !== item.data.id)
			)

			// 快速连续删除时，旧请求即使较晚完成，也不能覆盖更新的 Undo 通知。
			if (sequence < state.latestSuccess) return
			state.latestSuccess = sequence
			if (state.active) {
				state.active.valid = false
				Toast.close(state.active.toastId)
			}
			const notification: UndoNotification = { toastId: '', valid: true }
			state.active = notification
			const invalidate = () => {
				notification.valid = false
				if (state.active === notification) state.active = undefined
			}

			const toastId = Toast.success({
				duration: 10,
				showClose: true,
				onClose: invalidate,
				content: (
					<>
						{i18n('bookmarkDeleted')}
						<UndoButton
							label={i18n('undo')}
							onUndo={async () => {
								// 旧通知关闭动画期间仍可能收到点击，失效后直接忽略。
								if (!notification.valid) return
								try {
									const bookmark = await restore()
									const [data] = traversalBookmarkTreeNode([bookmark], [], item.data.folderName)
									setOriginalList((list) => {
										if (list.some((entry) => entry.itemType === ItemType.Bookmark && entry.data.id === bookmark.id)) {
											return list
										}
										const nextBookmark = list.filter((entry) => entry.itemType === ItemType.Bookmark)[bookmarkIndex]
										const insertIndex = nextBookmark ? list.indexOf(nextBookmark) : list.length
										return list.toSpliced(insertIndex, 0, { itemType: ItemType.Bookmark, data })
									})
									invalidate()
									Toast.close(toastId)
								} catch {
									Toast.error(i18n('bookmarkRestoreFailed'))
								}
							}}
						/>
					</>
				),
			})
			notification.toastId = toastId
		},
		[i18n, setOriginalList, store]
	)
}
