import styled from 'styled-components'
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

export default function Footer() {
	const handleMouseDown = (e: React.MouseEvent) => {
		// 阻止点击footer空白处时搜索框失去焦点
		e.preventDefault()
	}

	return (
		<FooterContainer onMouseDown={handleMouseDown}>
			<LeftIcon />
			<Command />
		</FooterContainer>
	)
}
