import { useAtomValue } from 'jotai'
import { activeItemAtom } from '~sidepanel/atom'

export default function ActiveItemDescription() {
	const activeItem = useAtomValue(activeItemAtom)
	console.log('activeItem', activeItem)
	return <>test</>
}
