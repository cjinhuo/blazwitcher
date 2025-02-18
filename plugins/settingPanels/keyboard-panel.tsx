import { IconEdit } from '@douyinfe/semi-icons'
import { Button, Card, List, Modal, Toast } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'

const styles = {
	card: styled(Card)`
    width: 100%;
  `,
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
  `,
	modalSection: styled.div`
    margin-bottom: 16px;
    
    .label {
      font-weight: 500;
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

interface Shortcut {
	action: string
	shortcut: string
	description: string
}

export const KeyboardPanel: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [shortcuts, setShortcuts] = useState<Shortcut[]>([
		{
			action: i18n('openExtension'),
			shortcut: 'Ctrl + Shift + E',
			description: i18n('openExtensionDesc'),
		},
		{
			action: i18n('deleteTab'),
			shortcut: 'Ctrl + W',
			description: i18n('deleteTabDesc'),
		},
		{
			action: i18n('openInNewWindow'),
			shortcut: 'Ctrl + N',
			description: i18n('openInNewWindowDesc'),
		},
		{
			action: i18n('searchHistory'),
			shortcut: 'Ctrl + H',
			description: i18n('searchHistoryDesc'),
		},
	])

	const [isModalVisible, setIsModalVisible] = useState(false)
	const [currentShortcut, setCurrentShortcut] = useState<Shortcut | null>(null)
	const [tempKeys, setTempKeys] = useState('')
	const [editingIndex, setEditingIndex] = useState(-1)

	const handleEdit = (shortcut: Shortcut, index: number) => {
		setCurrentShortcut(shortcut)
		setTempKeys(shortcut.shortcut)
		setEditingIndex(index)
		setIsModalVisible(true)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.preventDefault()

		const keys: string[] = []
		if (e.ctrlKey) keys.push('Ctrl')
		if (e.shiftKey) keys.push('Shift')
		if (e.altKey) keys.push('Alt')
		if (e.metaKey) keys.push('⌘')

		if (!['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
			keys.push(e.key.toUpperCase())
		}

		setTempKeys(keys.join(' + '))
	}

	const handleOk = () => {
		if (!tempKeys) {
			Toast.error(i18n('pleaseInputShortcut'))
			return
		}

		const isDuplicate = shortcuts.some(
			(s, index) => index !== editingIndex && s.shortcut.toLowerCase() === tempKeys.toLowerCase()
		)

		if (isDuplicate) {
			Toast.error(i18n('shortcutAlreadyUsed'))
			return
		}

		setShortcuts(shortcuts.map((s, index) => (index === editingIndex ? { ...s, shortcut: tempKeys } : s)))

		setIsModalVisible(false)
		setCurrentShortcut(null)
		setTempKeys('')
		setEditingIndex(-1)
	}

	const handleCancel = () => {
		setIsModalVisible(false)
		setCurrentShortcut(null)
		setTempKeys('')
		setEditingIndex(-1)
	}

	return (
		<styles.card title={i18n('keyboardSettings')}>
			<List
				dataSource={shortcuts}
				renderItem={(item, index) => (
					<styles.listItem>
						<styles.shortcutDisplay>{item.shortcut}</styles.shortcutDisplay>
						<styles.mainContent>
							<styles.actionTitle>{item.action}</styles.actionTitle>
							<styles.description>{item.description}</styles.description>
						</styles.mainContent>
						{/* @ts-ignore */}
						<styles.editButton
							icon={<IconEdit />}
							theme='borderless'
							type='tertiary'
							onClick={() => handleEdit(item, index)}
						>
							{i18n('edit')}
						</styles.editButton>
					</styles.listItem>
				)}
			/>

			<Modal
				title={i18n('editShortcut')}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				destroyOnClose
			>
				{currentShortcut && (
					<div>
						<styles.modalSection>
							<div className='label'>{i18n('currentAction')}</div>
							<div className='content'>{currentShortcut.action}</div>
						</styles.modalSection>
						<styles.modalSection>
							<div className='label'>{i18n('functionDescription')}</div>
							<div className='content'>{currentShortcut.description}</div>
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
