import { IconEdit, IconRefresh } from '@douyinfe/semi-icons'
import { Button, Card, List, Modal, Toast, Typography } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CHROME_EXTENSIONS_SHORTCUTS_URL } from '~shared/constants'
import { OperationItemPropertyTypes } from '~shared/types'
import { createTabWithUrl, getExecuteActionShortcuts } from '~shared/utils'
import { type Shortcut, i18nAtom, shortcutsAtom, updateShortcutAtom } from '~sidepanel/atom'
import { restoreDefaultShortcutsAtom } from '~sidepanel/atom'
import { collectPressedKeys, isValidShortcut, standardizeKeyOrder } from '~sidepanel/utils/keyboardUtils'

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
			setStartExtensionShortcut(shortcut.split('').join(' + '))
		}
		fetchStartExtensionShortcut()
	}, [])

	const { Text } = Typography

	// 正在编辑的快捷键
	const [currentShortcut, setCurrentShortcut] = useState<Shortcut | null>(null)
	// 快捷键字符串 用 + 连接
	const [tempKeys, setTempKeys] = useState<string>('')
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

	const isEditable = (shortcut: Shortcut) => {
		return shortcut.id !== OperationItemPropertyTypes.open
	}

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

		const isDuplicate = shortcuts.some(
			(s) => s.id !== currentShortcut.id && s.shortcut.toLowerCase() === tempKeys.toLowerCase()
		)

		if (isDuplicate) {
			Toast.error(i18n('duplicateShortcut'))
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
			<List
				dataSource={shortcuts}
				renderItem={(item) => (
					<styles.listItem>
						<styles.shortcutDisplay>{item?.shortcut || startExtensionShortcut}</styles.shortcutDisplay>
						<styles.mainContent>
							<styles.actionTitle>
								<Text ellipsis={{ showTooltip: true }}>{i18n(item.action)}</Text>
							</styles.actionTitle>
						</styles.mainContent>
						<styles.editButton
							icon={<IconEdit />}
							theme='borderless'
							type='tertiary'
							onClick={() => handleEdit(item)}
							disabled={!isEditable(item)}
							style={{
								cursor: isEditable(item) ? 'pointer' : 'not-allowed',
								opacity: isEditable(item) ? 1 : 0.5,
							}}
						>
							{i18n('edit')}
						</styles.editButton>
					</styles.listItem>
				)}
			/>

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
