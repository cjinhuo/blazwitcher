import { createSearcher, isStrictnessSatisfied } from 'text-search-engine'
import { DEFAULT_STRICTNESS_COEFFICIENT } from '~shared/constants'
import type { ListItemType, Matrix } from '~shared/types'

export function createListSearcher(list: ListItemType[], enableConsecutiveSearch: boolean) {
	const searcher = createSearcher(list, {
		getFields: (item) => ({ title: (item.data.title || '').trim(), host: item.data.host }),
		isCharConsecutive: enableConsecutiveSearch,
	})

	return {
		search(query: string): ListItemType[] {
			if (query === '') return list
			return searcher.search(query).flatMap(({ item, hitRanges, fieldHitRanges }) => {
				// 保留旧链路的顺序：先合并空格，再检查严格度。
				if (!isStrictnessSatisfied(DEFAULT_STRICTNESS_COEFFICIENT, query, hitRanges)) return []
				const title: string = item.data.title || ''
				const titleOffset = title.length - title.trimStart().length
				const titleHitRanges: Matrix = fieldHitRanges.title.map(([start, end]) => [
					start + titleOffset,
					end + titleOffset,
				])
				return [
					{
						...item,
						data: {
							...item.data,
							compositeHitRanges: hitRanges,
							titleHitRanges,
							hostHitRanges: fieldHitRanges.host,
						},
					},
				]
			})
		},
	}
}
