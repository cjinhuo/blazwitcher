---
description: for allgit
globs: *.ts,*.tsx
always: true
---
生成的代码格式按照 [biome.json](../../biome.json) 规则

# 项目技术栈
- UI框架: React 18
- 编程语言: TypeScript
- 组件库: Semi
  - form 文档：https://semi.design/zh-CN/input/form
  - table 文档：https://semi.design/zh-CN/show/table
- 全局状态管理: jotai
- 样式开发: tailwind
- 项目构建：Vite

当涉及到字段类型不对时，需要自动取最新文档查看并校正

# UI 组件库
- Semi：https://semi.design/zh-CN/start/getting-started

# 命名规范
- 组件文件使用的中横线命名法（kebab-case） (e.g., code-editor/index.tsx)
- 组件命名使用大写开头的驼峰命名 (e.g., CodeEditor)
- 使用具名导出, 不要使用默认导出