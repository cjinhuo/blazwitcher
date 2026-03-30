---
name: changeset-generator
description: 生成 Changeset 变更日志文件。当用户需要记录功能变更、bug 修复或添加新版本变更说明时调用此 skill，自动生成符合规范的 changeset 文件。
---

# Changeset 变更日志生成器

当用户明确要求“添加 changeset / 记录变更日志 / bump 版本说明 / 准备发布说明”时，必须遵循以下规范自动生成 changeset 文件。

## 决策顺序与优先级

1. **先判断是否需要 changeset**：只有在用户明确要求添加/补 changeset 时才执行本 skill。
2. **与提交的前后顺序**：若用户同一请求里同时要求“添加 changeset + 提交”，必须**先生成 changeset 文件**，再进行 Git 提交（确保 changeset 被包含在本次提交内）。
3. **不确定时的默认策略**：当无法唯一确定包名或 bump type 时，列出候选并让用户选择（不要擅自猜测）。

## 包名获取

changeset 文件的 YAML front matter 里的 key 必须是要发布的包名。优先根据本次变更涉及的文件路径来推断包名；如果无法唯一确定，则列出候选包并让用户选择。

### npm/yarn/pnpm 项目（JavaScript/TypeScript）

1. 根据变更文件路径，向上查找最近的 `package.json`
2. 读取该 `package.json` 的 `name` 字段作为包名

示例：
- 变更文件 `packages/auth/src/login.ts` → 包名取 `packages/auth/package.json` 的 `name`（如 `@scope/auth`）
- 变更文件 `apps/web/src/main.ts` → 包名取 `apps/web/package.json` 的 `name`（如 `@scope/web`）

如果变更文件不在任何子包目录下（例如只改了根目录配置），则使用根 `package.json` 的 `name` 作为包名，或由用户明确指定应 bump 的包。

### uv/poetry/hatch 项目（Python）

1. 根据变更文件路径，向上查找最近的 `pyproject.toml`
2. 读取该 `pyproject.toml` 的 `project.name` 或 `tool.poetry.name` 作为包名

示例：
- 变更文件 `packages/core/src/main.py` → 包名取 `packages/core/pyproject.toml` 的 `project.name`（如 `my-core`）
- 变更文件 `apps/api/routes/user.py` → 包名取 `apps/api/pyproject.toml` 的 `tool.poetry.name`（如 `api-service`）

### Cargo 项目（Rust）

1. 根据变更文件路径，向上查找最近的 `Cargo.toml`
2. 读取该 `Cargo.toml` 的 `package.name` 作为包名

示例：
- 变更文件 `crates/utils/src/lib.rs` → 包名取 `crates/utils/Cargo.toml` 的 `package.name`（如 `my-utils`）
- 变更文件 `apps/cli/src/main.rs` → 包名取 `apps/cli/Cargo.toml` 的 `package.name`（如 `my-cli`）

### Go 项目

Go 项目通常使用模块路径管理且不一定存在“包名=发布单元”的统一约定，可根据变更文件路径推断一个最小 scope 作为包名候选：
- `pkg/auth/jwt.go` → `auth`
- `internal/db/conn.go` → `db`
- `cmd/server/main.go` → `server`

如果变更文件不在任何明确的模块/目录下（如根目录配置文件），则省略包名或使用通用包名（如 `root`、`config`），并优先让用户确认。

### 其他类型项目

当项目不满足以上语言/包管理工具的识别条件时，根据变更文件所在目录推断一个合理的包名（或 scope），并在不确定时列出候选让用户确认

#### 通用目录结构

| 变更路径                       | 推荐包名/Scope   |
| ------------------------------ | ---------------- |
| `src/components/*`             | 组件名           |
| `src/pages/*`, `src/app/*`     | 页面/路由名      |
| `src/hooks/*`, `src/utils/*`   | `hooks`, `utils` |
| `cmd/*`, `pkg/*`, `internal/*` | 命令/包/模块名   |
| `README.md`                    | `docs`           |
| `.github/workflows/*`          | `ci`             |
| `Dockerfile`                   | `docker`         |

