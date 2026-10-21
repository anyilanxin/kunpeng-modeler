# AGENTS.md — AI 协作开发入口

> `CLAUDE.md` 是指向本文件的**软链接**（非实体文件）：Claude Code 与 ZCode 共用同一份入口，内容只改本文件，勿把软链替换成实体文件。

## 这个仓库是什么

Kunpeng Modeler：鲲鹏 BPMN 2.0 / DMN 1.6 桌面建模应用（**Tauri 2.0 + Vue 3 + Vite** 单应用；UI 为 Naive UI + UnoCSS，状态 Pinia，国际化 vue-i18n；macOS dmg / Windows NSIS 双平台分发，productName `Kunpeng Modeler`）。

- **本仓只做宿主层**：建模器内核全部来自 npm 已发布包 `@kunpeng-js/*`（bpmn-js / dmn-js / properties-panel / moddle / linting / behaviors / element-templates 等，2026.10.x），内核开发在兄弟仓库 `kunpeng-bpm`（turbo + pnpm monorepo）——画布行为、渲染、建模 API、规范语义类问题去内核仓修复、发版，再回本仓升级依赖，不在本仓改内核。
- 关键代码：`src/components/BpmnModeler.vue` / `DmnModeler.vue`（两线建模器宿主组件）、`src/components/modeler/`（画布工具栏 / 问题面板 / 状态栏 / 标题栏 / 版本弹层）、`src/views/`（HomeView / DesignerView）、`src/stores/`（tabs / theme / panelLayout / lintIssues）、`src/services/modelFile.ts`（文件打开保存，走 Tauri fs/dialog）、`src-tauri/`（Rust 薄壳，仅 main.rs / lib.rs，加打包配置）。
- 版本唯一来源：根 `package.json` 的 `version`（编译期注入 `__APP_VERSION__`，`tauri.conf.json` 引用 `../package.json`）。
- 仓库：github.com/anyilanxin/kunpeng-modeler；三平台打包指南见 [docs/build-guide.md](docs/build-guide.md)（其 `cd dists/kunpeng-modeler` 是 monorepo 时代旧路径，本仓直接在根目录执行）。

## 恢复开发现场（每次新会话的固定动作）

1. 本仓无本地计划文档机制，**进度以 git 历史为准**：`git log --oneline -15` 看最近在做什么、遗留什么；
2. 按下方「技能路由」按需加载技能（ZCode 按 SKILL.md 的 description 自动触发；其他工具手动通读）；
3. 有长期价值的结论写入 ZCode 长期记忆（跨会话自动可用）。

## 技能路由（什么时候用哪个技能）

| 任务 | 技能入口 |
|------|----------|
| 改动收尾提交 / 编写 commit message / 决定是否 push | [commit-standards](.agents/skills/commit-standards/SKILL.md)（本仓唯一本地技能：门禁 `pnpm build`，涉桌面端另跑 tauri 打包） |
| 建模器内核开发 / 调试 / bug 修复 | [bpmn-js](../kunpeng-bpm/.agents/skills/bpmn-js/SKILL.md) / [dmn-js](../kunpeng-bpm/.agents/skills/dmn-js/SKILL.md)（内核仓技能，切到 `../kunpeng-bpm` 工作） |
| `@kunpeng-js/*` 版本升级、跨仓契约同步、npm 发版协调 | [iteration](../kunpeng-bpm/.agents/skills/iteration/SKILL.md)（内核仓技能） |
| BPMN / DMN 规范语义与结构争议仲裁 | [bpm](../kunpeng-bpm/.agents/skills/bpm/SKILL.md) / [dmn](../kunpeng-bpm/.agents/skills/dmn/SKILL.md)（内核仓技能） |
| 功能规划、需求澄清、里程碑与验收裁决 | [prd](../kunpeng-bpm/.agents/skills/prd/SKILL.md)（内核仓技能） |
| 桌面端打包（dmg / exe 交叉编译） | [docs/build-guide.md](docs/build-guide.md) |

> 跨仓技能路径按「兄弟目录检出」书写（`../kunpeng-bpm`）；克隆布局不同时按仓库名定位。本仓任务大多落在应用层 + commit-standards；一旦要动内核源码，就整体切换到内核仓的工作方式（以其 AGENTS.md 为准）。

## 开发与验证流程

1. 动手前先判问题归属：宿主层（布局 / 面板 / 文件 IO / 主题 / 标签页 / 打包）在本仓修；内核行为问题去内核仓修（见技能路由）；
2. 只用文件编辑工具改源码（Mimosa 拦截 sed 等命令直写）；
3. 标准开发循环 `pnpm tauri dev`（内部起 vite @ localhost:1420）；纯前端可 `pnpm dev`，但 Tauri API（fs / dialog 等）仅桌面端可用；
4. **实测通过再收尾**，不接受"应该没问题"：UI 改动亮 / 暗双主题都要看（暗色走 `--bio-*` 语义令牌覆盖）；`@kunpeng-js/*` 依赖升级要冒烟导入导出、主题切换、lint 面板；
5. 按 [commit-standards](.agents/skills/commit-standards/SKILL.md) 收尾提交：门禁 `pnpm build` 通过；涉 `src-tauri/` 另跑对应 `build:dmg` / `build:exe` 验证；按路径暂存，多主题拆分提交。

## 致命陷阱速记

1. `vite.config.ts` 内置 Rolldown 符号冲突补丁（lang-expression 的 `h→h$kp`、OverviewRenderer 的 `h→h$ov`）：按字符串精确匹配源码，`@kunpeng-js/*` 升级后若报标识符冲突 / 未定义，先检查补丁目标文件内容是否变化；
2. `@kunpeng` dist 内残留的未 scoped 包名（如 `bpmn-js-properties-panel`）靠 `resolve.alias` 映射到 `@kunpeng-js/*`，新增依赖报"解析失败"时先想到补 alias；
3. `@kunpeng-js/bpmnlint-plugin-kunpeng-compat` 是 CJS 源码包，必须与 `@kunpeng-js/linting` 一起留在 `optimizeDeps.include`，移除会白屏；
4. 主题切换曾销毁画布容器（2026.10.5 根因修复）：内核包降级或升级后必须回归亮暗切换；
5. 版本号只改根 `package.json`（`__APP_VERSION__` 编译期注入、tauri.conf.json 引用它），别处手改不生效或被覆盖；
6. `dist/` 整目录在 .gitignore，但历史遗留 `dist/index.html` 处于 git 跟踪状态，status 常年出现它的改动——属构建产物噪声，提交时不要卷入，也不要擅自删跟踪（除非用户明确要求处理）；
7. macOS 上打 Windows 包走 `build:exe-xwin`（cargo-xwin 交叉编译）；`build:exe` 留给 Windows 本机真 MSVC 环境。

## 常用命令

```bash
pnpm install           # 首次 / 依赖变更
pnpm tauri dev         # 标准开发循环（vite @ localhost:1420 + 桌面窗口）
pnpm dev               # 仅前端（浏览器 @ 1420，无 Tauri API）
pnpm build             # 前端构建验证（提交门禁）
pnpm build:dmg         # macOS dmg（当前架构）
pnpm build:dmg-arm     # Apple 芯片 dmg
pnpm build:dmg-intel   # Intel dmg
pnpm build:exe-xwin    # Windows NSIS 交叉编译（macOS 上打 exe，详见 docs/build-guide.md）
```

> 安装包产物在 `src-tauri/target/{target}/release/bundle/`（dmg / nsis 子目录）。
