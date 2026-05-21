import {
	isConsecutiveForChar,
	isStrictnessSatisfied,
	mergeSpacesWithRanges,
	searchSentenceByBoundaryMapping,
} from 'text-search-engine'
import type { SearchConfigAtomType } from '~sidepanel/atom'
import {
	DEFAULT_STRICTNESS_COEFFICIENT,
	LAST_ACTIVE_WINDOW_ID_KEY,
	SELF_WINDOW_ID_KEY,
	SELF_WINDOW_STATE,
	ThemeColor,
	URL_DARK_PARAM,
} from './constants'
import { storageGet, storageRemove } from './promisify'
import { ItemType, type ListItemType, type Matrix } from './types'

export { faviconURL } from './favicon'

/**
 * 滚动元素到视图中，如果元素在容器中，则滚动容器，如果元素在容器中，则滚动容器，如果元素在容器中，则滚动容器
 * @param element 需要滚动的元素
 * @param container 容器
 * @param divideElement 分割元素
 */
export function scrollIntoViewIfNeeded(element: HTMLElement, container: HTMLElement, divideElement?: HTMLElement) {
	const elementRect = element.getBoundingClientRect()
	let elementTop = elementRect.top
	let elementBottom = elementRect.bottom
	if (divideElement) {
		const divideRect = divideElement.getBoundingClientRect()
		if (divideRect.top < elementTop) {
			elementTop = divideRect.top
		}
		if (divideRect.bottom > elementBottom) {
			elementBottom = divideRect.bottom
		}
	}
	const containerRect = container.getBoundingClientRect()

	if (elementTop < containerRect.top) {
		container.scrollTop -= containerRect.top - elementTop
	} else if (elementBottom > containerRect.bottom) {
		container.scrollTop += elementBottom - containerRect.bottom + 4 // '+4' is for having margins with Footer Component
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

export function isDivideItem(item: ListItemType): item is ListItemType<ItemType.Divide> {
	return item.itemType === ItemType.Divide
}

export function isPluginItem(item: ListItemType): item is ListItemType<ItemType.Plugin> {
	return item.itemType === ItemType.Plugin
}

export function isSearchActionItem(item: ListItemType): item is ListItemType<ItemType.SearchAction> {
	return item.itemType === ItemType.SearchAction
}

export function getItemType(item: ListItemType) {
	if (isTabItem(item)) {
		return ItemType.Tab
	}
	if (isBookmarkItem(item)) {
		return ItemType.Bookmark
	}
	if (isHistoryItem(item)) {
		return ItemType.History
	}
	if (isPluginItem(item)) {
		return ItemType.Plugin
	}
	if (isSearchActionItem(item)) {
		return ItemType.SearchAction
	}
	if (isDivideItem(item)) {
		return ItemType.Divide
	}
	return undefined
}

// todo 需要做一个每次首次都不需要等待的节流函数
export function throttle(delay: number) {
	let timer: ReturnType<typeof setTimeout> | null | undefined
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
		} catch {}
	}
	// 和父 window 通信，关闭全屏状态下的 modal
	if (typeof window !== 'undefined' && window.parent) {
		window.parent.postMessage({ type: 'close' }, '*')
	}
}

export const activeTab = async (item: ListItemType<ItemType.Tab>) => {
	await chrome.windows.update(item.data.windowId, { focused: true })
	await chrome.tabs.update(item.data.id, { active: true })
	closeCurrentWindowAndClearStorage()
}

// 独立窗口模式下，yz'yu插件自身也是一个 Chrome 窗口。
// 搜索/打开输入内容时要落到用户原本操作的普通浏览器窗口，不能在插件窗口里替换页面。
const getTargetWindowId = async () => {
	const storage = await storageGet()
	const lastActiveWindowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]

	if (lastActiveWindowId) {
		try {
			const targetWindow = await chrome.windows.get(lastActiveWindowId)
			if (targetWindow?.id && targetWindow.type === 'normal') {
				await chrome.windows.update(targetWindow.id, { focused: true })
				return targetWindow.id
			}
		} catch {}
	}

	const selfWindowId = storage[SELF_WINDOW_ID_KEY]
	const windows = await chrome.windows.getAll({ windowTypes: ['normal'] })
	const targetWindow = windows.find((item) => item.focused && item.id !== selfWindowId) || windows[0]
	if (targetWindow?.id) {
		await chrome.windows.update(targetWindow.id, { focused: true })
		return targetWindow.id
	}

	return undefined
}

export const createTabWithUrl = async (url: string) => {
	const targetWindowId = await getTargetWindowId()
	await chrome.tabs.create({ url, windowId: targetWindowId })
	closeCurrentWindowAndClearStorage()
}

export const navigateCurrentTab = async (url: string) => {
	const targetWindowId = await getTargetWindowId()
	const [activeTab] = await chrome.tabs.query({ active: true, windowId: targetWindowId })
	if (activeTab?.id) {
		await chrome.tabs.update(activeTab.id, { url })
		closeCurrentWindowAndClearStorage()
	}
}

export const handleItemClick = async (item: ListItemType) => {
	isTabItem(item) ? await activeTab(item) : await createTabWithUrl(item.data.url)
}

const SUPPORTED_NAVIGATION_PROTOCOLS = new Set(['http:', 'https:', 'ftp:'])
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

const hasExplicitProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)

const isValidPort = (port: string) => {
	if (!port) return true
	if (!/^\d+$/.test(port)) return false
	const portNumber = Number(port)
	return portNumber > 0 && portNumber <= 65535
}

