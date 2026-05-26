import { describe, expect, it, vi } from 'vitest'
import { timeAgo } from '~shared/time'

describe('timeAgo', () => {
	const mockI18n = vi.fn((key: string, ...args: any[]) => {
		const map: Record<string, string> = {
			justVisited: 'just now',
		}
		if (map[key]) return map[key]
		return `${key}:${args.join(',')}`
	})

	it('should return justVisited for < 20 seconds', () => {
		const now = Date.now()
		vi.setSystemTime(now)
		const result = timeAgo(now - 10 * 1000, mockI18n)
		expect(result).toBe('just now')
		vi.useRealTimers()
	})

	it('should return seconds ago for 20-60 seconds', () => {
		const now = Date.now()
		vi.useFakeTimers()
		vi.setSystemTime(now)
		const result = timeAgo(now - 30 * 1000, mockI18n)
		expect(mockI18n).toHaveBeenCalledWith('visitedSecondsAgo', 30)
		expect(result).toBe('visitedSecondsAgo:30')
		vi.useRealTimers()
	})

	it('should return minutes ago for 1-60 minutes', () => {
		const now = Date.now()
		vi.useFakeTimers()
		vi.setSystemTime(now)
		const result = timeAgo(now - 5 * 60 * 1000, mockI18n)
		expect(mockI18n).toHaveBeenCalledWith('visitedMinutesAgo', 5)
		expect(result).toBe('visitedMinutesAgo:5')
		vi.useRealTimers()
	})

	it('should return hours ago for 1-24 hours', () => {
		const now = Date.now()
		vi.useFakeTimers()
		vi.setSystemTime(now)
		const result = timeAgo(now - 3 * 3600 * 1000, mockI18n)
		expect(mockI18n).toHaveBeenCalledWith('visitedHoursAgo', 3)
		expect(result).toBe('visitedHoursAgo:3')
		vi.useRealTimers()
	})

	it('should return days ago for 1-7 days', () => {
		const now = Date.now()
		vi.useFakeTimers()
		vi.setSystemTime(now)
		const result = timeAgo(now - 3 * 86400 * 1000, mockI18n)
		expect(mockI18n).toHaveBeenCalledWith('visitedDaysAgo', 3)
		expect(result).toBe('visitedDaysAgo:3')
		vi.useRealTimers()
	})

	it('should return weeks ago for > 7 days', () => {
		const now = Date.now()
		vi.useFakeTimers()
		vi.setSystemTime(now)
		const result = timeAgo(now - 14 * 86400 * 1000, mockI18n)
		expect(mockI18n).toHaveBeenCalledWith('visitedWeeksAgo', 2)
		expect(result).toBe('visitedWeeksAgo:2')
		vi.useRealTimers()
	})
})
