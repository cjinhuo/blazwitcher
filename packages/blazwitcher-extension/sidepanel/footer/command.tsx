import { useSetAtom } from 'jotai'
import styled from 'styled-components'
import { searchValueAtom } from '~sidepanel/atom'
import useI18n from '~sidepanel/hooks/useI18n'

const CommandContainer = styled.div`
	display: flex;
	background: transparent;
	align-items: center;
	height: 24px;
	gap: 8px;
	padding: 2px 6px;
	border-radius: 4px;
	cursor: pointer;
	color: var(--color-neutral-5);
	transition: all 0.15s ease;
	font-size: 11px;
	font-weight: 600;
	&:hover {
		background-color: var(--semi-color-fill-0);
		color: var(--color-neutral-3);
	}
	&:active {
		background-color: var(--semi-color-fill-1);
	}
`

const CommandLabel = styled.span`
	white-space: nowrap;
`

const KeyContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 18px;
	padding: 0 6px;
	border-radius: 4px;
	background-color: var(--semi-color-fill-1);
`

export function Command() {
	const setSearchValue = useSetAtom(searchValueAtom)
	const i18n = useI18n()

	const handleClick = () => {
		setSearchValue({
			value: '/s',
		})
		console.log('click')
	}
	return (
		<CommandContainer onClick={handleClick}>
			<CommandLabel>{i18n('setting')}</CommandLabel>
			<KeyContainer>/S</KeyContainer>
		</CommandContainer>
	)
}
