---
name: changeset-generator
description: 生成 Changeset 变更日志文件。当用户需要记录功能变更、bug 修复或添加新版本变更说明时调用此 skill，自动生成符合规范的 changeset 文件。
---

# Changeset 变更日志生成器

当用户需要为代码变更添加 changeset 记录时，必须遵循以下规范自动生成 changeset 文件。

## 前置步骤

在生成 changeset 之前，先运行以下脚本获取可用的包名列表：

```bash
node .trae/skills/changeset-generator/get-packages.js
```

输出示例：
```json
["blazwitcher"]
```

如需查看所有包（包含私有包）：
```bash
node .trae/skills/changeset-generator/get-packages.js --include-private
```

如需查看详细信息：
```bash
node .trae/skills/changeset-generator/get-packages.js --detailed
```

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
