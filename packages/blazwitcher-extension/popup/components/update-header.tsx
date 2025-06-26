import { useAtomValue } from 'jotai'
import type React from 'react'
import styled, { keyframes } from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-2px) rotate(1deg);
  }
  75% {
    transform: translateY(-1px) rotate(-0.5deg);
  }
`

const glow = keyframes`
  0%, 100% {
    text-shadow: 0 0 8px rgba(135, 206, 235, 0.2);
  }
  50% {
    text-shadow: 0 0 12px rgba(135, 206, 235, 0.4);
  }
`

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 8px; 
`

const AppTitle = styled.div`
  color: #1f2937 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  margin-bottom: 4px !important;
  line-height: 1.2 !important;
  animation: ${glow} 3s ease-in-out infinite;
`

const UpdateTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 2px;
`

const UpdateText = styled.div`
  color: #374151 !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
`

const GhostIcon = styled.div`
  font-size: 18px;
  /* 动画：上下浮动效果 */
  animation: ${float} 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(135, 206, 235, 0.3));
  flex-shrink: 0;
`

export const UpdateHeader: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	return (
		<HeaderContainer>
			<AppTitle>🔍 Blazwicher</AppTitle>
			<UpdateTitle>
				<UpdateText>{i18n('updateNotificationDesc')}</UpdateText>
				<GhostIcon>👻</GhostIcon>
			</UpdateTitle>
		</HeaderContainer>
	)
}
