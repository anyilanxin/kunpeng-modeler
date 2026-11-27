# 需求文档：补全 Apache-2.0 开源协议（LICENSE + NOTICE + 协议头）

- 日期：2026-11-27
- 分支：`feat/apache-license`
- 状态：待评审

## 1. 是什么 / 为什么

本仓（kunpeng-modeler，桌面建模器宿主应用）当前**没有任何开源协议文件**：无 LICENSE、无 NOTICE、无源码协议头、package.json 无 license 字段、README 无协议章节。对外开源分发（GitHub + 安装包）前必须补齐。

目标协议：**Apache License 2.0**（单协议仓）。协议文件与协议头格式**参考兄弟仓 kunpeng-engine**（`Projects/ay/kunpeng-engine-inner/kunpeng-engine`）：

- 引擎源码 Apache 头（块注释，含版权行 + 授权条款全文引用）：
  ```
  /*
   * Copyright 2014-present Open Networking Foundation
   * Copyright © 2020 camunda services GmbH (info@camunda.com)
   * Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  ```
- 引擎 `NOTICE` 为极短署名式：`ANYILANXIN / Copyright © 2026 ANYILANXIN XUANHONGZHOU`。
- 引擎 README 有「## Licenses」章节（Use License / License Notice / Compliance Feedback）。

> 注：引擎是多协议仓（AGPL 默认 + Apache/MPL 按目录），本仓是单 Apache 协议仓，故根 `LICENSE` 直接放 Apache-2.0 全文（取自引擎 `licenses/APACHE-2.0.txt`），不需要 `licenses/` 多协议目录。本仓代码为原创宿主层代码，协议头只带本仓版权行，不带引擎头里的 ONF/camunda 上游版权（那些属于引擎继承自 Zeebe 的文件）。

## 2. 交付物

| # | 内容 | 说明 |
|---|------|------|
| 1 | 根 `LICENSE` | Apache-2.0 全文（复制引擎 `licenses/APACHE-2.0.txt`） |
| 2 | 根 `NOTICE` | 简短署名，参考引擎格式：`Kunpeng Modeler` + `Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)` |
| 3 | 源码协议头 | 约 45 个自研源码文件，按语言注释语法套用引擎头格式（仅含本仓版权行），详见 §3 范围表 |
| 4 | `package.json` | 增加 `"license": "Apache-2.0"` |
| 5 | `README.md` | 末尾增加「## License」章节：Apache-2.0 指向 LICENSE/NOTICE + 合规反馈渠道（参考引擎 README，简化为单协议版） |

## 3. 协议头覆盖范围

**加头**（自研源码 / 自维护脚本配置，45 个）：

| 类别 | 文件 | 注释语法 |
|------|------|----------|
| TS (19) | `src/main.ts`、`src/router/index.ts`、`src/services/modelFile.ts`、`src/stores/*.ts`×4、`src/utils/*.ts`×4、`src/locales/*.ts`×5（含 index）、`src/vite-env.d.ts`、`vite.config.ts`、`uno.config.ts`、`.eslintrc.js` | `/* */` |
| Vue (14) | `src/App.vue`、`src/components/*.vue`×7、`src/components/modeler/*.vue`×4、`src/layouts/ModelerLayout.vue`、`src/views/*.vue`×2 | 文件顶部 `<!-- -->` |
| CSS (2) | `src/styles/modeler-base.css`、`modeler-dark.css` | `/* */` |
| Rust (3) | `src-tauri/build.rs`、`src/main.rs`、`src/lib.rs` | `/* */` |
| Shell (2) | `src-tauri/linux/postinstall.sh`、`postremove.sh` | `#` |
| NSIS (1) | `src-tauri/nsis/installer.nsi` | `;` |
| HTML (1) | 根 `index.html` | `<!-- -->` |
| XML (2) | `src-tauri/linux/x-bpmn.xml`、`x-dmn.xml`（MIME 注册） | `<!-- -->` |
| plist (1) | `src-tauri/Info.plist` | `<!-- -->` |

**不加头**（明确排除）：

