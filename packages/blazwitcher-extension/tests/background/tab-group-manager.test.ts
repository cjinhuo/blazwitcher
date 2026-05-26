import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TabGroupManager } from '~background/tab-group-manager'

vi.mock('~shared/utils', () => ({
	safeSendMessage: vi.fn().mockResolvedValue(undefined),
}))

function createMockReadableStream(chunks: string[]): ReadableStream {
	let index = 0
	return new ReadableStream({
		pull(controller) {
			if (index < chunks.length) {
				controller.enqueue(new TextEncoder().encode(chunks[index]))
				index++
			} else {
				controller.close()
			}
		},
	})
}

describe('TabGroupManager', () => {
	let manager: TabGroupManager

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		manager = new TabGroupManager()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	describe('constructor', () => {
		it('should initialize with default state', () => {
			const progress = manager.getProgress()
			expect(progress.progress).toBe(0)
			expect(progress.isProcessing).toBe(false)
			expect(progress.showReset).toBe(false)
			expect(progress.countdown).toBeUndefined()
		})

		it('should have undefined originalWindowData', () => {
			expect(manager.originalWindowData).toBeUndefined()
			expect(manager.originalWindowId).toBeUndefined()
		})
	})

	describe('setOriginalWindowData', () => {
		it('should set window data and window id', () => {
			const windowData = {
				windowId: 123,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 5, ungroupedTabs: 3, existingGroupsCount: 1 },
			}
			manager.setOriginalWindowData(windowData)
			expect(manager.originalWindowData).toBe(windowData)
			expect(manager.originalWindowId).toBe(123)
		})
	})

	describe('getProgress', () => {
		it('should return current progress state', () => {
			const progress = manager.getProgress()
			expect(progress).toHaveProperty('progress')
			expect(progress).toHaveProperty('isProcessing')
			expect(progress).toHaveProperty('showReset')
			expect(progress).toHaveProperty('countdown')
		})
	})

	describe('isSpecialPage (via private access)', () => {
		it('should identify chrome:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('chrome://settings')
			expect(isSpecial).toBe(true)
		})

		it('should identify chrome-extension:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('chrome-extension://abc/page.html')
			expect(isSpecial).toBe(true)
		})

		it('should identify about: as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('about:blank')
			expect(isSpecial).toBe(true)
		})

		it('should identify edge:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('edge://settings')
			expect(isSpecial).toBe(true)
		})

		it('should identify file:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('file:///tmp/test.html')
			expect(isSpecial).toBe(true)
		})

		it('should identify data: as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('data:text/html,<h1>hi</h1>')
			expect(isSpecial).toBe(true)
		})

		it('should identify javascript: as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('javascript:void(0)')
			expect(isSpecial).toBe(true)
		})

		it('should not flag http:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('http://example.com')
			expect(isSpecial).toBe(false)
		})

		it('should not flag https:// as special page', () => {
			const isSpecial = (manager as any).isSpecialPage('https://example.com')
			expect(isSpecial).toBe(false)
		})
	})

	describe('sendErrorMessage (via private access)', () => {
		it('should handle string error', () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			;(manager as any).sendErrorMessage('test error')
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'test error' }))
		})

		it('should handle Error object', () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			;(manager as any).sendErrorMessage(new Error('error msg'))
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'error msg' }))
		})

		it('should handle undefined error with default message', () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			;(manager as any).sendErrorMessage()
			expect(sendMsgSpy).toHaveBeenCalledWith(
				expect.objectContaining({ error: expect.stringContaining('coffee break') })
			)
		})

		it('should handle non-string non-Error types', () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			;(manager as any).sendErrorMessage(42)
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: '42' }))
		})
	})

	describe('resetToOriginalGrouping', () => {
		it('should do nothing if no original window data', async () => {
			await manager.resetToOriginalGrouping()
			expect(chrome.tabs.ungroup).not.toHaveBeenCalled()
		})

		it('should ungroup tabs that were originally ungrouped', async () => {
			manager.setOriginalWindowData({
				windowId: 1,
				ungroupedTabs: [
					{ itemType: 'tab' as any, data: { id: 10, title: 'T', url: 'u', host: 'h' } },
					{ itemType: 'tab' as any, data: { id: 11, title: 'T2', url: 'u2', host: 'h2' } },
				],
				existingGroups: [],
				summary: { totalTabs: 2, ungroupedTabs: 2, existingGroupsCount: 0 },
			})
			vi.mocked(chrome.tabs.ungroup).mockResolvedValue(undefined)
			await manager.resetToOriginalGrouping()
			expect(chrome.tabs.ungroup).toHaveBeenCalledWith([10, 11])
		})

		it('should restore existing groups', async () => {
			manager.setOriginalWindowData({
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [{ id: 100, title: 'Work', color: 'blue', tabs: [{ id: 20 }, { id: 21 }] }],
				summary: { totalTabs: 2, ungroupedTabs: 0, existingGroupsCount: 1 },
			})
			vi.mocked(chrome.tabs.group).mockResolvedValue(100)
			vi.mocked(chrome.tabGroups.update).mockResolvedValue({} as any)
			await manager.resetToOriginalGrouping()
			expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [20, 21], groupId: 100 })
			expect(chrome.tabGroups.update).toHaveBeenCalledWith(100, { title: 'Work', color: 'blue' })
		})

		it('should skip existing groups with no valid tab ids', async () => {
			manager.setOriginalWindowData({
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [{ id: 100, title: 'Empty', color: 'grey', tabs: [{ notId: 'x' }] }],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 1 },
			})
			await manager.resetToOriginalGrouping()
			expect(chrome.tabs.group).not.toHaveBeenCalled()
		})

		it('should focus the original window', async () => {
			manager.setOriginalWindowData({
				windowId: 42,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 0 },
			})
			await manager.resetToOriginalGrouping()
			expect(chrome.windows.update).toHaveBeenCalledWith(42, { focused: true })
		})
	})

	describe('showResetButton and hideResetButton', () => {
		it('should start countdown and hide after time expires', () => {
			;(manager as any).showResetButton()
			const progress1 = manager.getProgress()
			expect(progress1.showReset).toBe(true)
			expect(progress1.countdown).toBe(16)

			// Advance 5 seconds
			vi.advanceTimersByTime(5000)
			const progress2 = manager.getProgress()
			expect(progress2.countdown).toBe(11)

			// Advance to end
			vi.advanceTimersByTime(11000)
			const progress3 = manager.getProgress()
			expect(progress3.showReset).toBe(false)
			expect(progress3.countdown).toBeUndefined()
		})

		it('should clear previous timer when called again', () => {
			;(manager as any).showResetButton()
			vi.advanceTimersByTime(3000)
			expect(manager.getProgress().countdown).toBe(13)

			// Call again - should reset
			;(manager as any).showResetButton()
			expect(manager.getProgress().countdown).toBe(16)
		})

		it('hideResetButton should clear originalWindowData', () => {
			manager.setOriginalWindowData({
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 0 },
			})
			;(manager as any).hideResetButton()
			expect(manager.originalWindowData).toBeUndefined()
			expect(manager.originalWindowId).toBeUndefined()
		})
	})

	describe('execute', () => {
		it('should send error when fetch response is not ok', async () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					statusText: 'Internal Server Error',
				})
			)

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 0 },
			}
			await manager.execute(windowData)
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal Server Error' }))
		})

		it('should send error when fetch throws', async () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 0 },
			}
			await manager.execute(windowData)
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Network error' }))
		})

		it('should process stream and group tabs on finished', async () => {
			vi.mocked(chrome.tabs.get).mockResolvedValue({ id: 1, url: 'https://example.com' } as any)
			vi.mocked(chrome.tabs.group).mockResolvedValue(200)
			vi.mocked(chrome.tabGroups.update).mockResolvedValue({} as any)

			const streamChunks = [
				'data: {"content":{"progress":50,"newGroups":[{"tabIds":[1],"groupTitle":"Test","groupColor":"blue"}],"effectExistingGroups":[]},"status":"processing"}\n',
				'data: {"content":{"progress":100,"newGroups":[{"tabIds":[1],"groupTitle":"Test","groupColor":"blue"}],"effectExistingGroups":[]},"status":"finished"}\n',
			]
			const mockBody = createMockReadableStream(streamChunks)

			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					body: mockBody,
				})
			)

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 1, ungroupedTabs: 1, existingGroupsCount: 0 },
			}
			manager.setOriginalWindowData(windowData)
			await manager.execute(windowData)

			expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [1] })
			expect(chrome.tabGroups.update).toHaveBeenCalledWith(200, { title: 'Test', color: 'blue' })
		})

		it('should handle server error in stream', async () => {
			const sendMsgSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockReturnValue(Promise.resolve())
			const streamChunks = ['data: {"error":"Rate limit exceeded"}\n']
			const mockBody = createMockReadableStream(streamChunks)

			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					body: mockBody,
				})
			)

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 0, ungroupedTabs: 0, existingGroupsCount: 0 },
			}
			await manager.execute(windowData)
			expect(sendMsgSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Rate limit exceeded' }))
		})

		it('should filter special pages when grouping tabs', async () => {
			vi.mocked(chrome.tabs.get)
				.mockResolvedValueOnce({ id: 1, url: 'https://example.com' } as any)
				.mockResolvedValueOnce({ id: 2, url: 'chrome://settings' } as any)
			vi.mocked(chrome.tabs.group).mockResolvedValue(300)
			vi.mocked(chrome.tabGroups.update).mockResolvedValue({} as any)

			const streamChunks = [
				'data: {"content":{"progress":100,"newGroups":[{"tabIds":[1,2],"groupTitle":"Mixed","groupColor":"red"}],"effectExistingGroups":[]},"status":"finished"}\n',
			]
			const mockBody = createMockReadableStream(streamChunks)

			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					body: mockBody,
				})
			)

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 2, ungroupedTabs: 2, existingGroupsCount: 0 },
			}
			manager.setOriginalWindowData(windowData)
			await manager.execute(windowData)

			// Only tab 1 should be grouped (tab 2 is chrome:// special page)
			expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [1] })
		})

		it('should handle existing groups in stream response', async () => {
			vi.mocked(chrome.tabs.get).mockResolvedValue({ id: 5, url: 'https://test.com' } as any)
			vi.mocked(chrome.tabs.group).mockResolvedValue(50)

			const streamChunks = [
				'data: {"content":{"progress":100,"newGroups":[],"effectExistingGroups":[{"tabIds":[5],"groupId":50}]},"status":"finished"}\n',
			]
			const mockBody = createMockReadableStream(streamChunks)

			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					body: mockBody,
				})
			)

			const windowData = {
				windowId: 1,
				ungroupedTabs: [],
				existingGroups: [],
				summary: { totalTabs: 1, ungroupedTabs: 0, existingGroupsCount: 1 },
			}
			manager.setOriginalWindowData(windowData)
			await manager.execute(windowData)

			expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [5], groupId: 50 })
		})
	})
})
