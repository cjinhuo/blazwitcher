import {
	extractBoundaryMapping,
	isStrictnessSatisfied,
	mergeSpacesWithRanges,
	searchSentenceByBoundaryMapping,
} from 'text-search-engine'
import {
	DEFAULT_BOOKMARK_DISPLAY_COUNT,
	DEFAULT_HISTORY_DISPLAY_COUNT,
	DEFAULT_STRICTNESS_COEFFICIENT,
	LAST_ACTIVE_WINDOW_ID_KEY,
	SELF_WINDOW_ID_KEY,
	SELF_WINDOW_STATE,
} from './constants'
import { storageGet, storageRemove } from './promisify'
import { ItemType, type ListItemType, type Matrix } from './types'

export function isChineseChar(char) {
	const chineseCharRegex = /[\u4E00-\u9FFF]/
	return chineseCharRegex.test(char)
}

export function scrollIntoViewIfNeeded(element: HTMLElement, container: HTMLElement) {
	const containerRect = container.getBoundingClientRect()
	const elementRect = element.getBoundingClientRect()
	if (elementRect.top < containerRect.top) {
		container.scrollTop -= containerRect.top - elementRect.top
	} else if (elementRect.bottom > containerRect.bottom) {
		container.scrollTop += elementRect.bottom - containerRect.bottom + 4 // '+4' is for having margins with Footer Component
	}
}

export function isTabItem(item: ListItemType): item is ListItemType<ItemType.Tab> {
	return item.itemType === ItemType.Tab
}

export function isBookmarkItem(item: ListItemType): item is ListItemType<ItemType.Bookmark> {
	return item.itemType === ItemType.Bookmark
}

export function isHistoryItem(item: ListItemType): item is ListItemType<ItemType.History> {
	return item.itemType === ItemType.History
}

// todo 需要做一个每次首次都不需要等待的节流函数
export function throttle(delay: number) {
	let timer = undefined
	return function (fn: (args: any) => void, ...args) {
		if (timer) return
		if (timer === undefined) {
			fn.apply(this, args)
			timer = null
		}
		timer = setTimeout(() => {
			fn.apply(this, args)
			timer = null
		}, delay)
	}
}

export const closeCurrentWindowAndClearStorage = async () => {
	const storage = await storageGet()
	const selfWindowId = storage[SELF_WINDOW_ID_KEY]
	const selfWindowState = storage[SELF_WINDOW_STATE]
	await storageRemove(LAST_ACTIVE_WINDOW_ID_KEY)
	if (selfWindowId) {
		// repair the problem that switching in full-screen state cannot switch to the correct window
		selfWindowState === 'fullscreen' && (await sleep(100))
		await storageRemove(SELF_WINDOW_ID_KEY)
		try {
			// the target window may not exist, then throw an error
			await chrome.windows.remove(selfWindowId)
		} catch (error) {}
	}
	// 和父 window 通信，关闭全屏状态下的 modal
	window.parent.postMessage({ type: 'close' }, '*')
}

export const activeTab = async (item: ListItemType<ItemType.Tab>) => {
	await chrome.windows.update(item.data.windowId, { focused: true })
	await chrome.tabs.update(item.data.id, { active: true })
	closeCurrentWindowAndClearStorage()
}

export const createTabWithUrl = async (url: string) => {
	const storage = await storageGet()
	const lastActiveWindowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
	// need to focus the last active window to fix the bug of switching abort in arc browser
	await chrome.windows.update(lastActiveWindowId, { focused: true })
	await chrome.tabs.create({ url, windowId: lastActiveWindowId })
	closeCurrentWindowAndClearStorage()
}

export const handleItemClick = async (item: ListItemType) => {
	isTabItem(item) ? await activeTab(item) : await createTabWithUrl(item.data.url)
}

export const closeTab = async (item: ListItemType<ItemType.Tab>) => {
	await chrome.tabs.remove(item.data.id)
}

export const deleteItem = async (item: ListItemType) => {
	if (isHistoryItem(item)) {
		return await chrome.history.deleteUrl({ url: item.data.url })
	}
}

export const queryInNewTab = async (item: ListItemType) => {
	const q = item.data.url || item.data.title
	let url = ''
	if (isBookmarkItem(item)) {
		url = `chrome://bookmarks/?q=${q}`
	} else if (isHistoryItem(item)) {
		url = `chrome://history/?q=${q}`
	}
	await createTabWithUrl(url)
}

