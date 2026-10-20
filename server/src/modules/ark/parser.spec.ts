import { LLMResponseParser } from './parser'

describe('LLMResponseParser', () => {
	beforeEach(() => {
		jest.spyOn(console, 'log').mockImplementation(() => {})
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('keeps the group operation when the model emits the summary and group in one chunk', () => {
		const parser = new LLMResponseParser()

		const result = parser.parse(
			'<summary>{"effectExistingGroups":0,"newGroups":1}</summary><n_g>{"groupTitle":"React Documentation","groupColor":"blue","tabIds":[101,102]}</n_g>'
		)

		expect(result).toEqual({
			progress: 100,
			newGroups: [{ groupTitle: 'React Documentation', groupColor: 'blue', tabIds: [101, 102] }],
			effectExistingGroups: [],
		})
	})

	it('reads every new and existing group operation from the same chunk', () => {
		const parser = new LLMResponseParser()

		const result = parser.parse(
			'<summary>{"effectExistingGroups":1,"newGroups":2}</summary><n_g>{"groupTitle":"React","groupColor":"blue","tabIds":[1,2]}</n_g><n_g>{"groupTitle":"News","groupColor":"green","tabIds":[3,4]}</n_g><e_g>{"groupId":50,"tabIds":[5]}</e_g>'
		)

		expect(result).toEqual({
			progress: 100,
			newGroups: [
				{ groupTitle: 'React', groupColor: 'blue', tabIds: [1, 2] },
				{ groupTitle: 'News', groupColor: 'green', tabIds: [3, 4] },
			],
			effectExistingGroups: [{ groupId: 50, tabIds: [5] }],
		})
	})

	it('preserves an incomplete group after a complete summary for the next chunk', () => {
		const parser = new LLMResponseParser()
		parser.parse('<summary>{"effectExistingGroups":0,"newGroups":1}</summary><n_g>{"groupTitle":"React Doc')

		const result = parser.parse('umentation","groupColor":"blue","tabIds":[101,102]}</n_g>')

		expect(result).toEqual({
			progress: 100,
			newGroups: [{ groupTitle: 'React Documentation', groupColor: 'blue', tabIds: [101, 102] }],
			effectExistingGroups: [],
		})
	})
})
