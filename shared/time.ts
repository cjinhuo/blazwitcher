import type { i18nFunction } from '~i18n/atom'

export function timeAgo(lastAccessed: number, i18n: i18nFunction) {
	const now = Date.now()
	const diffInSeconds = Math.floor((now - lastAccessed) / 1000)

	const timeMappings = [
		{ threshold: 20, text: i18n('justVisited') },
		{ threshold: 60, text: (diff: number) => i18n('visitedSecondsAgo', diff) },
		{ threshold: 3600, text: (diff: number) => i18n('visitedMinutesAgo', Math.floor(diff / 60)) },
		{ threshold: 86400, text: (diff: number) => i18n('visitedHoursAgo', Math.floor(diff / 3600)) },
		{ threshold: 604800, text: (diff: number) => i18n('visitedDaysAgo', Math.floor(diff / 86400)) },
		{ threshold: Number.POSITIVE_INFINITY, text: (diff: number) => i18n('visitedWeeksAgo', Math.floor(diff / 604800)) },
	]

	for (const mapping of timeMappings) {
		if (diffInSeconds < mapping.threshold) {
			return typeof mapping.text === 'function' ? mapping.text(diffInSeconds) : mapping.text
		}
	}
}
