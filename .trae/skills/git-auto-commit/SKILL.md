---
name: git-auto-commit
description: Git 自动提交工具。当用户需要提交代码变更、commit 更改或者完成任务后需要提交时，必须调用此 skill 自动生成符合规范的 commit message 并执行提交，默认推送到远端。
---

# Git 自动提交规范

当用户需要提交 Git 变更时，必须遵循以下规范自动生成 commit message 并执行提交。

## 提交流程

1. 执行 `git status` 查看当前变更
2. 执行 `git add .` 暂存文件（如果用户没有特别说明，默认提交所有变更文件）
3. 根据变更内容自动生成符合规范的 commit message
4. 执行 `git commit -m "<message>"` 提交
5. 执行 `git push` 推送到远端（**默认行为**，除非用户明确说"不 push"或"不推送"）

## 推送规则

- **默认推送**：提交完成后自动执行 `git push`
- **跳过推送**：仅当用户明确表示"不 push"、"不推送"、"只 commit"等类似意图时，才跳过推送步骤
- **推送失败处理**：如果推送失败，提示用户可能的原因（如需要先 pull、无远端分支等）

## Commit Message 规范

### 规范来源优先级

1. **优先读取项目根目录下的 `.commitlintrc.xx` 配置文件**
   - 如果存在该配置文件，严格遵循其中定义的规范
   - 读取可用的 commit type 列表及对应的 emoji
   - 读取 scope 的允许值及其他提交规则

2. **如果没有 `.commitlintrc.xx` 配置文件**
   - 参考 [commit-message-convention.md](./commit-message-convention.md) 中的默认规范
   - 使用标准的 conventional commits 格式

## 使用场景

1. 用户要求提交代码
2. 任务完成后需要保存变更
3. 需要生成规范的 commit message
