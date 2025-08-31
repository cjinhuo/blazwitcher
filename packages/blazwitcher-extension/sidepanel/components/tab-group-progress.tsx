import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import type { AiGroupingProgress, WindowData } from '~shared/types'
import { currentAITabGroupProgressAtom, languageAtom, windowDataListAtom } from '~sidepanel/atom'
import useI18n from '~sidepanel/hooks/useI18n'

const checkmark = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const Container = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 120px;
	height: 26px;
	padding: 0 12px;
	border-radius: 4px;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
		pointer-events: none;
	}
`

const ProgressBarWrapper = styled.div`
	flex: 1;
	min-width: 80px;
	max-width: 140px;
	height: 6px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	overflow: hidden;
	position: relative;
	box-shadow: inset 0 1px 2px rgba(53, 40, 40, 0.1);

	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
`

const ProgressBar = styled.div<{ $percentage: number; $color: string }>`
	height: 100%;
	width: ${(props) => props.$percentage}%;
	background: linear-gradient(90deg, ${(props) => props.$color} 0%, ${(props) => props.$color}dd 100%);
	border-radius: 3px;
	transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
		animation: progressShimmer 1.5s infinite;
	}

	@keyframes progressShimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
`

const ProgressText = styled.span<{ $percentage: number }>`
	font-size: 12px;
	font-weight: 700;
	color: ${(props) => getProgressColor(props.$percentage)};
	transition: all 0.3s ease;
	min-width: 32px;
	text-align: center;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`

const ColumnDivide = styled.div`
	width: 2px;
	height: 14px;
	border-radius: 4px;
	margin: 0 6px;
	background-color: var(--color-neutral-7);
`

const AIGroupingButton = styled.button`
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border: none;
	border-radius: 6px;
	padding: 6px 12px;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	min-width: 100px;
	height: 26px;
	position: relative;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
		transition: left 0.5s ease;
	}

	&:hover {
		background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);

		&::before {
			left: 100%;
		}
	}

	&:active {
		background: linear-gradient(135deg, #4f64c6 0%, #5f3780 100%);
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2), 0 4px 12px rgba(102, 126, 234, 0.3);
	}
`

const CheckmarkIcon = styled.div`
	width: 16px;
	height: 16px;
	margin-right: 8px;
	position: relative;
	animation: ${checkmark} 0.5s ease-out;

	&::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 8px;
		height: 4px;
		border: 2px solid white;
		border-top: none;
		border-right: none;
		transform: translate(-50%, -60%) rotate(-45deg);
	}
`

const ButtonContent = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
`

// 提取颜色选择逻辑为工具函数
const getProgressColor = (percentage: number) => {
	if (percentage === 100) return '#52c41a' // 绿色
	if (percentage >= 80) return '#1890ff' // 蓝色
	if (percentage >= 50) return '#faad14' // 橙色
	return '#ff4d4f' // 红色
}

export const TabGroupProgress: React.FC = () => {
	const [currentAITabGroupProgress, setCurrentAITabGroupProgress] = useAtom(currentAITabGroupProgressAtom)
	const windowDataList = useAtomValue(windowDataListAtom)
	const [isCompleted, setIsCompleted] = useState<boolean>(false)
	const i18n = useI18n()
	const language = useAtomValue(languageAtom)

	console.log('77777', currentAITabGroupProgress.isProcessing, currentAITabGroupProgress.percentage)

	// 监听来自 background 的实时进度更新
	useEffect(() => {
		const handleProgressUpdate = (message: any) => {
			if (message.type === 'tabGroupProgressUpdate') {
				const progress: AiGroupingProgress = message.progress
				console.log('收到实时进度更新:', progress)
				setCurrentAITabGroupProgress(progress)

				// 检查是否完成
				if (progress.percentage === 100 && !progress.isProcessing) {
					setIsCompleted(true)
					// 3秒后重置完成状态
					setTimeout(() => {
						setIsCompleted(false)
					}, 3000)
				}
			}
		}

		// 监听来自 background 的消息
		chrome.runtime.onMessage.addListener(handleProgressUpdate)

		// 清理函数
		return () => {
			chrome.runtime.onMessage.removeListener(handleProgressUpdate)
		}
	}, [setCurrentAITabGroupProgress])

	const handleAIGroupingClick = async () => {
		if (currentAITabGroupProgress.isProcessing) return

		try {
			// 设置初始进度状态
			const initialProgress: AiGroupingProgress = {
				isProcessing: true,
				totalOperations: 0,
				completedOperations: 0,
				percentage: 0,
			}
			setCurrentAITabGroupProgress(initialProgress)

			// 获取当前窗口ID
			const currentWindow = await chrome.windows.getCurrent()
			const currentWindowId = currentWindow.id

			// 从windowDataList中找到当前窗口的数据
			const currentWindowData = windowDataList.find((data) => data.windowId === currentWindowId)

			// AI 分组
			await handleTabGroupOperations(currentWindowData)
		} catch (error) {
			console.error('获取当前窗口数据失败:', error)
		}
	}

	const handleTabGroupOperations = async (currentWindowData: WindowData) => {
		try {
			await chrome.runtime.sendMessage({
				type: 'handleTabGroupOperations',
				currentWindowData,
				language,
			})
		} catch (error) {
			console.error('与 background 通信失败:', error)
		}
	}

	// 如果有正在进行的操作，显示进度条
	if (currentAITabGroupProgress.isProcessing) {
		const progressColor = getProgressColor(currentAITabGroupProgress.percentage)

		return (
			<>
				<Container>
					<ProgressBarWrapper>
						<ProgressBar $percentage={currentAITabGroupProgress.percentage} $color={progressColor} />
					</ProgressBarWrapper>
					<ProgressText $percentage={currentAITabGroupProgress.percentage}>
						{currentAITabGroupProgress.percentage}%
					</ProgressText>
				</Container>
				<ColumnDivide />
			</>
		)
	}

	return (
		<>
			<AIGroupingButton onClick={handleAIGroupingClick} disabled={false}>
				<ButtonContent>
					{isCompleted && <CheckmarkIcon />}
					{isCompleted ? i18n('aiGroupingCompleted') : i18n('aiGrouping')}
				</ButtonContent>
			</AIGroupingButton>
			<ColumnDivide />
		</>
	)
}
