import { extractBoundaryMapping } from 'text-search-engine'

// 这里包含 2000 个汉字拼音，需要独立成一个文件，因为 background、sidePanel 和 option 是多入口，理论上只需 background 引入一份 pinyin 即可，但目前 plasmo tree shaking 有点问题
//
export function getCompositeSourceAndHost(title?: string, url?: string) {
	const host = new URL(url).host
	const compositeSource = `${title.toLocaleLowerCase().trim()}${host}`
	return {
		compositeSource,
		host,
		compositeBoundaryMapping: extractBoundaryMapping(compositeSource),
	}
}
