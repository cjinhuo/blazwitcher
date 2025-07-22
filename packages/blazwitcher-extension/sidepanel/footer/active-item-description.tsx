import EnterSvg from 'react:~assets/enter.svg'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import styled from 'styled-components'
import { FOOTER_DESCRIPTION_I18N_MAP } from '~shared/constants'
import { ItemType } from '~shared/types'
import { getItemType } from '~shared/utils'
import { activeItemAtom } from '~sidepanel/atom'
import useI18n from '~sidepanel/hooks/useI18n'

const Container = styled.div`
	display: flex;
  cursor: pointer;
	gap: 6px;
	align-items: center;
	padding: 2px 6px;
	border-radius: 4px;
	color: var(--color-neutral-5);
	font-size: 11px;
	font-weight: 600;
	&:hover {
		background-color: var(--semi-color-fill-0);
		color: var(--color-neutral-3);
		svg {
      fill: var(--color-neutral-3);
    }
	}
	&:active {
		background-color: var(--semi-color-fill-1);
	}
`

const SvgWithStrokeStyle = styled.div`
  display: flex;
	padding: 0px 4px;
	border-radius: 4px;
	border: none;
	background-color: var(--semi-color-fill-1);
  > svg {
    fill: var(--color-neutral-5);
  }
`

export default function ActiveItemDescription() {
	const i18n = useI18n()
	const activeItem = useAtomValue(activeItemAtom)
	const descriptionKey = useMemo(() => {
		if (!activeItem) return undefined
		const itemType = getItemType(activeItem)
		switch (itemType) {
			case ItemType.Tab:
				return i18n(FOOTER_DESCRIPTION_I18N_MAP.tab)
			case ItemType.Bookmark:
				return i18n(FOOTER_DESCRIPTION_I18N_MAP.bookmark)
			case ItemType.History:
				return i18n(FOOTER_DESCRIPTION_I18N_MAP.history)
			case ItemType.Plugin:
				return i18n(FOOTER_DESCRIPTION_I18N_MAP.plugin)
		}
	}, [activeItem, i18n])
	console.log('activeItem', activeItem)
	return (
		<Container>
			{descriptionKey}
			<SvgWithStrokeStyle>
				<EnterSvg width={18} height={18} />
			</SvgWithStrokeStyle>
		</Container>
	)
}
