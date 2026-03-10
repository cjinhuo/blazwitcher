# Setting Panel 配置云端同步方案（Chrome Storage Sync API）

## 1. 目标

将 Setting Panel 中的配置通过 **Chrome Storage Sync API**（`chrome.storage.sync`）自动在用户已登录的 Chrome 账号下跨设备同步，无需自建后端。

## 2. 现状梳理

### 2.1 配置项与当前存储方式

| 配置项 | Storage Key | 当前存储 | 所在面板 |
|--------|-------------|----------|----------|
| 主题 | `theme_color` (PAGE_STORAGE_THEME_COLOR) | localStorage + 同步写 local | Appearance |
| 语言 | `language` (PAGE_STORAGE_LANGUAGE_KEY) | localStorage | Appearance |
| 窗口显示模式 | `displayMode` | chrome.storage.local | Appearance |
| 窗口宽高 | `windowWidth`, `windowHeight` | chrome.storage.local | Appearance |
| 调试模式 | `debugMode` | chrome.storage.local | Appearance |
| 快捷键映射 | `shortcut_mappings` | localStorage | Keyboard |
| 历史最大天数/条数 | `historyMaxDays`, `historyMaxResults` | chrome.storage.local | Search |
| 搜索配置 | `search_config` | localStorage | Search |
| 更新通知已读版本 | `show_update_notification` | localStorage | - |

### 2.2 相关代码位置

- **Atom 定义**：`sidepanel/atom/`（common.ts、index.ts、windowAtom、searchConfigAtom、shortcutAtom、i18nAtom）
- **Storage 封装**：`shared/promisify.ts`（仅有 local/session，无 sync）
- **后台读取**：`shared/data-processing.ts`（getWindowConfig、getExtensionStorageSearchConfig 读 local）、`shared/utils.ts`（session）

## 3. Chrome Storage Sync 说明

- **行为**：用户登录 Chrome 时，`chrome.storage.sync` 会跨设备自动同步；离线时先存本地，上线后同步。
- **配额**：总约 100KB，单条约 8KB。当前配置体积远低于限制。
- **权限**：已有 `storage` permission，可直接使用 `chrome.storage.sync`，无需改 manifest。

## 4. 方案设计

### 4.1 同步范围

- **纳入同步**：主题、语言、窗口模式/宽高、调试模式、快捷键映射、历史天数/条数、搜索配置（即 Setting Panel 内所有可持久化配置）。
- **不同步**：`show_update_notification`（仅本机“已读版本”状态）。

### 4.2 架构思路

1. **统一 Sync 读写**：在 `shared/promisify.ts` 中增加 `storageGetSync` / `storageSetSync`（及按需 `storageRemoveSync`）。
2. **Atom 存储后端**：在 `sidepanel/atom/common.ts` 中新增基于 `chrome.storage.sync` 的 `createSyncStorageAtom`，供需要同步的配置使用。
3. **配置 Key 常量**：在 `shared/constants.ts` 中集中维护「参与 sync 的 key 列表」，便于迁移与后台读取。
4. **后台读取**：`getWindowConfig`、`getExtensionStorageSearchConfig` 改为从 `chrome.storage.sync` 读（与 sidepanel 一致）；可选：sync 无则回退 local，便于从旧版本平滑迁移）。
5. **跨 Tab 一致**（可选）：在 sidepanel 中监听 `chrome.storage.onChanged`（areaName === 'sync'），收到变更时刷新对应 atom，保证多 Tab 同设备一致。

### 4.3 实现要点

#### 4.3.1 新增 Sync API（promisify.ts）

```ts
// 与现有 storageGetLocal / storageSetLocal 并列
export const storageGetSync = promisifyChromeMethod<{ [key: string]: any }>(
  chrome.storage.sync.get.bind(chrome.storage.sync)
)
export const storageSetSync = promisifyChromeMethod(
  chrome.storage.sync.set.bind(chrome.storage.sync)
)
export const storageRemoveSync = promisifyChromeMethod(
  chrome.storage.sync.remove.bind(chrome.storage.sync)
)
```

#### 4.3.2 新增 createSyncStorageAtom（atom/common.ts）

- 与 `createStorageAtom` 类似，但 `getItem`/`setItem`/`removeItem` 使用 `chrome.storage.sync`。
- 这样现有 `createStorageAtom(KEY, default)` 的调用方只需改为 `createSyncStorageAtom(KEY, default)` 即可切到同步。

