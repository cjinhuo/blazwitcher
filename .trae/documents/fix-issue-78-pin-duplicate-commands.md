# 修复 Issue #78: 添加 /pin 和 /duplicate 命令

## Issue 信息

* **Issue 链接**: <https://github.com/cjinhuo/blazwitcher/issues/78>

* **标题**: feat: add two commands for pin and duplicate current tab

* **需求**: 通过 `/pin` 和 `/duplicate` 来快速调用 pin 和 duplicate 当前 tab

## 需求分析

用户希望能通过命令快捷方式来：

1. `/pin` - 固定/取消固定当前激活的标签页
2. `/duplicate` - 复制当前激活的标签页

## 技术分析

### 现有架构

项目采用插件化架构实现 `/` 命令功能：

| 命令    | 功能      | 处理方式                    |
| ----- | ------- | ----------------------- |
| `/s`  | 设置页     | `render` - 渲染设置面板       |
| `/ai` | AI 标签分组 | `action` - 执行动作         |
| `/t`  | 搜索标签页   | `dataProcessing` - 过滤数据 |
| `/h`  | 搜索历史记录  | `dataProcessing` - 过滤数据 |
| `/b`  | 搜索书签    | `dataProcessing` - 过滤数据 |

### 相关文件

* 命令定义目录: `packages/blazwitcher-extension/plugins/commands/`

* 插件注册: `packages/blazwitcher-extension/plugins/index.ts`

* 类型定义: `packages/blazwitcher-extension/shared/types.ts`

* 国际化: `packages/blazwitcher-extension/i18n/lang.ts`

* 现有 action 命令参考: `packages/blazwitcher-extension/plugins/commands/actions.tsx`

### Chrome API

项目已有相关 API 调用：

* Pin 操作: `chrome.tabs.update(tabId, { pinned: !pinned })`

* Duplicate 操作: `chrome.tabs.duplicate(tabId)`

## 实现方案

### 1. 扩展 PluginContext 类型

在 `shared/types.ts` 中扩展 `PluginContext` 接口，添加获取当前激活标签页的方法：

```typescript
export interface PluginContext {
  handleAIGroupingClick?: () => Promise<void>
  setSearchValue?: (value: string) => void
  getCurrentActiveTab?: () => Promise<chrome.tabs.Tab | null>  // 新增
}
```

### 2. 创建新的命令文件

在 `plugins/commands/` 目录下创建 `tab-actions.tsx`：

```typescript
// /pin 命令 - 固定/取消固定当前标签页
export const pinCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
  command: '/pin',
  description: i18n('pinCurrentTab'),
  icon: <PinSvg width={24} height={24} />,
  action: async (context) => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab[0]?.id) {
      await chrome.tabs.update(tab[0].id, { pinned: !tab[0].pinned })
    }
    context?.setSearchValue?.('')
  },
})

// /duplicate 命令 - 复制当前标签页
export const duplicateCurrentTabPlugin = (i18n: i18nFunction): CommandPlugin => ({
  command: '/duplicate',
  alias: '/dup',  // 短别名
  description: i18n('duplicateCurrentTab'),
  icon: <DuplicateSvg width={24} height={24} />,
  action: async (context) => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab[0]?.id) {
      await chrome.tabs.duplicate(tab[0].id)
    }
    context?.setSearchValue?.('')
  },
})
```

### 3. 图标资源

项目中已有以下可用图标：
- `pin.svg` - 固定图标 ✅ 已存在
- `unpin.svg` - 取消固定图标 ✅ 已存在

需要新增 `duplicate.svg`，风格要求：
- viewBox: `0 0 1024 1024`
- 尺寸: `width="512" height="512"`
- 使用单一 `<path>` 元素，无 fill 属性（继承父元素颜色）
- 图案风格：两个重叠的矩形/文档，表示复制含义

**duplicate.svg 代码**:
```svg
<svg t="1756436103254"
     class="icon"
     viewBox="0 0 1024 1024"
     version="1.1"
     xmlns="http://www.w3.org/2000/svg"
     p-id="3255"
     width="512"
     height="512">
  <path d="M768 85.333333H341.333333c-46.933333 0-85.333333 38.4-85.333333 85.333334v85.333333H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333333v512c0 46.933333 38.4 85.333333 85.333334 85.333334h426.666666c46.933333 0 85.333333-38.4 85.333334-85.333334v-85.333333h85.333333c46.933333 0 85.333333-38.4 85.333333-85.333333V170.666667c0-46.933333-38.4-85.333333-85.333333-85.333334zM597.333333 853.333333H170.666667V341.333333h426.666666v512z m170.666667-170.666666h-85.333333V341.333333c0-46.933333-38.4-85.333333-85.333334-85.333333H341.333333V170.666667h426.666667v512z"
        p-id="3256"></path>
</svg>
```

### 4. 添加国际化文案

在 `i18n/lang.ts` 中添加：

```typescript
pinCurrentTab: {
  [LanguageType.zh]: '固定/取消固定当前标签页',
  [LanguageType.en]: 'Pin/Unpin Current Tab',
},
duplicateCurrentTab: {
  [LanguageType.zh]: '复制当前标签页',
  [LanguageType.en]: 'Duplicate Current Tab',
},
```

### 5. 注册插件

在 `plugins/index.ts` 中注册新命令：

```typescript
import { pinCurrentTabPlugin, duplicateCurrentTabPlugin } from './commands/tab-actions'

const plugins = (i18n: i18nFunction): ListItemType<ItemType.Plugin>[] =>
  [
    settingPlugin(i18n),
    aiGroupingPlugin(i18n),
    pinCurrentTabPlugin(i18n),      // 新增
    duplicateCurrentTabPlugin(i18n), // 新增
    filterByTabPlugin(i18n),
    filterByHistoryPlugin(i18n),
    filterByBookmarkPlugin(i18n),
  ].map((plugin) => ({
    itemType: ItemType.Plugin,
    data: plugin,
  }))
```

### 6. 导出命令

在 `plugins/commands/index.ts` 中添加导出：

```typescript
export { pinCurrentTabPlugin, duplicateCurrentTabPlugin } from './tab-actions'
```

## 文件变更清单

| 文件                                 | 操作 | 说明                      |
| ---------------------------------- | -- | ----------------------- |
| `plugins/commands/tab-actions.tsx` | 新增 | 实现 /pin 和 /duplicate 命令 |
| `plugins/commands/index.ts`        | 修改 | 导出新命令                   |
| `plugins/index.ts`                 | 修改 | 注册新命令到插件列表              |
| `i18n/lang.ts`                     | 修改 | 添加国际化文案                 |
| `assets/duplicate.svg`             | 新增 | Duplicate 图标            |

## 测试计划

1. **功能测试**:

   * 输入 `/pin` 能看到命令提示并执行固定/取消固定

   * 输入 `/duplicate` 能看到命令提示并复制当前标签页

   * 执行后输入框自动清空

2. **边界测试**:

   * 当没有激活标签页时的处理（虽然理论上不会发生）

   * 命令别名 `/dup` 是否正常工作

3. **UI 测试**:

   * 图标显示正常

   * 中英文文案显示正确

## PR 信息

* **分支名**: `feat/pin-duplicate-commands`

* **PR 标题**: `feat: add /pin and /duplicate commands for current tab (#78)`

* **PR 描述**:

  * 添加 `/pin` 命令用于固定/取消固定当前标签页

  * 添加 `/duplicate` 命令用于复制当前标签页

  * 关联 Issue #78

