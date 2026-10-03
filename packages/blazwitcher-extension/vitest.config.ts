import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	// Plasmo preserves JSX for its build; Vitest needs to transform component tests.
	oxc: { jsx: { runtime: 'automatic' } },
	plugins: [
		{
			// Command integration tests use the real registry; Plasmo owns SVG rendering.
			name: 'plasmo-svg-test-stub',
			resolveId(id) {
				if (id.startsWith('react:~assets/') && id.endsWith('.svg')) return `\0${id}`
			},
			load(id) {
				if (id.startsWith('\0react:~assets/')) return 'export default () => null'
			},
		},
	],
	resolve: {
		alias: {
			'~shared': path.resolve(__dirname, './shared'),
			'~sidepanel': path.resolve(__dirname, './sidepanel'),
			'~plugins': path.resolve(__dirname, './plugins'),
			'~background': path.resolve(__dirname, './background'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['shared/**', 'sidepanel/utils/**', 'background/tab-group-manager.ts'],
			exclude: [
				'**/*.d.ts',
				'**/types.ts',
				'shared/promisify.ts',
				'shared/open-window.ts',
				'shared/common-styles.tsx',
				'sidepanel/utils/startup.ts',
			],
			reporter: ['text', 'text-summary', 'html', 'lcov'],
			reportsDirectory: './coverage',
		},
	},
})
