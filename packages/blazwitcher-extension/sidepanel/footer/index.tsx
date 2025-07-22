import styled from 'styled-components'
import ActiveItemDescription from './active-item-description'
import { Command } from './command'
import LeftIcon from './left-icon'

const FooterContainer = styled.div`
  flex: 0 0 30px;
  background-color: var(--color-neutral-8);
  border-top: 1px solid var(--color-neutral-7);
  padding: 0 10px;
  align-items: center;
  display: flex;
	justify-content: space-between;
  gap: 10px;
`
const RightContainer = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`

const ColumnDivide = styled.div`
	width: 2px;
	height: 14px;
	border-radius: 4px;
	background-color: var(--color-neutral-7);
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
				<ActiveItemDescription />
				<ColumnDivide />
				<Command />
			</RightContainer>
		</FooterContainer>
	)
}