- `dist/index.html`（构建产物，AGENTS.md 陷阱 #6：勿卷入提交）
- `auto-imports.d.ts`、`components.d.ts`（unplugin 自动生成）
- 全部 JSON（`package.json`/`tsconfig*`/`tauri.conf.json`/`capabilities/`，JSON 无注释语法）
- 锁文件：`pnpm-lock.yaml`、`Cargo.lock`
- 图标资源：`*.png/svg/ico/icns`、`src-tauri/icons/android/*.xml`（tauri icon 自动生成）
- 配置类：`.env*`、`.gitignore`、各类 ignore、`.editorconfig`、`.npmrc`、`.cargo/config.toml`、`pnpm-workspace.yaml`、`tsconfig*.json`
- 文档：`docs/`（含 `docs/*.html` 原型页）、`README.md`、`AGENTS.md`/`CLAUDE.md`（软链）
- `.v2c/plugin_root` 等杂项

## 4. 验收标准

1. `LICENSE` 为 Apache-2.0 全文；`NOTICE` 存在且署名正确；
2. §3 表列 45 个文件全部带协议头，头格式与引擎一致（版权行 `Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)`）；排除清单文件零改动；
3. `package.json` 含 `"license": "Apache-2.0"`；README 末尾有 License 章节；
4. 门禁 `pnpm build` 通过（协议头不得破坏任何文件的语法/编译，尤其 Vue 顶部注释、vite.config.ts、Rust、plist）；
5. `git status` 无意外文件卷入（特别是 `dist/index.html` 不出现在本次提交）。

## 5. 工作量与风险

- 工作量：小（一次性批量加头 + 4 个新文件/字段），单阶段完成。
- 风险点：
  - Vue 顶部 HTML 注释须在 `<template>/<script>` 之前，vite-plugin-vue 兼容（常规做法，风险低）；
  - `installer.nsi` 用 `;` 注释、`postinstall.sh` 用 `#`，语法各异需逐类处理；
  - `vite.config.ts` 含 Rolldown 符号冲突补丁（陷阱 #1），只加头部注释不动逻辑，构建门禁兜底。

## 6. 执行记录

2026-11-27 实施（评审门通过后单阶段完成）：

- 交付物落地：`LICENSE`（202 行 Apache-2.0 全文，复制自 kunpeng-engine `licenses/APACHE-2.0.txt`）、`NOTICE`（`Kunpeng Modeler` + `Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)`）、45 个源码文件协议头（TS/JS 19 + Vue 14 + CSS 2 + Rust 3 + SH 2 + NSIS 1 + HTML 1 + XML 2 + plist 1，全部纯新增行 0 删减，`git diff --numstat` 核实）、`package.json` `"license": "Apache-2.0"`、README 末尾 License 章节（含合规反馈渠道）。
- 排除清单零改动：`dist/index.html` 未手工触碰（构建再生属陷阱 #6 噪声，提交排除）；auto-imports.d.ts / components.d.ts / 全部 JSON / 锁文件 / 图标 / docs/ 均未加头。
- 位置规则注意点：XML/plist 协议头放在 `<?xml?>` 声明（及 plist 的 `<!DOCTYPE>`）**之后**（注释前置会破坏 XML prolog 合法性）；sh 协议头放 shebang 之后；Vue 用文件顶部 `<!-- -->`（vite-plugin-vue 兼容）。
- 验证证据：
  - `pnpm build` ✓（7.94s，构建成功）；
  - `cargo check`（src-tauri）✓（exit 0；24 个警告均为存量，与协议头无关）；
  - `bash -n` 两脚本 ✓、`plutil -lint Info.plist` OK、`xmllint` 两 MIME XML ✓；
  - 协议头计数 grep = 45 ✓；
  - `pnpm build:dmg` ✓（Rust 编译 + Info.plist 消费 + macOS 打包链路实测）；
  - `installer.nsi` 仅顶部新增 `;` 注释行，未重跑 Windows exe 交叉编译（该文件仅 NSIS 打包时消费，`;` 注释为 NSIS 基础语法，风险趋零；如需全量回归可跑 `pnpm build:exe-xwin`）。
- 知识同步：AGENTS.md 增「开源协议」契约条目（新建源码文件必须带同款头 + 排除范围）；ZCode 记忆 kunpeng-modeler-overview 更新（MPL-2.0 旧制 → Apache-2.0 新制，防旧记忆误导）。
