import { useAtomValue } from 'jotai'
import { i18nAtom } from '~sidepanel/atom'

export default function useI18n() {
	const i18n = useAtomValue(i18nAtom)
	return i18n
}
