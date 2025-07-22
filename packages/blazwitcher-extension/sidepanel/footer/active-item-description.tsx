import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { FOOTER_DESCRIPTION_I18N_MAP } from '~shared/constants'
import { ItemType } from '~shared/types'
import { getItemType } from '~shared/utils'
import { activeItemAtom } from '~sidepanel/atom'
import useI18n from '~sidepanel/hooks/useI18n'

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
	return <>{descriptionKey}</>
}
