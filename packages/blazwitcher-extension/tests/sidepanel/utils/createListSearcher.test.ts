import {
	createSearcher,
	extractBoundaryMapping,
	isConsecutiveForChar,
	isStrictnessSatisfied,
	mergeSpacesWithRanges,
	searchSentenceByBoundaryMapping,
} from 'text-search-engine'
import { describe, expect, it } from 'vitest'
import { DEFAULT_STRICTNESS_COEFFICIENT } from '~shared/constants'
import { ItemType, type ListItemType, type Matrix } from '~shared/types'
import { createListSearcher } from '~sidepanel/utils/createListSearcher'

const makeItem = (id: string, title: string, host: string, itemType = ItemType.Tab): ListItemType => ({
	itemType,
	data: { id, title, host, url: `https://${host}` },
})

// 使用真实 SDK 的旧搜索链路对照条目顺序和整体范围。
function legacySearch(list: ListItemType[], query: string, consecutive: boolean) {
	return list.flatMap((item) => {
		const text = `${item.data.title.toLocaleLowerCase().trim()}${item.data.host}`
		const { hitRanges, wordHitRangesMapping } = searchSentenceByBoundaryMapping(extractBoundaryMapping(text), query)
		if (!hitRanges || (consecutive && !isConsecutiveForChar(text, query, wordHitRangesMapping, hitRanges))) return []
		const merged = mergeSpacesWithRanges(text, hitRanges)
		return isStrictnessSatisfied(DEFAULT_STRICTNESS_COEFFICIENT, query, merged)
			? [{ id: item.data.id, hitRanges: merged }]
			: []
	})
}
const ranges = (items: ListItemType[]) =>
	items.map((item) => ({ id: item.data.id, hitRanges: item.data.compositeHitRanges }))

describe('createListSearcher 使用本地真实 SDK', () => {
	it('跨标题和域名匹配拼音与英文，保留输入顺序及重复项', () => {
		const list = [
			makeItem('1', 'React 监控平台', 'github.com'),
			makeItem('2', 'Vue 监控平台', 'example.com'),
			makeItem('1', 'React 监控平台', 'github.com', ItemType.Bookmark),
		]
		const result = createListSearcher(list, false).search('JK GITHUB')
		expect(result.map((item) => item.data.id)).toEqual(['1', '1'])
		expect(result[0].data.titleHitRanges).toEqual([[6, 7]])
		expect(result[0].data.hostHitRanges).toEqual([[0, 5]])
		expect(result[0].data.compositeHitRanges).toEqual([
			[6, 7],
			[10, 15],
		])
		expect(list[0].data).not.toHaveProperty('compositeHitRanges')
	})

	it('严格度在合并空格后检查，保留 jkp 的旧命中', () => {
		const list = [makeItem('1', '监 控 平', 'example.com')]
		const direct = createSearcher(list, {
			getFields: (item) => ({ title: item.data.title, host: item.data.host }),
			strictnessCoefficient: DEFAULT_STRICTNESS_COEFFICIENT,
		})
		expect(direct.search('jkp')).toEqual([])
		expect(createListSearcher(list, false).search('jkp')[0].data.titleHitRanges).toEqual([[0, 4]])
	})

	it('裁剪标题后为原始标题加回前导空白，不影响域名坐标', () => {
		const item = makeItem('1', '  React 监控平台  ', 'github.com')
		const result = createListSearcher([item], false).search('jk github')[0]
		expect(result.data.title).toBe(item.data.title)
		expect(result.data.titleHitRanges).toEqual([[8, 9]])
		expect(result.data.hostHitRanges).toEqual([[0, 5]])
		expect(result.data.compositeHitRanges).toEqual([
			[6, 7],
			[10, 15],
		])
	})

	it('域名独立命中和跨字段单词均有正确范围', () => {
		const searcher = createListSearcher([makeItem('1', 'React', 'github.com')], false)
		expect(searcher.search('github')[0].data.titleHitRanges).toEqual([])
		expect(searcher.search('github')[0].data.hostHitRanges).toEqual([[0, 5]])
		expect(searcher.search('reactgit')[0].data.titleHitRanges).toEqual([[0, 4]])
		expect(searcher.search('reactgit')[0].data.hostHitRanges).toEqual([[0, 2]])
	})

	it('连续搜索开关保持旧行为', () => {
		const list = [makeItem('1', 'Chinese@中国 People-人', 'example.com')]
		expect(createListSearcher(list, false).search('chie')).toHaveLength(1)
		expect(createListSearcher(list, true).search('chie')).toEqual([])
	})

	it('空查询返回原始列表，无匹配或空白查询返回空数组', () => {
		const list = [makeItem('1', 'React', 'github.com')]
		const searcher = createListSearcher(list, false)
		expect(searcher.search('')).toBe(list)
		expect(searcher.search('  ')).toEqual([])
		expect(searcher.search('xyz123')).toEqual([])
		expect(createListSearcher([], false).search('jk')).toEqual([])
	})

	it('历史记录缺少标题时仍可搜索域名', () => {
		const item = makeItem('1', '', 'example.com', ItemType.History)
		delete item.data.title
		expect(createListSearcher([item], false).search('example')[0].data.hostHitRanges).toEqual([[0, 6]])
	})

	it('修改上次结果不会污染后续查询或原始条目', () => {
		const item = makeItem('1', 'React 监控平台', 'github.com')
		const searcher = createListSearcher([item], false)
		const result = searcher.search('jk github')[0]
		result.data.titleHitRanges[0][0] = 99
		result.data.hostHitRanges.push([100, 101])
		result.data.compositeHitRanges[0][0] = 100
		const next = searcher.search('jk github')[0]
		expect(next.data.titleHitRanges).toEqual([[6, 7]])
		expect(next.data.hostHitRanges).toEqual([[0, 5]])
		expect(item.data).not.toHaveProperty('titleHitRanges')
	})

	const list = [
		makeItem('1', 'React 监控平台', 'github.com'),
		makeItem('2', 'TypeScript 类型系统', 'typescriptlang.org', ItemType.Bookmark),
		makeItem('3', '前端性能优化', 'react.dev', ItemType.History),
		makeItem('4', '监 控 平', 'example.com'),
		makeItem('5', 'Chinese@中国 People-人', 'example.com'),
		makeItem('6', 'React 监控平台', 'github.com'),
	]
	it.each([
		'react',
		'jk github',
		'github jk',
		'监控',
		'qianduan',
		'type lx',
		'性n react',
		'jkp',
		'chie',
		'xyzz',
	])('与旧链路对照 %s 的条目、顺序及高亮', (query) => {
		for (const consecutive of [false, true]) {
			const result = createListSearcher(list, consecutive).search(query)
			expect(ranges(result)).toEqual(legacySearch(list, query, consecutive))
			for (const { data } of result) {
				const length = data.title.length
				const hits: Matrix = data.compositeHitRanges
				expect(data.titleHitRanges).toEqual(
					hits.filter(([start]) => start < length).map(([start, end]) => [start, Math.min(end, length - 1)])
				)
				expect(data.hostHitRanges).toEqual(
					hits
						.filter(([, end]) => end >= length)
						.map(([start, end]) => [Math.max(start, length) - length, end - length])
				)
			}
		}
	})
})
