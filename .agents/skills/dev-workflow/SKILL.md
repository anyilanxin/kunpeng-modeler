---
name: dev-workflow
description: MANDATORY closed-loop development workflow for ANY change in this repo (feature, bugfix, refactor, or requirement change). Eight steps with a review gate — branch → requirement doc → plan + user review → code → verify (build gate + dual-theme UI testing) → summarize → iterate → sync skills. Kernel issues route to the sibling kunpeng-bpm repo's own loop. Load this skill BEFORE starting any development task; coding without an approved plan or skipping steps is a violation.
---

# dev-workflow:开发/需求更改闭环(硬性规范)

本仓一切开发与需求更改的**硬性流程**(2026-10-24 自 kunpeng-bpm 线同步引入,见根 AGENTS.md「开发与验证流程」)。任何功能/缺陷/重构/行为变更必须完整走此闭环;**跳步直改代码、无评审先开工,均为违规**。唯一豁免:用户明示"此件一步完成、无需评审"。

**归属判定先于一切**:宿主层问题(布局/面板/文件 IO/主题/标签页/打包)在本仓走此闭环;内核行为问题切兄弟仓 `../kunpeng-bpm` 走**其**闭环(以其 AGENTS.md 为准),本仓只做依赖升级回灌。

## 开工前自问(10 秒核对)

- 我现在处于闭环第几步?产物(分支/文档/计划)在哪?
- 计划/需求文档**过评审门了吗**?没过 → 停,先交评审。
- 是需求/方案变更吗?是 → 回第 2/3 步重过评审门,不就地改。

## 八步闭环

| 步 | 动作 | 产物 | 常见违规 |
|----|------|------|----------|
| 1 分支需求 | 本仓从 main 切 `type/slug` 分支(feat/fix/perf/refactor);单仓无子模块 | 分支 | 在 main 上直接开发长任务 |
| 2 形成需求文档 | `docs/` 建需求/评估文档:是什么/为什么/验收标准;评估先行;先判宿主层 vs 内核归属 | 需求文档 | 没文档就动码;评估与实施混做;内核问题在本仓硬改 |
| 3 形成开发计划 + **评审门** | 同文档列分阶段计划(阶段/范围/验证/工作量),缓执行项显式登记;**交用户评审,通过后才进第 4 步** | 计划 + 评审结论 | 自批自做;把"待确认"当"已确认" |
| 4 开发代码 | 按阶段实施,每阶段独立提交;只用文件编辑工具改源码;message 见 commit-standards | 阶段提交 | 一 commit 混多主题;跨阶段抢跑 |
| 5 验证测试 | 每阶段:门禁 `pnpm build`;涉 `src-tauri/` 另跑 `build:dmg` / `build:exe`;UI 改动亮/暗双主题实测(`pnpm dev` @1420 或 `pnpm tauri dev`,Tauri API 仅桌面端);依赖升级冒烟导入导出/主题切换/lint 面板;证据入文档 | 验证记录 | 只构建不做 UI 实测;验完不留证据 |
| 6 总结问题 | 踩坑/根因/**新契约**(改了什么导致方式变化)写进文档执行记录与 ZCode 长期记忆 | 执行记录 | 验完不总结,契约只留在对话里 |
| 7 继续完善 | 回第 4 步循环(下一阶段/验证暴露的问题)直至完成;需求变更回 2/3 步重过评审门 | — | 中途变更不回炉评审 |
| 8 同步技能 | 同步 AGENTS.md 契约条目、`.agents/skills/` 相关技能、需求文档回填终态;长期结论入 ZCode 记忆 | 知识面更新 | **不同步技能=未完成(DoD)** |

## 评审门(第 3 步核心)

- 需求文档/开发计划/开发文档,**进入开发前必须经用户评审通过**——目的:防计划或需求本身有误就开工。
- 豁免仅限用户明示"一步完成、无需评审"(如单行修复、纯登记文档)。
- 循环中需求/方案变更:回到第 2/3 步,重过此门。

## 完成定义(DoD)

开发完成的判据 = 验证全绿 + 提交落盘并 push + **知识同步完成**(第 8 步)。凡产生新契约/新陷阱/新流程而未同步技能,一律视为未完成。

## 与其他技能的关系

- 提交规范(commit-standards)在第 4 步生效;
- 内核开发/规范仲裁等场景切 `../kunpeng-bpm` 仓技能(见 AGENTS.md 技能路由);
- 本技能是**流程总闸**,先于一切开发类技能加载。
