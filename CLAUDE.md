# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

Blazwitcher 是一个支持拼音模糊搜索的 Chrome 扩展，可搜索标签页、书签和历史记录，并具备 AI 标签分组功能。项目采用 pnpm workspaces 管理的 monorepo 结构，包含：

- **blazwitcher-extension**: 基于 Plasmo 框架构建的 Chrome 扩展
- **blazwitcher-doc**: Next.js 文档网站
- **server**: 用于 AI 标签分组的 NestJS 后端

## 开发命令

### 初始化
```bash
pnpm i                                    # 安装依赖
```

### 扩展开发
```bash
pnpm dev                                   # 启动扩展开发服务器
pnpm package                               # 构建生产环境扩展包
pnpm --filter blazwitcher-extension dev    # 仅运行扩展开发模式
pnpm --filter blazwitcher-extension build  # 仅构建扩展
```

### 文档站点
```bash
pnpm dev:doc                               # 启动文档站点开发服务器
```

### 服务端开发
```bash
pnpm --filter server dev                   # 启动 NestJS 服务器（watch 模式）
pnpm --filter server build                 # 构建服务器
pnpm --filter server start:prod            # 启动生产环境服务器
```

### 代码质量
```bash
pnpm lint                                  # 使用 Biome 检查 TypeScript 文件
pnpm format                                # 使用 Biome 格式化代码
pnpm commit                                # 使用 czg 进行交互式提交
```

### 版本管理与发布
```bash
pnpm bump_version                          # 使用 changesets 升级版本
pnpm push_release                          # 推送 release 到 GitHub
pnpm fetch_releases                        # 获取扩展的 releases
pnpm bump_and_push                         # 一键升级版本并推送
pnpm bump_and_push_and_fetch              # 完整的发布流程
```

## 架构设计

### 扩展架构（Plasmo 框架）

**入口点：**
- `background/index.ts`: Service worker，管理上下文菜单、标签页操作和 AI 分组
- `sidepanel/index.tsx`: 主 UI 入口，使用 React + Semi-UI
- `popup.tsx`: 扩展弹出窗口（最小化）
- `options/index.tsx`: 扩展选项页面

**核心模块：**

**侧边栏 UI (`packages/blazwitcher-extension/sidepanel/`)：**
- 使用 Jotai atoms 进行状态管理（`atom/` 目录）
- 主要组件：Search、List、Footer，支持键盘导航
- 基于 `text-search-engine` 包的模糊搜索
- 渲染标签页、书签和历史记录，带分隔符和分组

**插件系统 (`packages/blazwitcher-extension/plugins/`)：**
- 基于命令的插件架构，用于过滤器和设置
- `commands/filters.tsx`: `/b`（书签）、`/h`（历史）、`/t`（标签页）过滤器
- `commands/setting.tsx`: `/s` 设置命令
- `ui/setting-panels/`: 模块化设置面板（键盘、搜索、外观、更新日志、联系方式）

**共享工具 (`packages/blazwitcher-extension/shared/`)：**
- `data-processing.ts`: 处理标签页、书签、历史记录数据
- `utils.ts`: 通用工具函数，包括搜索、排序、分组
- `constants.ts`: 应用常量
- `types.ts`: TypeScript 类型定义
- `releases.json`: 从 GitHub releases 生成

**后台服务：**
- `TabGroupManager` 类处理 AI 标签分组
- 侧边栏 ↔ background 的消息传递
- Chrome API 集成（tabs、bookmarks、history、storage、sidePanel）

### 服务端架构（NestJS）

位于 `server/src/`：
- **ark 模块** (`modules/ark/`): AI 服务集成，用于标签分组
  - `ark.service.ts`: 流式 LLM API 调用，用于标签分类
  - `ark.controller.ts`: HTTP 端点
  - `parser.ts`: Prompt 解析工具
- **prompts** (`prompts/`): AI 标签分组的提示词
- 使用环境变量配置 API 密钥（ARK_API_KEY、ARK_API_URL、ARK_API_MODEL）

### 文档站点

使用 Next.js 16（App Router）+ Tailwind CSS 构建，位于 `packages/blazwitcher-doc/`：
- 使用 `next-intl` 实现国际化
- 集成 Vercel Analytics
- 组件采用 shadcn/ui 模式

## 关键约定

### 代码风格
- **格式化工具**: Biome，使用 tab 缩进（宽度：2）
- **分号**: 按需使用（非强制）
- **引号**: JS/TS 使用单引号
- **行宽**: 120 字符
- **导入组织**: 由 Biome 自动组织
- 遵循 `biome.json` 和 `.cursor/rules/rules.mdc` 中的规则

### 路径别名
扩展使用 `~*` 前缀进行导入：
```typescript
import { searchConfigAtom } from '~sidepanel/atom'
import { MAIN_WINDOW } from '~shared/constants'
import plugins from '~plugins'
```

### 提交规范
使用 `pnpm commit` 进行带 emoji 的规范化提交：
- Scope 与 workspace 名称匹配：`blazwitcher-extension`、`blazwitcher-doc`、`server`、`architecture`、`changeset`
- Type 类型：feat、fix、docs、style、refactor、perf、test、build、ci、chore、revert

### 状态管理
扩展使用 Jotai 进行状态管理：
- Atoms 定义在 `sidepanel/atom/`：`searchConfigAtom`、`shortcutAtom`、`windowAtom`、`i18nAtom` 等
- 使用 observable-hooks 集成 RxJS

### Chrome 扩展 Manifest
使用 Manifest V3，具有以下权限：
- tabs、tabGroups、bookmarks、history、storage、windows、favicon、sidePanel、contextMenus、scripting
- 所有 URL 的主机权限（AI 功能需要）
- 默认快捷键：Cmd/Ctrl+Shift+K

## 重要说明

### 环境变量
- 根目录的 `.env` 文件包含 `CHANGESET_READ_REPO_TOKEN`，用于 GitHub releases
- 服务端需要 `ARK_API_KEY`、`ARK_API_URL`、`ARK_API_MODEL` 用于 AI 功能

### 构建流程
- 扩展在 dev/build 前使用 Plasmo 的 prebuild 脚本（`scripts/pre-build.ts`）
- 服务端启动前需要运行 `bun src/prompts/parse-prompt.ts` 解析提示词

### 测试
- 服务端配置了 Jest（`test:*` 脚本）
- 扩展目前没有测试配置

### 国际化
- 扩展支持 i18n，locales 文件位于 `packages/blazwitcher-extension/locales/`
- 默认语言：英文（`en`）
- 文档站点使用 next-intl

### 发布流程
1. 修改代码并使用 `pnpm commit` 提交
2. 如需要，创建 changeset
3. 运行 `pnpm bump_and_push_and_fetch` 完成版本升级、发布到 GitHub 并更新扩展
4. 构建生产包后手动发布到 Chrome Web Store
