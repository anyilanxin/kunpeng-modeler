---
name: commit-standards
description: kunpeng-modeler 仓库的提交与推送规范：提交前构建验证门禁（pnpm build，涉桌面端另跑 tauri 构建）、commit message 规范（type(scope) 前缀 + 中文摘要 + 分条正文、无 AI 署名）、先审核再提交、多主题拆分、完成即提交并 push 的 DoD。改动准备提交、写 commit message、决定是否 push 时使用。
---

# 提交规范（构建门禁 + git commit / push）

改动完成到 git 提交的公共规范（自 kunpeng 系仓库适配引入，适配点：本仓为 Vite + Tauri 单应用，无独立 lint/typecheck 脚本，门禁用构建验证；消息格式沿用本仓既有 `type(scope): 中文摘要` 风格）。

## 何时用

- 改动完成、准备提交前
- 编写 commit message 时
- 决定要不要 push 时

## 提交门禁

提交前执行，通过才提交：

```bash
pnpm build        # 前端构建验证（vite build）
```

- 涉 `src-tauri/`（Rust / 桌面打包配置）的改动，另跑对应的 `pnpm build:dmg` / `build:exe` 验证后再提交；
- 依赖升级类改动（`@kunpeng-js/*` 等）以构建 + 页面冒烟为准；
- 纯文档 / README 改动可豁免门禁。

## 提交流程（按顺序）

1. 改动完成后**先自审 `git diff`**：变更范围与预期一致、无调试残留（console、临时文件、误入的 dist 产物）；
2. 涉**行为、依赖版本、构建配置**的改动，提交前向用户展示变更说明（diff 或摘要）再提交；纯文档类可直接提交；
3. 多个不相关改动拆成多个 commit，**每个 commit 只讲一个主题**；
4. commit message 按下方规范书写；
5. DoD：改动收尾**即提交并 push**（2026-10-24 与 kunpeng 系仓库同步对齐：换机恢复只依赖 git，未提交的工作在另一台电脑上不存在）。

## commit message 规范

- 首行 `type: 中文摘要`，type 英文取 `feat / fix / refactor / docs / style / test / chore / build / perf`；带作用域写法 `type(scope): 摘要`（如 `fix(bpm): …`，本仓既有风格，可选）；
- 正文分条写清**改了什么、为什么**（非平凡改动必须带）；
- **不带任何 AI 署名尾行**（`Co-Authored-By: …` 等）。

```text
fix(bpm): 升级 @kunpeng-js/bpmn-js 修复主题切换画布销毁

- 依赖升至 2026.10.5，根因是主题切换时包装层销毁画布容器
- 回归：亮暗切换、导入导出、暗色令牌覆盖
```

## 常见错误

| 错误 | 正确做法 |
|------|----------|
| 跳过 `pnpm build` 直接提交源码改动 | 构建通过再提交 |
| 改完直接 commit 涉依赖/行为改动 | 先展示变更说明，确认后提交 |
| message 无 type 前缀 | `type(scope)?: 中文摘要` |
| 正文一团或缺失 | 分条写改了什么、为什么 |
| message 带 AI 署名尾行 | 不带任何署名尾行 |
| 一个 commit 混多个主题 | 按主题拆分提交 |
| `git add -A` 卷入无关产物 | 按路径分批暂存 |