const isValidIpv4Host = (host: string) => {
	const parts = host.split('.')
	return (
		parts.length === 4 &&
		parts.every((part) => {
			if (!/^\d{1,3}$/.test(part)) return false
			if (part.length > 1 && part.startsWith('0')) return false
			const value = Number(part)
			return value >= 0 && value <= 255
		})
	)
}

const isValidDomainHost = (host: string) => {
	if (!host.includes('.')) return false
	const labels = host.split('.')
	const tld = labels.at(-1)
	if (!tld || /^\d+$/.test(tld)) return false
	if (!/^([a-z\u00A1-\uFFFF]{2,}|xn--[a-z0-9-]{2,})$/i.test(tld)) return false
	return labels.every((label) => DOMAIN_LABEL_PATTERN.test(label))
}

const isValidUrlHost = (url: URL) => {
	const host = url.hostname.replace(/^\[|\]$/g, '')
	if (!host) return false
	if (host === 'localhost') return true
	if (isValidIpv4Host(host)) return true
	if (url.hostname.startsWith('[') && url.hostname.endsWith(']')) return true
	return isValidDomainHost(host)
}

export const isLikelyUrl = (value: string) => {
	const input = value.trim()
	if (!input) return false
	if (/[\s<>]/.test(input) || input.startsWith('mailto:')) return false
	try {
		const url = new URL(hasExplicitProtocol(input) ? input : `https://${input}`)
		return SUPPORTED_NAVIGATION_PROTOCOLS.has(url.protocol) && isValidPort(url.port) && isValidUrlHost(url)
	} catch {
		return false
	}
}

export const toNavigableUrl = (value: string) => {
	const input = value.trim()
	if (!input) return ''
	if (hasExplicitProtocol(input)) return input
	return `https://${input}`
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

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
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

export const compareForHitRangeLength = (a: ListItemType, b: ListItemType) => {
	if (a.data.compositeHitRanges && b.data.compositeHitRanges) {
		return a.data.compositeHitRanges.length - b.data.compositeHitRanges.length
	}
	return 0
}

export const orderList = (list: ListItemType[], searchConfig: SearchConfigAtomType) => {
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
			.slice(0, searchConfig.historyDisplayCount),
		...bookmarks.toSorted(compareForHitRangeLength).slice(0, searchConfig.bookmarkDisplayCount),
	].toSorted(compareForHitRangeLength)
}

export const searchWithList = (list: ListItemType[], searchValue: string, searchConfig: SearchConfigAtomType) => {
	if (searchValue === '') return list
	return list.reduce<ListItemType[]>((acc, item) => {
		const { hitRanges, wordHitRangesMapping } = searchSentenceByBoundaryMapping(
			item.data.compositeBoundaryMapping,
			searchValue
		)
		if (
			hitRanges &&
			(!searchConfig.enableConsecutiveSearch ||
				isConsecutiveForChar(item.data.compositeSource, searchValue, wordHitRangesMapping, hitRanges))
		) {
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

export const splitToGroup = (list: ListItemType[]) => {
	const tabs: ListItemType<ItemType.Tab>[] = []
	const bookmarks: ListItemType<ItemType.Bookmark>[] = []
	const histories: ListItemType<ItemType.History>[] = []
	for (const item of list) {
		if (isTabItem(item)) {
			tabs.push(item)
		} else if (isBookmarkItem(item)) {
			bookmarks.push(item)
		} else if (isHistoryItem(item)) {
			histories.push(item)
		}
	}
	return {
		tabs,
		bookmarks,
		histories,
	}
}

// 获取当前插件的快捷键设置
export const getExecuteActionShortcuts = async () => {
	try {
		const commands = await new Promise<chrome.commands.Command[]>((resolve) => {
			chrome.commands.getAll((commands) => {
				resolve(commands)
			})
		})
		// 查找 _execute_action 命令的快捷键
		const actionCommand = commands.find((command) => command.name === '_execute_action')
		if (actionCommand?.shortcut) {
			return actionCommand.shortcut
		}
		return null
	} catch (error) {
		console.error('Error getting extension shortcuts:', error)
		return null
	}
}

export const isSystemDarkMode = () => {
	// 在 iframe 环境中，尝试从 URL 参数获取系统主题信息，在 inject modal 时会手动注入
	try {
		// 首先检查 URL 参数中是否有系统主题信息（由注入脚本传递）
		const urlParams = new URLSearchParams(window.location.search)
		const systemDarkParam = urlParams.get(URL_DARK_PARAM)
		return !!systemDarkParam || window.matchMedia?.('(prefers-color-scheme: dark)').matches
	} catch (error) {
		console.error('Error getting system dark mode from URL:', error)
		return window.matchMedia?.('(prefers-color-scheme: dark)').matches
	}
}

export const isDarkMode = (theme: ThemeColor) =>
	theme === ThemeColor.Dark || (theme === ThemeColor.System && isSystemDarkMode())

export async function safeSendMessage(message: any, errorCallback?: (error: Error) => void) {
	try {
		await chrome.runtime.sendMessage(message)
	} catch (error) {
		console.error('Error sending message:', error)
		errorCallback?.(error)
	}
}

export async function getActiveTabInUserWindow(): Promise<chrome.tabs.Tab | null> {
	try {
		const currentWindow = await chrome.windows.getCurrent()
		let windowId: number
		if (currentWindow?.type === 'popup') {
			const storage = await storageGet()
			windowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
		} else {
			windowId = currentWindow.id
		}

		const tabs = await chrome.tabs.query({ active: true, windowId })
		return tabs[0] ?? null
	} catch (error) {
		console.error('获取用户窗口激活标签页失败:', error)
		return null
	}
}
