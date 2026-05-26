import { vi } from 'vitest'

// Mock chrome global object
const chromeMock = {
	runtime: {
		id: 'test-extension-id',
		getURL: (path: string) => `chrome-extension://test-extension-id${path}`,
		sendMessage: vi.fn().mockResolvedValue(undefined),
		lastError: null,
		onInstalled: { addListener: vi.fn() },
		getPlatformInfo: vi.fn((cb) => cb({ os: 'mac', arch: 'arm' })),
	},
	tabs: {
		query: vi.fn().mockResolvedValue([]),
		update: vi.fn().mockResolvedValue({}),
		create: vi.fn().mockResolvedValue({}),
		remove: vi.fn().mockResolvedValue(undefined),
		get: vi.fn().mockResolvedValue({}),
		group: vi.fn().mockResolvedValue(1),
		ungroup: vi.fn().mockResolvedValue(undefined),
		sendMessage: vi.fn().mockResolvedValue(undefined),
		reload: vi.fn().mockResolvedValue(undefined),
	},
	tabGroups: {
		get: vi.fn().mockResolvedValue(undefined),
		update: vi.fn().mockResolvedValue({}),
	},
	bookmarks: {
		getTree: vi.fn().mockResolvedValue([]),
		get: vi.fn().mockResolvedValue([]),
		onChanged: { addListener: vi.fn() },
		onCreated: { addListener: vi.fn() },
		onRemoved: { addListener: vi.fn() },
	},
	history: {
		search: vi.fn().mockResolvedValue([]),
		deleteUrl: vi.fn().mockResolvedValue(undefined),
	},
	storage: {
		session: {
			get: vi.fn().mockResolvedValue({}),
			set: vi.fn().mockResolvedValue(undefined),
			remove: vi.fn().mockResolvedValue(undefined),
		},
		local: {
			get: vi.fn().mockResolvedValue({}),
			set: vi.fn().mockResolvedValue(undefined),
		},
		sync: {
			get: vi.fn().mockResolvedValue({}),
			set: vi.fn().mockResolvedValue(undefined),
			remove: vi.fn().mockResolvedValue(undefined),
		},
	},
	windows: {
		getCurrent: vi.fn().mockResolvedValue({ id: 1, type: 'normal' }),
		get: vi.fn().mockResolvedValue({ id: 1, type: 'normal' }),
		getAll: vi.fn().mockResolvedValue([]),
		create: vi.fn().mockResolvedValue({ id: 2 }),
		update: vi.fn().mockResolvedValue({}),
		remove: vi.fn().mockResolvedValue(undefined),
	},
	commands: {
		getAll: vi.fn((cb) => cb([])),
		onCommand: { addListener: vi.fn() },
	},
	action: {
		setTitle: vi.fn().mockResolvedValue(undefined),
		onClicked: { addListener: vi.fn() },
	},
	scripting: {
		executeScript: vi.fn().mockResolvedValue([{ result: false }]),
	},
	system: {
		display: {
			getInfo: vi.fn().mockResolvedValue([]),
		},
	},
	fontSettings: {
		getFontList: vi.fn((cb) => cb([])),
	},
}

// @ts-expect-error
globalThis.chrome = chromeMock
