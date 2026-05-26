import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
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
