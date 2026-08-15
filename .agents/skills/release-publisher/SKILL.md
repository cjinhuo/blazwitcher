---
name: "release-publisher"
description: "Handles version bumping and release publishing for blazwitcher extension. Invoke when user wants to release, publish, or bump version."
---

# 版本发布助手

处理 blazwitcher 扩展的完整发布流程：版本升级 → GitHub Release → Chrome Web Store。

## 完整发布流程

```bash
# 1. 版本升级 + 推送 GitHub Release + 拉取 releases 数据
pnpm bump_and_push_and_fetch

# 2. 构建生产包（产物：packages/blazwitcher-extension/build/chrome-mv3-prod.zip）
pnpm package

# 3. 上传并发布到 Chrome Web Store
pnpm exec dotenv -e .env -- chrome-webstore-upload upload --source packages/blazwitcher-extension/build/chrome-mv3-prod.zip
pnpm exec dotenv -e .env -- chrome-webstore-upload publish
```

> 上传后需 Google 审核（通常 1-3 天）。发布前确认 `package.json` 版本号已通过 changeset 升级，且高于线上版本。

## 命令速查

| 命令                                                                       | 说明                          |
| -------------------------------------------------------------------------- | ----------------------------- |
| `pnpm bump_version`                                                        | 用 changeset 升级版本号并推送 |
| `pnpm push_release`                                                        | 推送 release 到 GitHub        |
| `pnpm fetch_releases`                                                      | 拉取扩展的 releases 数据      |
| `pnpm bump_and_push`                                                       | bump + push                   |
| `pnpm bump_and_push_and_fetch`                                             | bump + push + fetch（推荐）   |
| `pnpm package`                                                             | 构建生产包                    |
| `pnpm exec dotenv -e .env -- chrome-webstore-upload upload --source <zip>` | 上传到 Chrome Web Store       |
| `pnpm exec dotenv -e .env -- chrome-webstore-upload publish`               | 提交审核发布                  |

## 前置条件

- Git 工作区干净，改动已提交并测试通过
- Changeset 已正确配置
- `.env` 包含所需环境变量：
  - GitHub Release：`CHANGESET_READ_REPO_TOKEN`
  - Chrome Web Store：`EXTENSION_ID`、`CLIENT_ID`、`CLIENT_SECRET`、`REFRESH_TOKEN`、`PUBLISHER_ID`

## 故障排除

| 现象                            | 排查方向                                           |
| ------------------------------- | -------------------------------------------------- |
| `bump_version` 失败             | 检查 `.env` 是否存在及变量正确                     |
| `push_release` 失败             | 验证 GitHub 凭证和权限                             |
| `fetch_releases` 失败           | 检查网络连接和 GitHub API 访问                     |
| `chrome-webstore-upload` 报 401 | `REFRESH_TOKEN` 已过期，需重新获取                 |
| 上传报版本冲突                  | 确认版本号已通过 changeset 正确 bump               |
| `command not found: dotenv`     | 命令需加 `pnpm exec` 前缀（dotenv-cli 是本地依赖） |

> **首次配置或凭证过期** → 阅读 [chrome-webstore-setup.md](./chrome-webstore-setup.md) 完成 CLI 安装与 OAuth 凭证获取。
