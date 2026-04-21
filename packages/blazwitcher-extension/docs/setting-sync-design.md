# Blazwitcher 配置与存储约定

这份文档只回答三件事：当前有哪些配置、分别放在哪层、后续新增 setting 应该怎么接。

## 1. 先判断放哪层

新增配置时，先看消费方，不看它挂在哪个面板里。

| 类型 | 谁消费 | 存储位置 | 是否同步 |
|------|--------|----------|----------|
| UI 配置 | sidepanel 自己渲染 | `chrome.storage.sync`，兼容旧 `localStorage` 懒迁移 | 是 |
| Window / Search 配置 | background / shared 也会读 | `chrome.storage.sync`，兼容旧 `chrome.storage.local` 懒迁移 | 是 |
| 本机专属配置 | 只在当前设备有意义 | `chrome.storage.local` 或 `localStorage` | 否 |
| 运行时缓存 | 只服务当前一次流程 | `chrome.storage.session` | 否 |

## 2. 当前配置清单

| 配置项 | Key | 类型 | 主要入口 | 当前存储 |
|------|-----|------|----------|----------|
| 主题 | `theme_color` | UI 配置 | `themeAtom` / `getWindowConfig()` | `sync`，兼容旧 `localStorage` / `local` |
| 语言 | `language` | UI 配置 | `languageAtom` | `sync`，兼容旧 `localStorage` |
| 快捷键映射 | `shortcut_mappings` | UI 配置 | `shortcutMappingsAtom` | `sync`，兼容旧 `localStorage` |
| 搜索面板配置 | `search_config` | UI 配置 | `searchConfigAtom` | `sync`，兼容旧 `localStorage` |
| 窗口模式 | `displayMode` | Window 配置 | `displayModeAtom` / `getWindowConfig()` | `sync`，兼容旧 `local` |
| 窗口宽度 | `windowWidth` | Window 配置 | `widthAtom` / `getWindowConfig()` | `sync`，兼容旧 `local` |
| 窗口高度 | `windowHeight` | Window 配置 | `heightAtom` / `getWindowConfig()` | `sync`，兼容旧 `local` |
| history 最大天数 | `historyMaxDays` | Search 配置 | `historyMaxDaysAtom` / `getExtensionStorageSearchConfig()` | `sync`，兼容旧 `local` |
| history 最大条数 | `historyMaxResults` | Search 配置 | `historyMaxResultsAtom` / `getExtensionStorageSearchConfig()` | `sync`，兼容旧 `local` |
| 调试模式 | `debugMode` | 本机专属配置 | `debugAtom` / `getWindowConfig()` | `chrome.storage.local` |
| 更新通知已读版本 | `show_update_notification` | 本机专属配置 | `lastViewedVersionAtom` | `localStorage` |
| 弹窗窗口状态缓存 | `selfWindowId` / `selfWindowState` / `lastActiveWindowId` | 运行时缓存 | `open-window` / `utils` | `chrome.storage.session` |

主要代码位置：

- atom 存储适配器：`sidepanel/atom/common.ts`
- atom 定义：`sidepanel/atom/`
- shared 读取入口：`shared/data-processing.ts`
- storage 封装：`shared/promisify.ts`
- key 和默认值：`shared/constants.ts`

## 3. 存储规则

| 场景 | 入口 | 规则 |
|------|------|------|
| 旧 `localStorage` -> `sync` | `createChromeSyncStorage()` | 先读 `sync`，没有再读旧 `localStorage`，读到旧值就回写 `sync` |
| 旧 `chrome.storage.local` -> `sync` | `createSyncStorageAtom()`、`getSyncValueWithLocalFallback()` | 先读 `sync`，没有再读旧 `local`，读到旧值就回写 `sync` |
| background / shared 读取 | `getWindowConfig()`、`getExtensionStorageSearchConfig()` | 按 key 读取，不能整组在 `sync` / `local` 之间二选一 |

补充两点：

- `startup.ts` 只负责首屏 theme / language 初始化，但读法和上面的懒迁移规则一致。
- `debugMode` 不进 `sync`，继续只走本机 `local`。

## 4. 新增配置怎么接

| 场景 | 放哪里 | 怎么写 |
|------|--------|--------|
| 只影响 sidepanel 渲染 | UI 配置 | 新增 sync-backed atom，必要时在 `startup.ts` 或 `useXxx()` 里应用到 DOM / CSS variable |
| background 打开窗口前就要读 | Window 配置 | 扩展 `WindowConfig`，新增 atom，并更新 `getWindowConfig()` |
| 影响搜索或 history 行为 | Search 配置 | 新增 atom，shared 也要用时同步更新 `getExtensionStorageSearchConfig()` |
| 只在当前设备生效 | 本机专属配置 | 继续用 `chrome.storage.local` 或 `localStorage`，不要接到 `sync` |
| 只在当前流程里暂存 | 运行时缓存 | 放 `chrome.storage.session`，通过 `shared/promisify.ts` 读写 |

像字体、字号、圆角、列表密度这种只影响 sidepanel 展示的配置，直接放 UI 配置，不要进 `getWindowConfig()`。

## 5. 自查清单

新增一个 setting 时，至少确认这几件事：

1. 它属于 UI、Window、Search、本机专属，还是运行时缓存。
2. 它该放 `sync`、`local` 还是 `session`。
3. 是否需要兼容旧值，旧值原来在 `localStorage` 还是 `chrome.storage.local`。
4. background / shared 是否也要消费，如果要，不能只改 atom。
5. 是否影响首屏样式，如果影响，要不要补 `startup.ts` 初始化。

## 6. 当前约束

- 不要在业务组件里直接手写 `chrome.storage.sync.get/set`，优先复用现有 helper。
- 不要把所有 setting 都塞进 `getWindowConfig()`。
- 不要把本机专属配置误接到 `sync`。
- 懒迁移只做“读旧值并回写 `sync`”，不会删除旧存储。
