# 修复 tab-actions.tsx 独立窗口问题

## 问题描述

在 `tab-actions.tsx` 中，当前实现直接使用 `chrome.tabs.query({ active: true, currentWindow: true })` 获取当前标签页。但当扩展以独立窗口 (popup) 形式运行时，这个 API 会返回**扩展窗口自身**的标签页，而不是用户实际操作的浏览器窗口中的标签页。

### 当前问题代码

```typescript
const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, { pinned: !tabs[0].pinned })
}
```

## AI 标签分组的解决方案参考

AI 标签分组功能在 `useTabGroup.ts` 中处理了这个问题：

```typescript
const getCurrentWindowData = useCallback(async (): Promise<WindowData | undefined> => {
    try {
        let currentWindowId: number
        const currentWindow = await chrome.windows.getCurrent()
        if (currentWindow?.type === 'popup') {
            // 当前window为扩展，需要找到上一个active的window
            const storage = await storageGet()
            const lastActiveWindowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
            currentWindowId = lastActiveWindowId
        } else {
            currentWindowId = currentWindow.id
        }
        // ...
    } catch (error) {
        // ...
    }
}, [windowDataList])
```

核心逻辑：
1. 调用 `chrome.windows.getCurrent()` 获取当前窗口
2. 如果窗口类型是 `popup`，说明是扩展自身的窗口
3. 此时从 storage 中读取 `lastActiveWindowId` 来获取用户实际操作的窗口 ID

## 修复方案

### 1. 创建通用工具函数

在 `shared/utils.ts` 中添加一个工具函数，用于获取用户实际操作的窗口中的激活标签页：

```typescript
export async function getActiveTabInUserWindow(): Promise<chrome.tabs.Tab | null> {
    try {
        const currentWindow = await chrome.windows.getCurrent()
        let windowId: number
        
        if (currentWindow?.type === 'popup') {
            // 当前窗口是扩展窗口，获取用户上次激活的窗口 ID
            const storage = await storageGet()
            windowId = storage[LAST_ACTIVE_WINDOW_ID_KEY]
        } else {
            windowId = currentWindow.id
        }
        
        const tabs = await chrome.tabs.query({ active: true, windowId })
        return tabs[0] ?? null
    } catch (error) {
        console.error('获取用户窗口激活标签页失败:', error)
        return null
    }
}
```

### 2. 更新 tab-actions.tsx

使用新的工具函数替换原有实现：

```typescript
import { getActiveTabInUserWindow } from '~shared/utils'

export const pinCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
    command: '/pin',
    description: i18n('pinCurrentTab'),
    icon: <PinSvg width={24} height={24} />,
    action: async (context) => {
        const tab = await getActiveTabInUserWindow()
        if (tab?.id) {
            await chrome.tabs.update(tab.id, { pinned: !tab.pinned })
        }
        context?.setSearchValue?.('')
    },
})

export const duplicateCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
    command: '/duplicate',
    description: i18n('duplicateCurrentTab'),
    icon: <DuplicateSvg width={24} height={24} />,
    action: async (context) => {
        const tab = await getActiveTabInUserWindow()
        if (tab?.id) {
            await chrome.tabs.duplicate(tab.id)
        }
        context?.setSearchValue?.('')
    },
})
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `shared/utils.ts` | 修改 | 添加 `getActiveTabInUserWindow` 工具函数 |
| `plugins/commands/tab-actions.tsx` | 修改 | 使用新工具函数获取用户窗口的激活标签页 |

## 测试场景

1. **iframe 模式**: 扩展嵌入在当前页面内
2. **独立窗口模式 (popup)**: 扩展作为独立窗口打开
   - 在此模式下执行 `/pin` 和 `/duplicate` 应该操作的是用户之前激活的浏览器窗口中的标签页
