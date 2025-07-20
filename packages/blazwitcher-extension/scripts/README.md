# GitHub Releases 管理脚本

这个目录包含了用于管理 GitHub releases 的脚本工具。

## 脚本列表

### 1. common.ts

共用工具函数库，包含所有脚本的通用功能。

#### 功能

- **环境变量管理**: `loadEnvFile()` - 使用 `dotenv` 库加载 `.env` 文件
- **版本比较**: `compareVersions()` - 语义化版本比较
- **GitHub API**: `getGitHubToken()`, `getGitHubHeaders()` - GitHub API 认证
- **文件操作**: `readJsonFile()`, `writeJsonFile()`, `ensureDirectoryExists()` - 文件读写工具
- **路径管理**: `PATHS` 常量 - 统一的路径配置
- **类型定义**: `GitHubRelease`, `ChangelogEntry` 等接口定义
- **配置常量**: `GITHUB_CONFIG` - GitHub API 配置

#### 导出的工具函数

```typescript
// 路径工具
export function getProjectRootDir(): string
export function getExtensionRootDir(): string

// 环境变量
export function loadEnvFile(): void
export function getGitHubToken(): string

// 版本比较
export function compareVersions(version1: string, version2: string): number

// GitHub API
export function getGitHubHeaders(token?: string): Record<string, string>

// 文件操作
export function readJsonFile<T>(filePath: string): T | null
export function writeJsonFile(filePath: string, data: any): boolean
export function ensureDirectoryExists(dirPath: string): void

// 常量
export const PATHS: {
  ROOT_DIR: string
  EXTENSION_DIR: string
  CHANGELOG: string
  RELEASES_JSON: string
  ENV_FILE: string
}

export const GITHUB_CONFIG: {
  REPO_OWNER: string
  REPO_NAME: string
  API_BASE_URL: string
  RELEASES_URL: string
}
```

### 2. fetch-github-releases.ts

用于从 GitHub API 拉取 blazwitcher 项目的 releases 数据并保存到本地文件。

#### 功能

- 从 `https://api.github.com/repos/cjinhuo/blazwitcher/releases` 拉取数据
- 使用环境变量 `CHANGESET_READ_REPO_TOKEN` 进行身份验证
- 将数据保存到 `shared/releases.json` 文件
- 使用 `common.ts` 中的工具函数进行统一的错误处理和文件操作

#### 使用方法

```bash
# 使用 npm 脚本（推荐）
pnpm run fetch-releases

# 直接运行脚本
npx tsx scripts/fetch-github-releases.ts
```

### 3. push-new-release.ts

用于自动检查本地 changelog 版本与线上 release 版本，并在需要时创建新的 GitHub release。

#### 功能

- 解析本地 `CHANGELOG.md` 文件获取最新版本
- 拉取线上最新的 release 版本进行比较
- 如果本地版本大于线上版本，自动创建新的 GitHub release
- 使用 GitHub API 创建 release，包含完整的 changelog 内容
- 使用 `common.ts` 中的版本比较和 API 工具函数

#### 使用方法

```bash
# 使用 npm 脚本（推荐）
pnpm run push-release

# 直接运行脚本
npx tsx scripts/push-new-release.ts
```

#### 版本比较逻辑

- 本地版本 > 线上版本：创建新的 release
- 本地版本 = 线上版本：无需操作
- 本地版本 < 线上版本：提示检查版本号

### 4. pre-build.ts

用于在构建前注入版本信息到 HTML 文件。

#### 功能

- 读取 `package.json` 获取当前版本号
- 更新 `sidepanel/index.html` 的 title 标签，注入版本信息
- 使用 `common.ts` 中的文件读取工具函数

#### 使用方法

```bash
# 通常在构建流程中自动调用
pnpm run prebuild
```

## 代码架构

### 重构说明

为了提高代码复用性和维护性，我们将所有脚本的共用功能提取到了 `common.ts` 文件中：

1. **统一的环境变量处理**: 所有脚本使用相同的 `loadEnvFile()` 函数
2. **统一的 GitHub API 配置**: 使用 `GITHUB_CONFIG` 常量和 `getGitHubHeaders()` 函数
3. **统一的文件操作**: 使用 `readJsonFile()` 和 `writeJsonFile()` 进行 JSON 文件操作
4. **统一的路径管理**: 使用 `PATHS` 常量避免硬编码路径
5. **统一的类型定义**: 所有 GitHub API 相关的类型定义集中管理

### 依赖关系

```
common.ts (基础工具库)
├── fetch-github-releases.ts (依赖 common.ts)
├── push-new-release.ts (依赖 common.ts 和 fetch-github-releases.ts)
└── pre-build.ts (依赖 common.ts)
```

## 环境变量配置

确保在项目根目录的 `.env` 文件中配置了 GitHub token：

```
CHANGESET_READ_REPO_TOKEN=your_github_token_here
```

## 数据结构

### releases.json

每个 release 包含以下主要字段：
- `tag_name`: 版本标签
- `name`: 发布名称
- `body`: 发布说明
- `created_at`: 创建时间
- `published_at`: 发布时间
- `html_url`: GitHub 页面链接
- `author`: 作者信息

### CHANGELOG.md 格式

脚本期望的 changelog 格式：

```markdown
# blazwitcher

## 0.5.4

### Patch Changes

- feat: 新功能描述
- fix: 修复问题描述

## 0.5.3

### Patch Changes

- feat: 另一个功能
```

## 错误处理

- 如果环境变量未设置，脚本会报错并退出
- 如果 GitHub API 请求失败，会显示详细的错误信息
- 如果文件读写失败，会显示相应的错误信息
- 如果 changelog 格式不正确，会提示解析失败

## 工作流程

1. 开发完成后，更新 `CHANGELOG.md` 文件，添加新版本信息
2. 运行 `pnpm run push-release` 检查并创建 release
3. 脚本会自动：
   - 读取本地最新版本
   - 获取线上最新版本
   - 比较版本号
   - 如果需要，创建新的 GitHub release

## API 参考

脚本使用的 GitHub API 端点：
- 获取 releases: `GET /repos/cjinhuo/blazwitcher/releases`
- 创建 release: `POST /repos/cjinhuo/blazwitcher/releases`

详细文档：https://docs.github.com/en/rest/releases/releases