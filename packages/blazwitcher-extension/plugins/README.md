# Plugins 模块

这个目录包含了 Blazwitcher 扩展的插件功能。

## 文件结构

```
plugins/
├── commands/               # 命令插件
│   ├── index.ts            
│   ├── filters.tsx         # filter插件（/b, /h, /t）
│   └── setting.tsx         # setting插件（/s）
├── ui/                     
│   ├── index.ts            
│   ├── render-item.tsx     # 插件项渲染组件
│   └── setting-panels/     
│       ├── index.tsx       # 设置面板主组件
│       ├── appearance.tsx  # 外观设置面板
│       ├── keyboard.tsx    # 键盘设置面板
│       ├── search.tsx      # 搜索设置面板
│       ├── changelog.tsx   # 更新日志面板
│       └── contact.tsx     # 联系面板
├── index.ts                
└── README.md               
```

## 功能说明

### 核心功能
- **index.ts**: 包含插件匹配等核心工具函数和插件模块统一导出

### Commands 命令插件
- **filters.tsx**: 提供 `/b`（书签过滤）、`/h`（历史过滤）、`/t`（标签页过滤）命令
- **setting.tsx**: 提供 `/s`（设置页面）命令
- **index.ts**: 命令插件的统一导出

### UI 界面组件
- **render-item.tsx**: 插件项的渲染组件和点击处理逻辑
- **setting-panels/**: 设置面板相关组件
  - **index.tsx**: 设置面板主组件，包含导航和键盘支持
  - **appearance.tsx**: 外观设置
  - **keyboard.tsx**: 键盘快捷键设置
  - **search.tsx**: 搜索相关设置
  - **changelog.tsx**: 更新日志显示
  - **contact.tsx**: 联系信息

## 使用方式

### 导入插件功能
```typescript
// 导入核心功能
import { matchPlugin } from '~plugins'

// 导入UI组件
import { SettingPanels, RenderPluginItem } from '~plugins/ui'

// 导入命令插件
import { settingPlugin } from '~plugins/commands'

// 导入所有插件
import plugins from '~plugins'
```

### 添加新的命令插件
1. 在 `commands/` 目录下创建新的插件文件
2. 在 `commands/index.ts` 中导出新插件
3. 在主 `index.ts` 中添加到插件列表

### 添加新的设置面板
1. 在 `ui/setting-panels/` 目录下创建新的面板组件
2. 在 `ui/setting-panels/index.tsx` 中添加导航项和渲染逻辑
3. 在 `SettingPanelKey` 枚举中添加新的面板类型

## 键盘导航

设置面板支持键盘导航：
- **↑/↓**: 在设置面板之间切换