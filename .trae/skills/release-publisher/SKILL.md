---
name: "release-publisher"
description: "Handles version bumping and release publishing for blazwitcher extension. Invoke when user wants to release, publish, or bump version."
---

# 版本发布助手

此 skill 负责处理 blazwitcher 扩展的完整发布流程。

## 发布流程概览

```
changeset_version -> push-release -> fetch-releases -> publish chrome extension store
```

分为 2 个步骤：
1. `changeset_version -> push-release`
2. `fetch-releases -> build prod package -> publish chrome extension store -> git add .`

## 可用命令

### 完整发布（本地推荐）

一键执行完整发布流程：

```bash
pnpm run bump_and_push_and_fetch
```

此命令将：
1. 使用 changeset 升级版本号
2. 推送 release 到 GitHub
3. 获取 blazwitcher-extension 的 releases

### 分步命令

#### 1. 仅升级版本

```bash
pnpm run bump_version
```

使用 changeset 升级版本并可选推送到 git。

#### 2. 推送发布

```bash
pnpm run push_release
```

将最新 release 推送到 GitHub。

#### 3. 获取 Releases

```bash
pnpm run fetch_releases
```

获取 blazwitcher-extension 的 releases。

#### 4. 升级并推送（不获取）

```bash
pnpm run bump_and_push
```

组合 bump_version 和 push_release 步骤。

## 生产构建

发布前，创建生产构建包：

```bash
pnpm package
```

这将创建一个可以打包并发布到商店的生产构建包。

## 前置条件

- 确保 `.env` 文件存在且包含必要的环境变量
- Git 仓库应该是干净的（无未提交的更改）
- Changeset 应该正确配置

## 典型发布流程

1. **确保代码就绪**：所有更改已提交并测试通过
2. **运行完整发布命令**：
   ```bash
   pnpm run bump_and_push_and_fetch
   ```
3. **构建生产包**（如需要）：
   ```bash
   pnpm package
   ```
4. **发布到 Chrome 扩展商店**（手动步骤或通过 CI）

## 故障排除

- 如果 `bump_version` 失败，检查 `.env` 文件是否存在且变量正确
- 如果 `push_release` 失败，验证 GitHub 凭证和权限
- 如果 `fetch_releases` 失败，检查网络连接和 GitHub API 访问权限