## Changeset 文件格式

文件位置：`.changeset/` 目录
文件命名：使用随机组合命名（形容词-名词-动词），如 `brave-monkeys-cry.md`

### 格式规范

```markdown
---
"package-name": bump-type
---

英文描述
中文描述
```

### 示例

```markdown
---
"blazwitcher": minor
---

feat: new two separate shortcut for tab,bookmark and history to control whether to create a new tab or open it on the current page
feat: 给标签页,书签和历史记录各新增两个独立的快捷键来控制是否新建标签页还是在当前页面打开
```

## 版本类型（Bump Type）

| Bump Type | 适用场景                      |
| --------- | ----------------------------- |
| `major`   | 破坏性变更、不兼容的 API 变更 |
| `minor`   | 新增功能、向后兼容的功能增强  |
| `patch`   | Bug 修复、文档更新、小改动    |

## 自动判断规则

根据变更类型自动推荐 bump type：

| 变更类型                | 推荐 Bump Type |
| ----------------------- | -------------- |
| `feat` (新功能)         | `minor`        |
| `fix` (Bug 修复)        | `patch`        |
| `breaking` (破坏性变更) | `major`        |
| `docs` (文档更新)       | `patch`        |
| `refactor` (重构)       | `patch`        |
| `perf` (性能优化)       | `patch`        |
| `style` (样式调整)      | `patch`        |
| `chore` (杂项)          | `patch`        |

## 随机文件名生成

使用以下词库随机组合生成文件名：

**形容词**：brave, silent, happy, gentle, swift, bright, calm, clever, cool, eager, fair, fast, fresh, good, great, kind, light, loud, nice, old, quick, rare, rich, safe, shy, slow, smart, soft, tall, thin, tiny, warm, weak, wild, wise, young

**名词**：ants, bees, cats, dogs, elks, fish, goats, hens, inks, jays, keys, lions, mice, newts, owls, pigs, quails, rats, seals, tigers, umbrellas, voles, wolves, yaks, zebras, apples, books, clouds, doors, eagles

**动词**：act, ask, be, bid, bow, buy, cry, cut, dig, do, eat, end, fly, get, go, hide, hit, jump, keep, lay, lie, look, make, meet, mix, move, open, pay, play, pull, push, put, read, rest, ride, rise, run, say, see, sell, set, show, sit, spin, stay, swim, take, talk, tell, try, turn, wait, walk, watch, work, write

示例：`brave-cats-cry.md`, `silent-dogs-fly.md`, `happy-fish-swim.md`

## 使用场景

1. 用户要求添加 changeset
2. 完成功能开发后需要记录变更
3. 修复 Bug 后需要添加变更日志
4. 发布新版本前整理变更记录

## 输出要求（必须满足）

1. **生成一个新的 changeset 文件**：写入 `.changeset/<随机名>.md`
2. **YAML front matter 正确**：key 为包名（字符串需带双引号），value 为 bump type（`major|minor|patch`）
3. **描述双语**：正文必须同时包含英文与中文两行描述（可使用 Markdown）
4. **不修改历史 changeset**：除非用户明确要求修改既有文件，否则只新增文件

## 多包支持

如果需要同时更新多个包，可以在 YAML front matter 中列出：

```markdown
---
"blazwitcher": minor
"blazwitcher-doc": patch
---

feat: add new feature across packages
feat: 跨包添加新功能
```

## 注意事项

1. 每个 PR/变更只需要添加一个 changeset 文件
2. 文件名必须唯一，使用随机组合避免冲突
3. 描述内容支持 Markdown 格式
4. 必须同时提供中英文描述
5. 不要手动修改已有的 changeset 文件（除非必要）