export function faviconURL(u: string) {
	const url = new URL(chrome.runtime.getURL('/_favicon/'))
	url.searchParams.set('pageUrl', u)
	url.searchParams.set('size', '24')
	return url.toString()
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isDarkMode() {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function setDarkTheme() {
	if (isDarkMode()) {
		document.body.classList.add('dark')
		document.body.setAttribute('theme-mode', 'dark')
	}
}

export function getCompositeSourceAndHost(title?: string, url?: string) {
	const host = new URL(url).host
	const compositeSource = `${title.toLocaleLowerCase().trim()}${host}`
	return {
		compositeSource,
		host,
		compositeBoundaryMapping: extractBoundaryMapping(compositeSource),
	}
}

/**
 * 将复合命中范围根据 source 长度拆分为多个 range
 * @param compositeHitRanges
 * @param compositeSourceLengths
 */
export function splitCompositeHitRanges(compositeHitRanges: Matrix, compositeSourceLengths: number[]) {
	if (compositeHitRanges.length < 1) return [compositeHitRanges]
	const result: (Matrix | undefined)[] = []
	const temp: Matrix = []
	let hitRangeIndex = 0
	let sourceIndex = 0
	let cumulativeSourceLength = compositeSourceLengths[sourceIndex]
	let currentRange = compositeHitRanges[hitRangeIndex]
	const append = (increaseSourceIndex = true) => {
		if (temp.length > 0) {
			// 减去前面累加 source 的长度
			const gap = compositeSourceLengths.slice(0, result.length).reduce((a, b) => a + b, 0)
			result.push([...temp.map(([a, b]) => [a - gap, b - gap] as [number, number])])
			temp.length = 0
		} else {
			result.push(undefined)
		}
		if (increaseSourceIndex) {
			cumulativeSourceLength += compositeSourceLengths[++sourceIndex]
		}
	}
	while (hitRangeIndex < compositeHitRanges.length && sourceIndex < compositeSourceLengths.length) {
		const [start, end] = currentRange
		const _index = cumulativeSourceLength - 1
		if (_index < start) {
			append()
		} else if (_index >= start && _index < end) {
			temp.push([start, _index])
			currentRange = [_index + 1, end]
			append()
		} else if (_index === end) {
			temp.push(currentRange)
			currentRange = compositeHitRanges[++hitRangeIndex]
			append()
		} else {
			// cumulativeSourceLength > end
			temp.push(currentRange)
			currentRange = compositeHitRanges[++hitRangeIndex]
		}
	}
	if (compositeSourceLengths.length - sourceIndex > 0) {
		append(false)
		result.push(...Array(compositeSourceLengths.length - sourceIndex - 1).fill(undefined))
	}
	return result
}

export const orderList = (list: ListItemType[]) => {
	const tabs: ListItemType<ItemType.Tab>[] = []
	const bookmarks: ListItemType<ItemType.Bookmark>[] = []
	const histories: ListItemType<ItemType.History>[] = []
	const set = new Set()
	for (const item of list) {
		const { title, url } = item.data
		const hasSameItemInTabs = () => {
			if (set.has(title) || (url && set.has(url))) {
				return true
			}
			set.add(title)
			set.add(url)
			return false
		}

		if (isTabItem(item)) {
			tabs.push(item)
			set.add(title)
			set.add(url)
		} else if (isBookmarkItem(item) && !hasSameItemInTabs()) {
			bookmarks.push(item)
		} else if (isHistoryItem(item) && !hasSameItemInTabs()) {
			histories.push(item)
		}
	}
	const compareForLastAccess = (a: ListItemType<ItemType.Tab>, b: ListItemType<ItemType.Tab>) =>
		a.data.lastAccessed ? b.data.lastAccessed - a.data.lastAccessed : -1

	const compareForLastVisitTime = (a: ListItemType<ItemType.History>, b: ListItemType<ItemType.History>) =>
		a.data.lastVisitTime ? b.data.lastVisitTime - a.data.lastVisitTime : -1

	const compareForHitRangeLength = (a: ListItemType, b: ListItemType) => {
		if (a.data.compositeHitRanges && b.data.compositeHitRanges) {
			return a.data.compositeHitRanges.length - b.data.compositeHitRanges.length
		}
		return 0
	}

	const compareForActiveStatus = (a: ListItemType<ItemType.Tab>, _b: ListItemType<ItemType.Tab>) =>
		a.data.active ? -1 : 1

	return [
		...tabs
			.filter((item) => !item.data.url.includes(chrome.runtime.id))
			.toSorted(compareForLastAccess)
			.toSorted(compareForHitRangeLength)
			.toSorted(compareForActiveStatus),
		...histories
			.toSorted(compareForLastVisitTime)
			.toSorted(compareForHitRangeLength)
			.slice(0, DEFAULT_HISTORY_DISPLAY_COUNT),
		...bookmarks.toSorted(compareForHitRangeLength).slice(0, DEFAULT_BOOKMARK_DISPLAY_COUNT),
	].toSorted(compareForHitRangeLength)
}

export const searchWithList = (list: ListItemType[], searchValue: string) => {
	if (searchValue === '') return list
	return list.reduce<ListItemType[]>((acc, item) => {
		let hitRanges: Matrix | undefined
		hitRanges = searchSentenceByBoundaryMapping(item.data.compositeBoundaryMapping, searchValue)
		if (hitRanges) {
			const mergedHitRanges = mergeSpacesWithRanges(item.data.compositeSource, hitRanges)
			if (isStrictnessSatisfied(DEFAULT_STRICTNESS_COEFFICIENT, searchValue, mergedHitRanges)) {
				const [titleHitRanges, hostHitRanges] = splitCompositeHitRanges(mergedHitRanges, [
					item.data.title.length,
					item.data.host.length,
				])
				acc.push({
					...item,
					data: { ...item.data, compositeHitRanges: mergedHitRanges, titleHitRanges, hostHitRanges },
				})
			}
		}
		return acc
	}, [])
}
