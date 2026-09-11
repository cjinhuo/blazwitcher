import { Toast } from '@douyinfe/semi-ui'
import { useAtomValue, useSetAtom, useStore } from 'jotai'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { removeBookmarkWithUndo } from '~shared/bookmarks'
import { traversalBookmarkTreeNode } from '~shared/data-processing'
import { ItemType, type ListItemType } from '~shared/types'
import { i18nAtom, originalListAtom } from '~sidepanel/atom'

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
			let restore: Awaited<ReturnType<typeof removeBookmarkWithUndo>>
			try {
				restore = await removeBookmarkWithUndo(item.data.id)
			} catch {
				Toast.error(i18n('bookmarkDeleteFailed'))
				return
			}

			// Keep the bookmark's position so Undo returns it inside the visible display limit.
			const bookmarkIndex = store
				.get(originalListAtom)
				.filter((entry) => entry.itemType === ItemType.Bookmark)
				.findIndex((entry) => entry.data.id === item.data.id)
			setOriginalList((list) =>
				list.filter((entry) => entry.itemType !== ItemType.Bookmark || entry.data.id !== item.data.id)
			)

			const toastId = Toast.success({
				duration: 10,
				showClose: true,
				content: (
					<>
						{i18n('bookmarkDeleted')}
						<UndoButton
							label={i18n('undo')}
							onUndo={async () => {
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
									Toast.close(toastId)
								} catch {
									Toast.error(i18n('bookmarkRestoreFailed'))
								}
							}}
						/>
					</>
				),
			})
		},
		[i18n, setOriginalList, store]
	)
}
