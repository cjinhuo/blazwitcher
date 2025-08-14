import { Progress } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const ProgressContainer = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: var(--color-normal-bg);
	border: 1px solid var(--color-neutral-8);
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	z-index: 10000;
	min-width: 300px;
`

const ProgressTitle = styled.div`
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 16px;
	color: var(--color-neutral-1);
	text-align: center;
`

const ProgressText = styled.div`
	font-size: 14px;
	color: var(--color-neutral-4);
	margin-bottom: 12px;
	text-align: center;
`

const ProgressBarWrapper = styled.div`
	margin-bottom: 12px;
`

const ProgressStats = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: var(--color-neutral-5);
`

interface ProgressData {
	total: number
	completed: number
	currentOperation: string
	percentage: number
}

interface TabGroupProgressProps {
	isVisible: boolean
	onComplete?: () => void
}

export const TabGroupProgress: React.FC<TabGroupProgressProps> = ({ isVisible, onComplete }) => {
	const [progress, setProgress] = useState<ProgressData | null>(null)

	useEffect(() => {
		if (!isVisible) {
			setProgress(null)
			return
		}

		const handleProgressUpdate = (message: any) => {
			if (message.type === 'tabGroupProgressUpdate') {
				setProgress(message.progress)
				// 100% done
				if (message.progress.percentage === 100) {
					setTimeout(() => {
						onComplete?.()
					}, 1500)
				}
			}
		}

		// 监听来自background的消息
		chrome.runtime.onMessage.addListener(handleProgressUpdate)

		return () => {
			chrome.runtime.onMessage.removeListener(handleProgressUpdate)
		}
	}, [isVisible, onComplete])

	if (!isVisible || !progress) {
		return null
	}

	return (
		<ProgressContainer>
			<ProgressTitle>AI 标签页分组</ProgressTitle>
			<ProgressText>{progress.currentOperation}</ProgressText>
			<ProgressBarWrapper>
				<Progress
					percent={progress.percentage}
					showInfo={false}
					size="large"
					stroke="var(--highlight-bg)"
				/>
			</ProgressBarWrapper>
			<ProgressStats>
				<span>进度: {progress.completed}/{progress.total}</span>
				<span>{progress.percentage}%</span>
			</ProgressStats>
		</ProgressContainer>
	)
}
