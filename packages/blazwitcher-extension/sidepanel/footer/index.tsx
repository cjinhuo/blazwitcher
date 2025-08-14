import { useAtomValue } from 'jotai'
import { useState } from 'react'
import styled from 'styled-components'
import { windowDataListAtom } from '~sidepanel/atom'
import { TabGroupProgress } from '../components/tab-group-progress'
import ActiveItemDescription from './active-item-description'
import { Command } from './command'
import LeftIcon from './left-icon'

const FooterContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px;
	border-top: 1px solid var(--color-neutral-8);
	background-color: var(--color-linear-bg-start);
`

const RightContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`

const TestButton = styled.button`
	background-color: var(--color-neutral-6);
	border: 1px solid var(--color-neutral-5);
	border-radius: 4px;
	padding: 2px 8px;
	font-size: 12px;
	color: var(--color-neutral-1);
	cursor: pointer;
	
	&:hover {
		background-color: var(--color-neutral-5);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`

export default function Footer() {
	const windowDataList = useAtomValue(windowDataListAtom)
	const [isProgressVisible, setIsProgressVisible] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)

	const handleMouseDown = (e: React.MouseEvent) => {
		// 阻止点击footer空白处时搜索框失去焦点
		e.preventDefault()
	}

	const handleTestClick = async () => {
		if (isProcessing) return

		try {
			setIsProcessing(true)
			setIsProgressVisible(true)

			// 获取当前窗口ID
			const currentWindow = await chrome.windows.getCurrent()
			const currentWindowId = currentWindow.id

			// 从windowDataList中找到当前窗口的数据
			const currentWindowData = windowDataList.find((data) => data.windowId === currentWindowId)
			
			// 下载currentWindowData文件，这是user_content，可以在 test-ark.js中调试
			// const currentWindowDataFile = new Blob([JSON.stringify(currentWindowData)], { type: 'application/json' })
			// const currentWindowDataUrl = URL.createObjectURL(currentWindowDataFile)
			// const a = document.createElement('a')
			// a.href = currentWindowDataUrl
			// a.download = 'currentWindowData.json'
			// a.click()

			if (!currentWindowData) {
				console.error('未找到当前窗口数据')
				return
			}

			// AI 分组
			await handleTabGroupOperations(currentWindowData)
		} catch (error) {
			console.error('获取当前窗口数据失败:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleTabGroupOperations = async (currentWindowData: any) => {
		try {
			const response = await chrome.runtime.sendMessage({
				type: 'handleTabGroupOperations',
				currentWindowData,
			})

			if (response?.success) {
				console.log('Tab group 操作成功:', response.message)
			} else {
				console.error('Tab group 操作失败:', response?.error ?? '未知错误')
			}
		} catch (error) {
			console.error('与 background 通信失败:', error)
		}
	}

	const handleProgressComplete = () => {
		setIsProgressVisible(false)
	}

	return (
		<>
			<FooterContainer onMouseDown={handleMouseDown}>
				<LeftIcon />
				<RightContainer>
					<TestButton 
						onClick={handleTestClick} 
						disabled={isProcessing}
					>
						{isProcessing ? '处理中...' : 'AI标签分类'}
					</TestButton>
					<ActiveItemDescription />
					<Command />
				</RightContainer>
			</FooterContainer>
			
			<TabGroupProgress 
				isVisible={isProgressVisible} 
				onComplete={handleProgressComplete}
			/>
		</>
	)
}
