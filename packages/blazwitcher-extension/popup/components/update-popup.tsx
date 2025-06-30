import { useAtomValue } from 'jotai'
import type React from 'react'
import styled, { keyframes } from 'styled-components'
import { CHROME_EXTENSIONS_URL, GITHUB_RELEASES_URL } from '~shared/constants'
import { i18nAtom } from '~sidepanel/atom'
import { ActionButtons } from './action-buttons'
import { FeatureList } from './feature-list'
import { UpdateHeader } from './update-header'

/**
 * 淡入上移动画
 * 从透明向上20px位置淡入到完全显示
 */
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

/**
 * 渐变边框动画
 * 背景位置从左到右再回到左的循环移动
 */
const gradientBorder = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const Container = styled.div`
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${fadeInUp} 0.6s ease-out;
  overflow: hidden;
`

const MainCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 8px 10px;
  margin-bottom: 10px;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(135, 206, 235, 0.15);
  
  /**
   * 渐变边框效果
   * 使用伪元素创建动态渐变边框
   */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px; /* 边框宽度 */
    background: linear-gradient(45deg, #87CEEB, #00BFFF, #87CEEB);
    background-size: 200% 200%;
    border-radius: 12px;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: ${gradientBorder} 4s ease infinite;
  }
`

const ReviewSection = styled.div`
  padding: 4px;
  border-radius: 8px;
  text-align: center; 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 191, 255, 0.1);
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`

const HeartIcon = styled.span`
  display: inline-block;
  color: #ef4444;
  margin-left: 4px;
  padding-bottom: 2px;
  font-size: 12px;
  animation: ${pulse} 1.7s infinite;
`

const Link = styled.span`
  font-size: 10px;
  color: #00BFFF;
  font-weight: 500;
  z-index: 1;
`

export const UpdatePopup: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const handleChromeStoreClick = () => {
		window.open(CHROME_EXTENSIONS_URL, '_blank')
	}

	const handleGitHubClick = () => {
		window.open(GITHUB_RELEASES_URL, '_blank')
	}

	return (
		<Container>
			<MainCard>
				<UpdateHeader />
				<FeatureList />
				<ReviewSection onClick={handleChromeStoreClick}>
					<Link>{i18n('hopeYouLikeIt')}</Link>
					<HeartIcon>♥</HeartIcon>
				</ReviewSection>
			</MainCard>

			<ActionButtons onGitHubClick={handleGitHubClick} />
		</Container>
	)
}
