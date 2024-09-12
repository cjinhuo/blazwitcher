export function timeAgo(lastAccessed: number) {
	const now = Date.now()
	const diffInSeconds = Math.floor((now - lastAccessed) / 1000)

	const timeMappings = [
		{ threshold: 20, text: 'Just visited' },
		{ threshold: 60, text: (diff: number) => `Visited ${diff} seconds ago` },
		{ threshold: 3600, text: (diff: number) => `Visited ${Math.floor(diff / 60)} minutes ago` },
		{ threshold: 86400, text: (diff: number) => `Visited ${Math.floor(diff / 3600)} hours ago` },
		{ threshold: 604800, text: (diff: number) => `Visited ${Math.floor(diff / 86400)} days ago` },
		{ threshold: Number.POSITIVE_INFINITY, text: (diff: number) => `Visited ${Math.floor(diff / 604800)} weeks ago` },
	]

	for (const mapping of timeMappings) {
		if (diffInSeconds < mapping.threshold) {
			return typeof mapping.text === 'function' ? mapping.text(diffInSeconds) : mapping.text
		}
	}
}
