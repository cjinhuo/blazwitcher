import { Button } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import type React from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'

interface ActionButtonsProps {
	onGitHubClick: () => void
}

const GitHubIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor' aria-label='GitHub Icon'>
		<title>GitHub Icon</title>
		<path d='M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z' />
	</svg>
)

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StyledButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>`
  width: 100% !important;
  height: 28px !important;
  border-radius: 8px !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  
  /* 根据变体类型应用不同样式 */
  ${(props) =>
		props.variant === 'primary'
			? `
    /* 主要按钮：白底蓝边 */
    background: white !important;
    border: 1px solid #87CEEB !important;
    color: #1f2937 !important;
    
    /* 主要按钮悬停效果 */
    &:hover {
      background: #f8fafc !important;
      border-color: #00BFFF !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(135, 206, 235, 0.2);
    }
  `
			: `
    /* 次要按钮：浅灰底 */
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #6b7280 !important;
    
    /* 次要按钮悬停效果 */
    &:hover {
      background: white !important;
      color: #374151 !important;
      border-color: #cbd5e1 !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  `}
  
  .semi-icon {
    margin-right: 4px !important;
  }
`

const GitHubButton = styled(StyledButton)`
  /* 背景：天蓝色渐变 */
  background: linear-gradient(135deg, #87CEEB 0%, #00BFFF 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  
  /* GitHub按钮悬停效果 */
  &:hover {
    background: linear-gradient(135deg, #5fa8d3 0%, #0099cc 100%) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 191, 255, 0.25);
  }
`

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onGitHubClick }) => {
	const i18n = useAtomValue(i18nAtom)
	return (
		<ButtonContainer>
			<GitHubButton icon={<GitHubIcon />} onClick={onGitHubClick}>
				{i18n('clickToViewUpdateLog')}
			</GitHubButton>
		</ButtonContainer>
	)
}
