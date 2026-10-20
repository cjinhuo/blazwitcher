import { createStore, Provider } from 'jotai'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AiGroupingProgress, WindowData } from '~shared/types'
import { aiTabGroupProgressAtom } from '~sidepanel/atom'
import { TabGroupProgress } from '~sidepanel/components/tab-group-progress'

vi.mock('@douyinfe/semi-ui', async () => ({
	Toast: (await import('@douyinfe/semi-ui/lib/es/toast')).default,
}))

// Keep the real component and message hook, without Chrome-backed settings storage.
vi.mock('~sidepanel/atom', async () => {
	const { atom } = await import('jotai')
	const { ThemeColor } = await import('~shared/constants')
	const { lang } = await import('../../i18n/lang')
	return {
		aiTabGroupProgressAtom: atom<AiGroupingProgress>({ isProcessing: false, progress: 0, showReset: false }),
		windowDataListAtom: atom<WindowData[]>([]),
		pluginContextAtom: atom({}),
		searchValueAtom: atom({ value: '' }),
		themeAtom: atom(ThemeColor.Light),
		i18nAtom: atom(() => (key: keyof typeof lang) => lang[key].en),
	}
})

describe('grouping duration in the reset button', () => {
	let store: ReturnType<typeof createStore>
	let root: Root
	let container: HTMLDivElement

	beforeEach(() => {
		vi.stubEnv('NODE_ENV', 'development')
		vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
		vi.stubGlobal('chrome', {
			...chrome,
			runtime: { ...chrome.runtime, onMessage: { addListener: vi.fn(), removeListener: vi.fn() } },
		})
		store = createStore()
		container = document.createElement('div')
		document.body.append(container)
		root = createRoot(container)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
		vi.unstubAllEnvs()
		vi.unstubAllGlobals()
	})

	function render() {
		act(() =>
			root.render(
				<Provider store={store}>
					<TabGroupProgress />
				</Provider>
			)
		)
	}

	it('prefixes the reset label with bracketed seconds and removes the prefix when the duration expires', () => {
		render()
		expect(container.querySelector('button')?.textContent).toBe('AI Tab Grouping')
		act(() =>
			store.set(aiTabGroupProgressAtom, {
				isProcessing: false,
				progress: 0,
				showReset: true,
				countdown: 16,
				durationMs: 2750,
			})
		)
		expect(container.querySelector('button')?.textContent).toContain('[2.75 s] Reset AI Tab Grouping')
		expect(container.textContent).toBe(container.querySelector('button')?.textContent)

		act(() => store.set(aiTabGroupProgressAtom, { ...store.get(aiTabGroupProgressAtom), durationMs: undefined }))
		expect(container.querySelector('button')?.textContent).toBe('Reset AI Tab Grouping(16s)')
	})

	it('shows a zero duration without treating it as missing', () => {
		store.set(aiTabGroupProgressAtom, { isProcessing: false, progress: 0, showReset: true, durationMs: 0 })
		render()
		expect(container.querySelector('button')?.textContent).toBe('[0.00 s] Reset AI Tab Grouping')
	})

	it('keeps the production button unchanged even if duration data is present', () => {
		vi.stubEnv('NODE_ENV', 'production')
		store.set(aiTabGroupProgressAtom, { isProcessing: false, progress: 0, showReset: true, durationMs: 2750 })
		render()
		expect(container.querySelector('button')?.textContent).toBe('Reset AI Tab Grouping')
	})

	it('does not prefix the regular grouping button after a reset', () => {
		store.set(aiTabGroupProgressAtom, { isProcessing: false, progress: 0, showReset: false, durationMs: 2750 })
		render()
		expect(container.textContent).toBe('AI Tab Grouping')
		expect(container.querySelector('button')?.textContent).toBe('AI Tab Grouping')
	})
})
