import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { closeCurrentWindowAndClearStorage } from '~shared/utils'
import { compositionAtom } from '~sidepanel/atom'

/**
 * Hook to handle Escape key events with composition state awareness
 * Only listens to Escape key when not in composition mode (e.g., when typing Chinese)
 */
export const useEscapeKey = () => {
	const isComposition = useAtomValue(compositionAtom)

	const handleEscapeKey = useCallback((event: KeyboardEvent) => {
		if (event.code === 'Escape') {
			event.preventDefault()
			closeCurrentWindowAndClearStorage()
		}
	}, [])

	useEffect(() => {
		// Only listen to Escape key when not in composition mode
		if (!isComposition) {
			window.addEventListener('keydown', handleEscapeKey)
		}

		return () => {
			window.removeEventListener('keydown', handleEscapeKey)
		}
	}, [isComposition, handleEscapeKey])
}
