import { useEffect, useRef } from 'react'
import { useDebug } from './useDebug'

let startMarkSet = false

export function usePerformanceReport(dataLength: number) {
	const isDebug = useDebug()
	const ttiReported = useRef(false)

	useEffect(() => {
		if (!isDebug) return
		if (typeof performance === 'undefined') return
		if (!startMarkSet) {
			startMarkSet = true
			performance.mark('sidepanel-start')
		}
	}, [isDebug])

	useEffect(() => {
		if (!isDebug) return
		if (ttiReported.current || dataLength === 0) return
		ttiReported.current = true
		if (typeof performance === 'undefined') return
		performance.mark('sidepanel-first-data')
		try {
			performance.measure('sidepanel-tti', 'sidepanel-start', 'sidepanel-first-data')
			const tti = performance.getEntriesByName('sidepanel-tti')?.[0]
			const nav = performance.getEntriesByType('navigation')?.[0] as PerformanceNavigationTiming
			const report: Record<string, number | string> = {
				'TTI (首屏有数据) ms': tti?.duration ?? 0,
			}
			if (nav) {
				report['DOMContentLoaded ms'] = nav.domContentLoadedEventEnd - nav.startTime
				report['load 完成 ms'] = nav.loadEventEnd - nav.startTime
			}
			console.log('[Sidepanel 性能]', report)
		} finally {
			performance.clearMarks('sidepanel-start')
			performance.clearMarks('sidepanel-first-data')
			performance.clearMeasures('sidepanel-tti')
		}
	}, [isDebug, dataLength])
}
