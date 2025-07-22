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
	transition: background-color 0.15s ease;
	&:hover {
		background-color: var(--semi-color-fill-0);
	}
`

const CommandLabel = styled.span`
	font-size: 11px;
	color: var(--semi-color-text-1);
	font-weight: 500;
	white-space: nowrap;
`

const _ShortcutContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 2px;
`

const KeyContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 18px;
	height: 18px;
	padding: 0 4px;
	border-radius: 3px;
	background-color: var(--semi-color-fill-1);
	border: 1px solid var(--semi-color-fill-0);
	font-family: monospace;
	font-size: 10px;
	font-weight: 600;
	color: var(--semi-color-text-1);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
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
