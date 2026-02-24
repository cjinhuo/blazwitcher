# Changeset Skill 创建计划

## 目标

在 `/Users/bytedance/Desktop/github/blazwitcher/.trae/skills/` 目录下创建一个 changeset skill，用于自动化生成符合规范的 changeset 文件。

## 背景分析

### 项目现有配置

1. **Changeset 已集成**：项目已安装 `@changesets/cli` 和 `changesets-toolkit`
2. **配置文件**：`.changeset/config.json` 已配置
3. **Monorepo 结构**：
   - 根目录 `package.json` 的 `workspaces` 字段：`["packages/*", "server"]`
   - `pnpm-workspace.yaml`：`packages: ['packages/**', 'server']`
4. **包信息**：
   - `blazwitcher`（`packages/blazwitcher-extension/`）- **公开发布的主包**
   - `blazwitcher-doc`（`packages/blazwitcher-doc/`）- **私有包**
5. **基础分支**：`master`

### Changeset 文件格式

根据用户提供的示例和 changeset 官方文档，changeset 文件格式如下：

```markdown
---
"package-name": bump-type
---

变更描述内容
```

其中：
- `package-name`：包名（从 workspace 动态获取）
- `bump-type`：版本类型（`patch` | `minor` | `major`）
- 变更描述：支持 Markdown 格式

### 现有 Skill 格式

参考 `git-auto-commit` 和 `release-publisher` 的 SKILL.md 格式：

```markdown
---
name: skill-name
description: skill 描述
---

# 标题

详细说明...
```

## 实现方案

### 1. 创建目录结构

```
.trae/skills/
└── changeset-generator/
    ├── SKILL.md          # Skill 配置和使用说明
    └── get-packages.js   # 获取 workspace 包名的脚本
```

### 2. get-packages.js 脚本设计

#### 功能
- 解析 `pnpm-workspace.yaml` 或 根目录 `package.json` 的 `workspaces` 字段
- 使用 glob 匹配获取所有包目录
- 读取每个包的 `package.json`，提取包名
- 过滤掉 `private: true` 的包（可选）
- 返回可发布的包名列表

#### 脚本逻辑
```javascript
// 1. 优先读取 pnpm-workspace.yaml
// 2. 如果不存在，读取 package.json 的 workspaces 字段
// 3. 使用 fast-glob 解析 workspace 模式
// 4. 遍历每个包目录，读取 package.json
// 5. 输出包名列表（JSON 格式或换行分隔）
```

#### 输出格式
```json
["blazwitcher", "blazwitcher-doc"]
```

或仅输出非私有包：
```json
["blazwitcher"]
```

### 3. SKILL.md 内容设计

#### Skill 元信息
- **name**: `changeset-generator`
- **description**: `生成 Changeset 变更日志文件。当用户需要记录功能变更、bug 修复或添加新版本变更说明时调用此 skill，自动生成符合规范的 changeset 文件。`

#### 核心功能
1. **动态获取包名**：
   - 运行 `get-packages.js` 脚本获取可用包名
   - 支持用户选择要发布的包

2. **自动判断变更类型**：
   - `patch`：Bug 修复、文档更新、小改动
   - `minor`：新功能、非破坏性变更
   - `major`：破坏性变更、API 变更

3. **生成规范的 changeset 文件**：
   - 文件位置：`.changeset/` 目录
   - 文件名：随机生成（如 `brave-monkeys-cry.md`）
   - 格式符合 changeset 规范

4. **支持多语言描述**：
   - 英文描述（必须）
   - 中文描述（可选）

### 4. 变更类型判断规则

| 变更类型 | 推荐 Bump Type |
| --- | --- |
| 新增功能 (`feat`) | `minor` |
| Bug 修复 (`fix`) | `patch` |
| 破坏性变更 (`breaking`) | `major` |
| 文档更新 (`docs`) | `patch` |
| 重构 (`refactor`) | `patch` |
| 性能优化 (`perf`) | `patch` |
| 样式调整 (`style`) | `patch` |

### 5. 文件名生成策略

使用类似 changeset 官方的随机名称生成方式（形容词-名词-动词组合），例如：
- `brave-monkeys-cry.md`
- `silent-roses-bloom.md`
- `happy-clouds-dance.md`

## 执行步骤

1. **创建 skill 目录**
   ```bash
   mkdir -p .trae/skills/changeset-generator
   ```

2. **创建 get-packages.js 脚本**
   - 解析 workspace 配置
   - 使用 fast-glob 获取包目录
   - 读取并返回包名列表

3. **创建 SKILL.md 文件**
   - 编写 skill 元信息
   - 编写使用说明
   - 编写变更类型判断规则
   - 编写文件格式规范
   - 说明如何使用 get-packages.js 脚本

4. **验证**
   - 运行 `node get-packages.js` 确认输出正确
   - 确认 SKILL.md 格式正确
   - 确认描述信息准确

## 预期产出

### 文件 1：`/Users/bytedance/Desktop/github/blazwitcher/.trae/skills/changeset-generator/SKILL.md`

该 skill 将支持：
- 自动生成 changeset 文件
- 智能判断版本 bump 类型
- 生成中英双语变更描述
- 遵循项目现有的 changeset 配置

### 文件 2：`/Users/bytedance/Desktop/github/blazwitcher/.trae/skills/changeset-generator/get-packages.js`

该脚本将：
- 解析 `pnpm-workspace.yaml` 或 `package.json` 的 workspaces 字段
- 动态获取 monorepo 中的所有包名
- 支持过滤私有包
- 输出 JSON 格式的包名列表

## 依赖说明

脚本将使用项目已安装的依赖：
- `fast-glob`（已在 devDependencies 中）
- Node.js 内置模块：`fs`, `path`, `yaml`（或使用 JS-YAML）

如果需要解析 YAML，可以使用简单的字符串解析或添加 `yaml` 包。