#### 4.3.3 需要改为 Sync 的 Atom

| 文件 | Atom | 改法 |
|------|------|------|
| atom/index.ts | themeAtom | 从 createSyncStorage(localStorage) 改为使用 createSyncStorageAtom(sync)，或新建基于 sync 的 storage 适配器 |
| atom/index.ts | lastViewedVersionAtom | 保持 localStorage，不改为 sync |
| atom/i18nAtom.ts | languageAtom | atomWithStorage(..., createSyncStorageAdapter())，适配器用 chrome.storage.sync |
| atom/shortcutAtom.ts | shortcutMappingsAtom | 同上，用 sync 适配器 |
| atom/searchConfigAtom.ts | searchConfigAtom, historyMaxDaysAtom, historyMaxResultsAtom | 后两者改为 createSyncStorageAtom；searchConfigAtom 改为 atomWithStorage + sync 适配器 |
| atom/windowAtom.ts | displayModeAtom, widthAtom, heightAtom, debugAtom | createStorageAtom → createSyncStorageAtom |

#### 4.3.4 主题与 useTheme

- 当前：themeAtom 存 localStorage，useTheme 再写一份到 `chrome.storage.local`。
- 改为：themeAtom 直接使用 sync 后端；useTheme 中不再单独写 storage，或改为写 sync（若仍需要给 background 用，可保留一次 sync 写入，因为 getWindowConfig 会从 sync 读）。

#### 4.3.5 后台读取（data-processing.ts）

- `getWindowConfig()`：改为 `storageGetSync()` 取 displayMode/width/height/theme/debugMode；若希望兼容旧数据，可 `storageGetSync().then(sync => sync.key ? use(sync) : storageGetLocal())`。
- `getExtensionStorageSearchConfig()`：同样改为从 `storageGetSync()` 读 historyMaxDays/historyMaxResults，可选 fallback local。

#### 4.3.6 迁移（可选）

- 首次启动或版本升级时：若 sync 中某 key 不存在，则从 `chrome.storage.local` / localStorage 读一次并写入 sync，之后只读写 sync。这样老用户可自动迁到同步配置。

### 4.4 多 Tab 同步（可选）

- 在 sidepanel 入口或 Provider 内：
  - `chrome.storage.onChanged.addListener((changes, areaName) => { if (areaName === 'sync') { ... } })`
  - 根据 `changes` 的 key 更新对应 jotai atom（或触发 refetch），使同一设备多 Tab 配置一致。

## 5. 文件改动清单

| 文件 | 改动 |
|------|------|
| `shared/promisify.ts` | 新增 storageGetSync、storageSetSync、storageRemoveSync |
| `shared/constants.ts` | 可选：增加 SYNC_STORAGE_KEYS 或注释标明哪些 key 走 sync |
| `sidepanel/atom/common.ts` | 新增 createSyncStorageAtom，使用 chrome.storage.sync |
| `sidepanel/atom/index.ts` | themeAtom 改为 sync 后端；lastViewedVersionAtom 保持原样 |
| `sidepanel/atom/i18nAtom.ts` | languageAtom 使用 sync 适配器 |
| `sidepanel/atom/shortcutAtom.ts` | shortcutMappingsAtom 使用 sync 适配器 |
| `sidepanel/atom/searchConfigAtom.ts` | historyMaxDays/Results 用 createSyncStorageAtom；searchConfigAtom 用 sync 适配器 |
| `sidepanel/atom/windowAtom.ts` | displayMode/width/height/debug 改为 createSyncStorageAtom |
| `sidepanel/hooks/useTheme.ts` | 若 theme 已由 atom 写 sync，可去掉对 storageSetLocal 的写入或改为 storageSetSync（视 getWindowConfig 是否只读 sync） |
| `shared/data-processing.ts` | getWindowConfig、getExtensionStorageSearchConfig 改为从 storageGetSync 读，可选 local fallback |

## 6. 注意事项

- **jotai atomWithStorage 异步**：当前 createStorageAtom 已是 async get/set，createSyncStorageAtom 同样异步即可；themeAtom 若从同步 localStorage 改为异步 sync，需确认首屏不会闪（getOnInit: true 等）。
- **sync 配额**：单 key 8KB、总 100KB，当前配置量可忽略。
- **未登录 Chrome**：sync 仍可用，数据仅存本机，登录后会自动同步到该账号。

按上述步骤实现后，Setting Panel 的配置将随 Chrome 账号自动云端同步，无需额外后端或用户操作。
