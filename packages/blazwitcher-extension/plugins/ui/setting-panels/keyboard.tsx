import { IconEdit, IconInfoCircle, IconRefresh } from '@douyinfe/semi-icons'
import { Button, Card, List, Modal, Toast, Tooltip, Typography } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CHROME_EXTENSIONS_SHORTCUTS_URL } from '~shared/constants'
import { OperationItemPropertyTypes } from '~shared/types'
import { createTabWithUrl, getExecuteActionShortcuts } from '~shared/utils'
import {
	i18nAtom,
	restoreDefaultShortcutsAtom,
	type Shortcut,
	shortcutsAtom,
	updateShortcutAtom,
} from '~sidepanel/atom'
import { collectPressedKeys, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'

// 快捷键类型分组映射
const shortcutTypeGroups: Record<string, OperationItemPropertyTypes[]> = {
	tab: [
		OperationItemPropertyTypes.tabOpen,
		OperationItemPropertyTypes.tabOpenHere,
		OperationItemPropertyTypes.pin,
		OperationItemPropertyTypes.close,
	],
	history: [
		OperationItemPropertyTypes.historyOpen,
		OperationItemPropertyTypes.historyOpenHere,
		OperationItemPropertyTypes.delete,
	],
	bookmark: [OperationItemPropertyTypes.bookmarkOpen, OperationItemPropertyTypes.bookmarkOpenHere],
	common: [OperationItemPropertyTypes.start, OperationItemPropertyTypes.query],
}

// 获取快捷键所属的分组
const getShortcutGroup = (id: OperationItemPropertyTypes): keyof typeof shortcutTypeGroups | null => {
	for (const [group, ids] of Object.entries(shortcutTypeGroups)) {
		if (ids.includes(id)) {
			return group as keyof typeof shortcutTypeGroups
		}
	}
	return null
}

const styles = {
	card: styled(Card)`
    width: 100%;
  ` as typeof Card,
	shortcutDisplay: styled.div`
    font-family: monospace;
    background-color: var(--semi-color-fill-0);
    padding: 4px 12px;
    border-radius: 4px;
    width: 160px;
    flex-shrink: 0;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
	mainContent: styled.div`
    margin: 0 16px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
	actionTitle: styled.div`
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  `,
	actionTitleText: styled.div`
    position: relative;
    display: inline-block;
    max-width: 100%;
  `,
	tooltipIcon: styled(IconInfoCircle)`
    position: absolute;
    top: 0;
    right: -16px;
    color: var(--semi-color-text-2);
    cursor: pointer;
    flex-shrink: 0;
    
    &:hover {
      color: var(--semi-color-text-1);
    }
  `,
	description: styled.div`
    color: var(--semi-color-text-2);
    font-size: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  `,
	listItem: styled(List.Item)`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
    &:hover {
      background-color: var(--semi-color-fill-0);
    }
  `,
	editButton: styled(Button)`
    flex-shrink: 0;
  ` as typeof Button,
	modalSection: styled.div`
    margin-bottom: 16px;
    
    .label {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .content {
      color: var(--semi-color-text-0);
    }
  `,
	shortcutInput: styled.input`
    width: 100%;
    height: 40px;
    border: 1px solid var(--semi-color-border);
    border-radius: 4px;
    padding: 0 12px;
		color: var(--semi-color-text-0);
    background-color: var(--semi-color-fill-0);
    cursor: text;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.5;
    outline: none;
    
    &:focus {
      border-color: var(--semi-color-primary);
    }
  `,
	groupSection: styled.div`
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  `,
	groupTitle: styled(Typography.Title)`
    margin: 6px 0 6px 0 !important;
    font-size: 16px !important;
  ` as typeof Typography.Title,
}

export const KeyboardPanel: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [shortcuts] = useAtom(shortcutsAtom)
	const updateShortcut = useSetAtom(updateShortcutAtom)
	const resetConfig = useSetAtom(restoreDefaultShortcutsAtom)

	const [startExtensionShortcut, setStartExtensionShortcut] = useState<string | null>(null)
	useEffect(() => {
		const fetchStartExtensionShortcut = async () => {
			const shortcut = await getExecuteActionShortcuts()
			setStartExtensionShortcut(shortcut?.split('').join(' + ') || '')
		}
		fetchStartExtensionShortcut()
	}, [])

	const { Text } = Typography

	// 正在编辑的快捷键
	const [currentShortcut, setCurrentShortcut] = useState<Shortcut | null>(null)
	// 快捷键字符串 用 + 连接
	const [tempKeys, setTempKeys] = useState<string>('')
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

	// 将快捷键按类型分组
	const groupedShortcuts = useMemo(() => {
		return {
			common: shortcuts.filter((s) => shortcutTypeGroups.common.includes(s.id)),
			tab: shortcuts.filter((s) => shortcutTypeGroups.tab.includes(s.id)),
			history: shortcuts.filter((s) => shortcutTypeGroups.history.includes(s.id)),
			bookmark: shortcuts.filter((s) => shortcutTypeGroups.bookmark.includes(s.id)),
		}
	}, [shortcuts])

	// 打开编辑快捷键弹窗
	const handleEdit = (item: Shortcut) => {
		if (item.id === OperationItemPropertyTypes.start) {
			createTabWithUrl(CHROME_EXTENSIONS_SHORTCUTS_URL)
			return
		}
		setCurrentShortcut(item)
		setTempKeys(item.shortcut)
		setIsModalVisible(true)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.preventDefault()

		// 使用共享函数收集按键
		const keys = collectPressedKeys(e)

		// 标准化按键顺序
		const orderedKeys = standardizeKeyOrder(keys)
		setTempKeys(orderedKeys.join(' + '))
	}

	const handleOk = () => {
		if (!tempKeys || !currentShortcut) {
			Toast.error(i18n('shortcutRequired'))
			return
		}
		// 验证快捷键是否有效
		if (!isValidShortcut(tempKeys.split(' + '))) {
			Toast.error(i18n('invalidShortcut'))
			return
		}

		// 获取当前快捷键所属的分组
		const currentGroup = getShortcutGroup(currentShortcut.id)
		if (!currentGroup) {
			Toast.error(i18n('unknownOperation'))
			return
		}

		// 只检查同组内的快捷键是否冲突
		const groupIds = shortcutTypeGroups[currentGroup]
		const isDuplicateInSameGroup = shortcuts.some(
			(s) =>
				groupIds.includes(s.id) && s.id !== currentShortcut.id && s.shortcut.toLowerCase() === tempKeys.toLowerCase()
		)

		if (isDuplicateInSameGroup) {
			Toast.error(i18n('shortcutConflictInSameType'))
			return
		}

		updateShortcut({ id: currentShortcut.id, shortcut: tempKeys })
		setIsModalVisible(false)

		// 直接重置状态
		setCurrentShortcut(null)
		setTempKeys('')
	}

	const handleCancel = () => {
		setIsModalVisible(false)

		// 直接重置状态
		setCurrentShortcut(null)
		setTempKeys('')
	}

	// 渲染快捷键列表项
	const renderShortcutItem = (item: Shortcut) => (
		<styles.listItem key={item.id}>
			<styles.shortcutDisplay>{item?.shortcut || startExtensionShortcut}</styles.shortcutDisplay>
			<styles.mainContent>
				<styles.actionTitle>
					<styles.actionTitleText>
						<Text ellipsis={{ showTooltip: true }}>{i18n(item.action)}</Text>
						{item.tooltip && (
							<Tooltip content={i18n(item.tooltip)} trigger='hover'>
								<styles.tooltipIcon size='small' />
							</Tooltip>
						)}
					</styles.actionTitleText>
				</styles.actionTitle>
			</styles.mainContent>
			<styles.editButton icon={<IconEdit />} theme='borderless' type='tertiary' onClick={() => handleEdit(item)}>
				{i18n('edit')}
			</styles.editButton>
		</styles.listItem>
	)

	return (
		<styles.card
			title={i18n('keyboardSettings')}
			headerExtraContent={
				<Button type='tertiary' icon={<IconRefresh />} onClick={() => resetConfig()}>
					{i18n('restoreDefaults')}
				</Button>
			}
			style={{
				alignItems: 'center',
			}}
		>
			{/* 通用快捷键 - 不显示标题 */}
			{groupedShortcuts.common.length > 0 && (
				<List dataSource={groupedShortcuts.common} renderItem={renderShortcutItem} />
			)}

			{/* Tab 快捷键 */}
			{groupedShortcuts.tab.length > 0 && (
				<styles.groupSection>
					<styles.groupTitle heading={5}>{i18n('tabShortcuts')}</styles.groupTitle>
					<List dataSource={groupedShortcuts.tab} renderItem={renderShortcutItem} />
				</styles.groupSection>
			)}

			{/* History 快捷键 */}
			{groupedShortcuts.history.length > 0 && (
				<styles.groupSection>
					<styles.groupTitle heading={5}>{i18n('historyShortcuts')}</styles.groupTitle>
					<List dataSource={groupedShortcuts.history} renderItem={renderShortcutItem} />
				</styles.groupSection>
			)}

			{/* Bookmark 快捷键 */}
			{groupedShortcuts.bookmark.length > 0 && (
				<styles.groupSection>
					<styles.groupTitle heading={5}>{i18n('bookmarkShortcuts')}</styles.groupTitle>
					<List dataSource={groupedShortcuts.bookmark} renderItem={renderShortcutItem} />
				</styles.groupSection>
			)}

			<Modal title={i18n('editShortcut')} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
				{currentShortcut && (
					<div>
						<styles.modalSection>
							<div className='label'>{i18n('currentAction')}</div>
							<div className='content'>{i18n(currentShortcut.action)}</div>
						</styles.modalSection>
						<styles.modalSection>
							<div className='label'>{i18n('shortcut')}</div>
							<styles.shortcutInput
								tabIndex={0}
								onKeyDown={handleKeyDown}
								value={tempKeys}
								onChange={(e) => setTempKeys(e.target.value)}
								placeholder={i18n('pressShortcut')}
							/>
						</styles.modalSection>
					</div>
				)}
			</Modal>
		</styles.card>
	)
}
