import styled from 'styled-components'
import { TabGroupProgress } from '~sidepanel/components/tab-group-progress'
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

export default function Footer() {
	const handleMouseDown = (e: React.MouseEvent) => {
		// 阻止点击footer空白处时搜索框失去焦点
		e.preventDefault()
	}

	return (
		<FooterContainer onMouseDown={handleMouseDown}>
			<LeftIcon />
			<RightContainer>
				<TabGroupProgress />
				<ActiveItemDescription />
				<Command />
			</RightContainer>
		</FooterContainer>
	)
}
