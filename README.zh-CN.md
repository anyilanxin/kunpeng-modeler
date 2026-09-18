# Kunpeng Modeler（鲲鹏建模器）

[![Version](https://img.shields.io/badge/version-2026.9.0-blue)](#版本信息)
[![License](https://img.shields.io/badge/license-MPL--2.0%20%2F%20MIT-green)](./LICENSE)

[English](./README.md) | [简体中文](./README.zh-CN.md)

Kunpeng Modeler 是一款桌面端 **BPMN 与 DMN 建模工具**，提供 BPMN 2.0 流程图与 DMN 决策表的可视化建模能力，以原生桌面应用的形式运行在 Windows、macOS 和 Linux 上。

## 功能特性

- **BPMN 2.0 建模** —— 基于 `bpmn-js` 的可视化流程图编辑，支持属性面板、元素模板、颜色选择、网格与缩略图
- **DMN 建模** —— 基于 `dmn-js` 的决策表与 DRD（决策需求图）编辑
- **规则校验** —— 通过 `bpmnlint` / `dmnlint` 对 BPMN、DMN 模型进行规则检查
- **流程模拟** —— 支持 BPMN 流程的 Token 推演模拟
- **中英文界面** —— 基于 vue-i18n 的双语支持

## 技术栈

- [Tauri 2](https://tauri.app/) —— 轻量级跨平台桌面壳（Rust 后端）
- [Vue 3](https://vuejs.org/) + TypeScript + Vite
- [bpmn-js](https://github.com/bpmn-io/bpmn-js) / [dmn-js](https://github.com/bpmn-io/dmn-js) 及 [bpmn-io](https://github.com/bpmn-io) 生态
- Ant Design Vue、Pinia、Vue Router

## 快速开始

环境要求：

- Node.js >= 22.20.0，包管理器使用 [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)（Tauri 构建依赖）

```bash
# 安装依赖
pnpm install

# 前端开发模式
pnpm dev

# 构建桌面应用
pnpm tauri build
```

## 版本信息

当前版本：**v2026.9.0**。版本号以 `dist/package.json` 为唯一来源：前端界面与模型导出元数据在构建时通过 `__APP_VERSION__` 常量读取；`dist/src-tauri/tauri.conf.json` 通过 `"version": "../package.json"` 指向同一来源。升级版本只需修改 `dist/package.json` 一处。

## 开源协议

本仓库的协议分为两部分：[Mozilla Public License 2.0](./licenses/MPL-2.0.txt) 与 [MIT License](./licenses/MIT.txt)，详见 [LICENSE](./LICENSE)。

- **无协议头信息**的文件适用 MIT；**有协议头信息**的文件按其标注的具体协议执行。因此 [packages/bpm](./packages/bpm/)、[packages/bpmn](./packages/bpmn/)、[packages/dmn](./packages/dmn/) 三个目录的代码大部分为 MIT。
- **新增文件**默认适用 MPL 2.0。
- 本应用使用了 `bpmn-js` 与 `dmn-js`，需遵循 [bpmn.io license](https://bpmn.io/license/)。

## 鸣谢

特别感谢 [bpmn-io](https://github.com/bpmn-io)。本项目构建在其优秀的开源库之上，包括 `bpmn-js`、`dmn-js`、`bpmn-js-properties-panel`、`bpmnlint`、`dmnlint` 等。
