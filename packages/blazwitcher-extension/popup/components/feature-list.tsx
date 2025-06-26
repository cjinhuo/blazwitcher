import { useAtomValue } from 'jotai'
import type React from 'react'
import styled, { keyframes } from 'styled-components'
import { changelog } from '~popup/config/changelog'
import { languageAtom } from '~sidepanel/atom'

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const FeatureContainer = styled.div`
  margin-bottom: 8px;
`
const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
  /* 动画：延迟滑入 */
  animation: ${slideInLeft} 0.6s ease-out;
  animation-fill-mode: both;
  /* 最后一项移除底部间距 */
  &:last-child {
    margin-bottom: 0;
  }
`

const FeatureBullet = styled.div`
  width: 6px;
  height: 6px;
  background: #00BFFF;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  /* 蓝色发光阴影 */
  box-shadow: 0 0 6px rgba(0, 191, 255, 0.4);
`

const FeatureText = styled.div`
  color: #374151 !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
  flex: 1;
  
  font-weight: 400 !important;
`

export const FeatureList: React.FC = () => {
	const language = useAtomValue(languageAtom)
	const manifest = chrome.runtime.getManifest()
	const currentVersion = manifest.version
	const features = changelog.find((item) => item.version === currentVersion)?.features || []

	return (
		<FeatureContainer>
			{features.map((feature, index: number) => (
				<FeatureItem key={index.toString()}>
					{/* 圆点标记 */}
					<FeatureBullet />

					{/* 更新内容 */}
					<FeatureText>{feature[language]}</FeatureText>
				</FeatureItem>
			))}
		</FeatureContainer>
	)
}
