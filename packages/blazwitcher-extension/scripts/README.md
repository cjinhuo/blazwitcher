# GitHub Releases Fetcher

这个脚本用于从 GitHub API 拉取 blazwitcher 项目的 releases 数据并保存到本地文件。

## 功能

- 从 `https://api.github.com/repos/cjinhuo/blazwitcher/releases` 拉取数据
- 使用环境变量 `CHANGESET_READ_REPO_TOKEN` 进行身份验证
- 将数据保存到 `shared/releases.json` 文件

## 使用方法

### 方法 1: 使用 npm 脚本（推荐）

```bash
pnpm run fetch-releases
```

### 方法 2: 直接运行脚本

```bash
npx tsx scripts/fetch-github-releases.ts
```

## 环境变量配置

确保在项目根目录的 `.env` 文件中配置了 GitHub token：

```
CHANGESET_READ_REPO_TOKEN=your_github_token_here
```

## 输出

脚本会将拉取到的 releases 数据保存到：
`/packages/blazwitcher-extension/shared/releases.json`

## 数据结构

每个 release 包含以下主要字段：
- `tag_name`: 版本标签
- `name`: 发布名称
- `body`: 发布说明
- `created_at`: 创建时间
- `published_at`: 发布时间
- `html_url`: GitHub 页面链接
- `author`: 作者信息

## 错误处理

- 如果环境变量未设置，脚本会报错并退出
- 如果 GitHub API 请求失败，会显示详细的错误信息
- 如果文件写入失败，会显示相应的错误信息