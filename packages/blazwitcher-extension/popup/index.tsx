import styled from 'styled-components'
import { UpdatePopup } from './components/update-popup'

const UpdateContainer = styled.div`
  width: 196px;
  position: relative;
  overflow: hidden;
`

export default function Popup() {
	chrome.runtime.connect({ name: 'popup' })

	return (
		<UpdateContainer>
			<UpdatePopup />
		</UpdateContainer>
	)
}
