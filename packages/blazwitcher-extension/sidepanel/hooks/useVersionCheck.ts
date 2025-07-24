import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import type { GitHubRelease } from '~scripts/common'
import releases from '~shared/releases.json'
import { lastSeenVersionAtom } from '../atom'

function compareVersions(a: string, b: string): number {
	const aParts = a.replace(/^v?/, '').split('.').map(Number)
	const bParts = b.replace(/^v?/, '').split('.').map(Number)

	for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
		const aPart = aParts[i] || 0
		const bPart = bParts[i] || 0

		if (aPart > bPart) return 1
		if (aPart < bPart) return -1
	}

	return 0
}

export function useVersionCheck() {
	const lastSeenVersion = useAtomValue(lastSeenVersionAtom)
	const setLastSeenVersion = useSetAtom(lastSeenVersionAtom)

	useEffect(() => {
		const typedReleases = releases as GitHubRelease[]
		const latestRelease = typedReleases[0]

		// 如果这是第一次使用（lastSeenVersion为默认值'0.0.0'）
		// 并且有可用的release，将当前最新版本设为已读状态
		// 这样用户就不会在首次使用时看到所有历史版本的通知
		if (lastSeenVersion === '0.0.0' && latestRelease) {
			setLastSeenVersion(latestRelease.tag_name)
		}
	}, [lastSeenVersion, setLastSeenVersion])

	return {
		hasNewVersion: () => {
			const typedReleases = releases as GitHubRelease[]
			const latestRelease = typedReleases[0]
			return latestRelease && compareVersions(latestRelease.tag_name, lastSeenVersion) > 0
		},
		getLatestRelease: () => {
			const typedReleases = releases as GitHubRelease[]
			return typedReleases[0]
		},
		compareVersions,
	}
}
