# Kunpeng Modeler

[![Version](https://img.shields.io/badge/version-2026.9.0-blue)](#version)
[![License](https://img.shields.io/badge/license-MPL--2.0%20%2F%20MIT-green)](./LICENSE)

[English](./README.md) | [简体中文](./README.zh-CN.md)

Kunpeng Modeler is a desktop **BPMN & DMN modeling tool**. It provides visual modeling for BPMN 2.0 process diagrams and DMN decision tables, and runs as a native desktop application on Windows, macOS and Linux.

## Features

- **BPMN 2.0 modeling** — visual process diagram editing powered by `bpmn-js`, with a properties panel, element templates, color picker, grid, and minimap
- **DMN modeling** — decision tables and DRD editing powered by `dmn-js`
- **Validation** — BPMN and DMN rule checks via `bpmnlint` / `dmnlint`
- **Simulation** — token simulation for BPMN process execution
- **Bilingual UI** — Chinese and English interface (vue-i18n)

## Tech Stack

- [Tauri 2](https://tauri.app/) — lightweight, cross-platform desktop shell (Rust backend)
- [Vue 3](https://vuejs.org/) + TypeScript + Vite
- [bpmn-js](https://github.com/bpmn-io/bpmn-js) / [dmn-js](https://github.com/bpmn-io/dmn-js) and the [bpmn-io](https://github.com/bpmn-io) ecosystem
- Ant Design Vue, Pinia, Vue Router

## Getting Started

Prerequisites:

- Node.js >= 22.20.0 with [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (required by Tauri)

```bash
# install dependencies
pnpm install

# run the frontend in development mode
pnpm dev

# build the desktop application
pnpm tauri build
```

## Version

Current version: **v2026.9.0**. `dist/package.json` is the single source of truth: the UI and model export metadata read it at build time via the `__APP_VERSION__` constant, and `dist/src-tauri/tauri.conf.json` points to the same file (`"version": "../package.json"`) for installer naming and bundle metadata. To release a new version, just bump `dist/package.json`.

## License

The licensing of this repository has two parts: the [Mozilla Public License 2.0](./licenses/MPL-2.0.txt) and the [MIT License](./licenses/MIT.txt). See [LICENSE](./LICENSE) for details.

- Files **without a license header** are MIT-licensed; files **carrying a specific license header** follow that license. Hence the code under [packages/bpm](./packages/bpm/), [packages/bpmn](./packages/bpmn/) and [packages/dmn](./packages/dmn/) is mostly MIT.
- **New files** added to this repository default to MPL 2.0.
- This application uses `bpmn-js` and `dmn-js`, and therefore follows the [bpmn.io license](https://bpmn.io/license/).

## Acknowledgements

Special thanks to [bpmn-io](https://github.com/bpmn-io) — this project is built on top of their excellent open-source libraries, including `bpmn-js`, `dmn-js`, `bpmn-js-properties-panel`, `bpmnlint` and `dmnlint`.
