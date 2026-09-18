# Kunpeng Modeler — 桌面建模工具设计稿

> 版本：2026.0.0 · 更新日期：2026-07-29

---

## 目录

1. [产品定位](#1-产品定位)
2. [设计语言规范](#2-设计语言规范)
3. [全局布局架构](#3-全局布局架构)
4. [页面详细设计](#4-页面详细设计)
5. [技术栈与架构](#5-技术栈与架构)
6. [BPMN/DMN 建模器组装](#6-bpndmn-建模器组装)
7. [组件清单与 naive-ui 映射](#7-组件清单与-naive-ui-映射)
8. [交互流程](#8-交互流程)
9. [明暗主题色值对照](#9-明暗主题色值对照)
10. [尺寸规范汇总](#10-尺寸规范汇总)
11. [开发计划](#11-开发计划)

---

## 1. 产品定位

**Kunpeng Modeler** 是一款基于 Tauri 2 的离线桌面端 BPMN/DMN 建模工具。

| 维度     | 说明                                                     |
| -------- | -------------------------------------------------------- |
| 目标用户 | 流程分析师、开发工程师、业务架构师                       |
| 核心价值 | 离线建模 · 本地文件管理 · 专业画布 · 属性编辑 · 校验纠错 |
| 支持规范 | BPMN 2.0（流程图）、DMN 1.3（决策表 + DRD 图）           |
| 部署形态 | 跨平台桌面应用（macOS / Windows / Linux），无需服务端    |

### 核心功能

- ✅ **多标签页编辑**：同时打开多个 BPMN/DMN 模型文件
- ✅ **BPMN 流程建模**：基于 bpmn-js，支持完整 BPMN 2.0 元素
- ✅ **DMN 决策建模**：DRD 图 + 决策表双视图切换
- ✅ **属性面板**：选中元素实时编辑属性（ID、名称、执行者、表单等）
- ✅ **校验纠错**：内建 lint 规则，底部状态栏实时显示错误/警告
- ✅ **明暗主题**：完整双主题支持
- ✅ **本地文件**：Tauri dialog 打开/保存 `.bpmn` / `.dmn` 文件

---

## 2. 设计语言规范

### 2.1 色彩系统

| 令牌               | 浅色主题  | 深色主题  | 用途                         |
| ------------------ | --------- | --------- | ---------------------------- |
| `--brand`          | `#0d9488` | `#2dd4bf` | 主色（按钮、强调线、激活态） |
| `--brand-light`    | `#14b8a6` | `#5eead4` | 主色 hover                   |
| `--brand-bg`       | `#f0fdfa` | `#042f2e` | 主色背景（选中行、tag）      |
| `--bg-app`         | `#f1f5f9` | `#0a0a0b` | 应用根背景                   |
| `--bg-surface`     | `#ffffff` | `#18181b` | 面板/卡片/标题栏             |
| `--bg-canvas`      | `#fafafa` | `#131316` | 建模画布                     |
| `--bg-hover`       | `#f1f5f9` | `#27272a` | hover 态背景                 |
| `--text-primary`   | `#0f172a` | `#f4f4f5` | 主文字                       |
| `--text-secondary` | `#475569` | `#a1a1aa` | 次要文字                     |
| `--text-tertiary`  | `#94a3b8` | `#71717a` | 辅助/占位                    |
| `--border`         | `#e2e8f0` | `#2a2a2e` | 边框                         |

**语义色**：`--success #10b981` · `--warning #f59e0b` · `--error #ef4444` · `--info #3b82f6`

**类型强调色**：BPMN `#0ea5e9`（蓝） · DMN `#8b5cf6`（紫）

### 2.2 字体

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Microsoft YaHei', sans-serif;
```

| 层级      | 字号    | 字重    | 用途                      |
| --------- | ------- | ------- | ------------------------- |
| Hero 标题 | 38px    | 800     | 欢迎页主标题              |
| 面板标题  | 15px    | 600     | 属性面板元素名            |
| 正文      | 14px    | 400     | 基准                      |
| 小字      | 12px    | 400     | 标签页、工具栏按钮        |
| 微字      | 10-11px | 500-600 | 状态栏、tooltip、分组标题 |

### 2.3 圆角与阴影

| 令牌          | 值                            | 用途             |
| ------------- | ----------------------------- | ---------------- |
| `--r-sm`      | 4px                           | 输入框、小按钮   |
| `--r-md`      | 6px                           | 按钮、标签页     |
| `--r-lg`      | 8px                           | 小地图           |
| `--r-xl`      | 12px                          | 卡片、悬浮操作条 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06)`   | 卡片             |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,.08)`  | 悬浮条、下拉     |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,.12)` | 大弹层           |

### 2.4 图标

使用 Carbon Design 图标集（`@iconify/json` → `i-carbon-*`），原型中用 emoji 占位。

### 2.5 间距栅格

4 / 8 / 12 / 16 / 24 / 32（8px 基准栅格）

### 2.6 过渡动画

```css
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

统一使用 `.15s var(--ease)` 过渡，欢迎页入场动画 `.4s fadeInUp`。

---

## 3. 全局布局架构

```
┌──────────────────────────────────────────────────────────────┐
│  应用标题栏 (38px)                                             │
│  📊 Kunpeng Modeler │ [审批流程.bpmn●✕][贷款审批.dmn ✕][＋]  │
│                                            🌓  ⚖(属性面板开关) │
├──────────────────────────────────────────────────────────────┤
│        │                                          │           │
│  窄工具 │     ┌─ 悬浮操作条（顶部居中）─────────┐  │  属性面板  │
│  栏     │     │ ✅▶️ │ ↩️↪️ │ ⬅️↔️➡️⇄⇅ │ −100%+🎯 │  │  340px    │
│  48px   │     └──────────────────────────────────┘  │           │
│        │                                          │           │
│  ⊟ 选择 │           BPMN / DMN 画布                │  常规      │
│  ✋ 平移 │         (bpmn-js / dmn-js)              │  执行者    │
│  ─────  │                                        │  表单      │
│  ↪ 连线 │                                        │  监听器    │
│  ⬚ 创建 │                                        │           │
│  ─────  │                           ┌─ 小地图 ─┐  │           │
│  ⫼ 空间 │                           │ ▫▫▫▫▫▫▫ │  │           │
│        │                           └──────────┘  │           │
├──────────────────────────────────────────────────────────────┤
│ 底部状态栏 (28px)                                              │
│ [⟨⟩ XML]│ ●未保存│ BPMN 2.0│ 元素:8    ✕2 ⚠3  • Engine 2026│
│ 视图切换  状态     规范      计数      报错     版本           │
└──────────────────────────────────────────────────────────────┘
```

### 布局层级（Flex 嵌套）

```
.modeler (flex: 1, column, overflow: hidden)
├── .titlebar          (38px, flex-shrink: 0)  — 应用标识 + 标签页 + 操作
├── .modeler-body      (flex: 1, row, overflow: hidden)
│   ├── .toolrail      (48px, flex-shrink: 0)  — 左侧窄工具栏
│   ├── .canvas-area   (flex: 1)               — 画布 + 悬浮条 + 小地图
│   └── .properties-panel (340px, flex-shrink: 0) — 右侧属性面板
└── .statusbar         (28px, flex-shrink: 0)  — 底部状态栏
```

---

## 4. 页面详细设计

### 4.1 欢迎页（单卡片入口）

```
                    📊 (80px Logo, teal 渐变 + 阴影)

                 Kunpeng Modeler (38px 渐变文字)
            一站式 BPMN / DMN 建模工作台 · 离线桌面端

    ┌─────────────────────────────────────────────────┐
    │ 🔄  新建 BPMN 流程图                         ›  │
    │      使用 BPMN 2.0 规范设计业务流程              │
    └─────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────┐
    │ 📋  新建 DMN 决策表                          ›  │
    │      可视化构建业务决策模型                       │
    └─────────────────────────────────────────────────┘
```

- 居中 hero + 两个垂直堆叠的入口卡片（最大宽度 480px）
- 背景使用 `radial-gradient` 顶部 teal 微光
- 卡片 hover 上浮 3px + 阴影加深 + 箭头右移
- 入场动画 `fadeInUp .4s`

### 4.2 BPMN 建模器

**标题栏**

- 左：`📊 Kunpeng Modeler` 品牌
- 中：文档标签页（多标签，激活态底部 teal 强调线，未保存显示橙色圆点）
- 右：`🌓` 主题切换 + `⚖` 属性面板开关

**左侧窄工具栏（48px）**

| 图标 | 功能             |
| ---- | ---------------- |
| ⊟    | 选择（默认激活） |
| ✋   | 平移/手型        |
| —    | 分隔线           |
| ↪    | 连线             |
| ⬚    | 创建节点         |
| —    | 分隔线           |
| ⫼    | 空间/分割        |
| ⇿    | 对齐分布         |

**画布悬浮操作条（顶部居中）**

| 分组      | 按钮                  |
| --------- | --------------------- |
| 校验/模拟 | ✅ 校验 · ▶️ 模拟运行 |
| 历史      | ↩️ 撤销 · ↪️ 重做     |
| 对齐      | ⬅️ ↔️ ➡️ ⇄ ⇅          |
| 缩放      | − [100%] + 🎯         |

**画布**

- 点阵网格背景（`radial-gradient`, 20px 间距）
- 右下角小地图（150×100px，毛玻璃背景）
- BPMN 元素：开始事件（绿色圆）、用户任务（蓝色圆角矩形）、网关（橙色菱形）、结束事件（红色粗边圆）

**属性面板（340px）**

- 头部：元素类型标签 + 元素名 + 类型图标 badge
- 分组（可折叠）：常规 / 执行者 / 表单 / 监听器 / 扩展属性
- 输入框：focus 态 3px teal 光晕

### 4.3 DMN 建模器（DRD 视图）

与 BPMN 同构，差异：

- 左侧窄工具栏无「对齐分布」（DRD 图不需要）
- 画布悬浮操作条无对齐组，校验按钮单独一组
- 元素样式：输入数据（蓝色矩形）、决策（紫色菱形/矩形）
- 双击决策节点进入决策表视图

### 4.4 DMN 决策表视图

```
决策模型 › 贷款审批决策          命中策略：唯一 (UNIQUE)

┌──┬───────────┬───────────┬───────────┬───────────┐
│ #│  输入: 月收入 │ 输入: 负债比 │ 输入: 信用评级│ 输出: 审批结果│
├──┼───────────┼───────────┼───────────┼───────────┤
│ 1│  > 50000   │  < 0.3    │  A        │  通过      │
│ 2│  > 30000   │  < 0.5    │  B        │  人工审核   │
│  ...                                          │
└──────────────────────────────────────────────────┘
```

- 顶部工具栏：添加规则 / 添加输入列 / 添加输出列
- 输入列头部蓝色背景，输出列头部绿色背景
- 表格悬浮校验按钮（顶部居中）
- 属性面板隐藏（决策表视图不需要）

### 4.5 底部状态栏（28px）

```
[⟨⟩ XML] │ ● 未保存 │ BPMN 2.0 │ 元素: 8     ✕2 ⚠3  • Engine 2026
```

| 区域 | 内容 |
| --- | --- |
| 左 | 视图切换按钮（toggle，显示"另一个视图"名称）+ 分隔线 + 保存状态 + 缩放 + 规范版本 + 元素计数 |
| 右 | 校验报错（错误数红色 + 警告数橙色 / 无错误绿色）+ 版本信息胶囊 |

**视图切换 toggle 语义**：

- 当前是模型视图 → 按钮显示 `⟨⟩ XML`
- 当前是 XML 视图 → 按钮显示 `🔲 模型`
- DMN：决策表 ↔ DRD 图同理

---

## 5. 技术栈与架构

### 5.1 技术栈总览

| 层级          | 技术                                 | 版本               |
| ------------- | ------------------------------------ | ------------------ |
| **桌面框架**  | Tauri 2                              | 2.x                |
| **前端框架**  | Vue 3 (Composition API)              | ^3.5.40            |
| **构建工具**  | Vite (Rolldown)                      | ^8.1.5             |
| **语言**      | TypeScript                           | ^5.9.3             |
| **路由**      | Vue Router 4                         | ^4.6.4             |
| **状态管理**  | Pinia 3                              | ^3.0.4             |
| **国际化**    | vue-i18n 11                          | ^11.4.8            |
| **UI 组件库** | naive-ui                             | ^2.44.1            |
| **CSS 引擎**  | UnoCSS + Less                        | ^66.7.5            |
| **图标**      | @iconify/json (Carbon)               | ^2.2.507           |
| **建模内核**  | bpmn-js / @kunpeng/dmn-js            | ^18.22 / workspace |
| **工具链**    | pnpm workspace + ESLint 9 + Prettier | —                  |

### 5.2 Tauri 桌面配置

```json
{
  "productName": "Kunpeng Modeler",
  "identifier": "com.anyilanxin.kunpeng",
  "app": {
    "windows": [
      {
        "title": "Kunpeng Modeler",
        "width": 1440,
        "height": 810,
        "minWidth": 800,
        "minHeight": 600,
        "center": true
      }
    ]
  }
}
```

**Tauri 插件**：dialog（文件对话框）· store（本地存储）· notification · shell · os · window-state · autostart · opener

### 5.3 项目结构

```
dists/kunpeng-modeler/
├── docs/
│   ├── prototype.html      # 交互原型（纯 HTML 预览）
│   └── design.md           # 本设计稿
├── src/
│   ├── App.vue             # 根组件（naive-ui Provider + 全屏判断）
│   ├── main.ts             # 入口
│   ├── router/index.ts     # 路由
│   ├── stores/             # Pinia (theme, layout)
│   ├── locales/            # i18n (zh-CN, en)
│   ├── views/
│   │   ├── HomeView.vue             # 欢迎页
│   │   └── designer/
│   │       ├── BpmnDesigner.vue     # BPMN 建模器
│   │       ├── DmnDesigner.vue      # DMN 建模器
│   │       └── TemplateDesigner.vue # 模板设计器
│   ├── layouts/            # MainLayout / TopMenuLayout
│   ├── components/         # 通用组件
│   └── sys-methods/        # Tauri 系统能力封装
├── src-tauri/              # Rust 后端
├── vite.config.ts
├── uno.config.ts
└── package.json
```

### 5.4 路由设计

| 路径             | 名称          | 组件         | 全屏 |
| ---------------- | ------------- | ------------ | ---- |
| `/`              | home          | HomeView     | 否   |
| `/designer/bpmn` | designer-bpmn | BpmnDesigner | ✅   |
| `/designer/dmn`  | designer-dmn  | DmnDesigner  | ✅   |

> `/designer/` 前缀路由全屏渲染（不加 MainLayout），其余走 MainLayout。

### 5.5 Monorepo 关键依赖

建模器不直接 import `@kunpeng/bpmn-design` 预构建包（Rolldown transform 3.7MB dist 有变量冲突问题），而是**参照源码逻辑自行组装**。

| 包名                                | 用途                             |
| ----------------------------------- | -------------------------------- |
| `@kunpeng/bpmn-design`              | BPMN 设计器源码参考              |
| `@kunpeng/dmn-design`               | DMN 设计器源码参考               |
| `@kunpeng/bpmn-js-properties-panel` | BPMN 属性面板模块                |
| `@kunpeng/dmn-js-properties-panel`  | DMN 属性面板模块                 |
| `@kunpeng/bpmn-moddle`              | BPMN 扩展模型定义 (kunpeng.json) |
| `@kunpeng/dmn-moddle`               | DMN 扩展模型定义                 |
| `@kunpeng/dmn-js`                   | DMN Modeler 核心                 |
| `@kunpeng/properties-panel`         | 通用属性面板 UI                  |
| `bpmn-js`                           | BPMN Modeler 核心                |
| `diagram-js`                        | 图形引擎                         |
| `diagram-js-minimap`                | 小地图模块                       |

---

## 6. BPMN/DMN 建模器组装

> ⚠️ 关键原则：**参照 `@kunpeng/bpmn-design` / `@kunpeng/dmn-design` 源码逻辑，在 modeler 中自行组装 Modeler 实例**，不直接引用预构建 dist 包。

### 6.1 BPMN Modeler 初始化

```typescript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import gridModule from 'diagram-js-grid';
import MinimapModule from 'diagram-js-minimap';
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
import AddExporterModule from '@bpmn-io/add-exporter';
import LintModule from 'bpmn-js-bpmnlint';
import BpmnColorPickerModule from 'bpmn-js-color-picker/colors';
import KunpengBehaviorModule from '@kunpeng/bpmn-js-behaviors';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  KunpengPropertiesProviderModule,
} from '@kunpeng/bpmn-js-properties-panel';
import KunpengBpmnModdle from '@kunpeng/bpmn-moddle/resources/kunpeng.json';

const additionalModules = [
  gridModule, // 网格背景
  CreateAppendAnythingModule, // 追加任意元素
  AddExporterModule, // 导出器
  KunpengBehaviorModule, // 鲲鹏行为规则
  LintModule, // 校验
  BpmnColorPickerModule, // 颜色选择器
  BpmnPropertiesPanelModule, // 属性面板容器
  BpmnPropertiesProviderModule, // 属性面板默认分组
  KunpengPropertiesProviderModule, // 鲲鹏自定义属性分组
  MinimapModule, // 小地图
  CustomTranslateModule, // i18n
];

const modeler = new BpmnModeler({
  container: canvasContainer,
  propertiesPanel: {
    parent: '#properties-panel-container', // 挂载到 Vue 容器
  },
  additionalModules,
  moddleExtensions: {
    camunda: KunpengBpmnModdle,
  },
  linting: { bpmnlint: bpmnlintConfig },
});
```

### 6.2 DMN Modeler 初始化

```typescript
import DmnModeler from '@kunpeng/dmn-js/lib/Modeler';
import { OverviewModule } from '@kunpeng/dmn-js/lib/overview';
import { DrdLinting } from 'dmn-js-dmnlint';
import AddExporterModule from '@bpmn-io/add-exporter';
import gridModule from 'diagram-js-grid';
import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  KunpengPropertiesProviderModule,
} from '@kunpeng/dmn-js-properties-panel';
import CamundaModdleDescriptor from '@kunpeng/dmn-moddle/resources/kunpeng.json';

const additionalModules = [
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  KunpengPropertiesProviderModule,
  AddExporterModule,
  DrdLinting, // DRD 校验
  OverviewModule, // 概览
  gridModule,
  CustomTranslateModule,
];

const modeler = new DmnModeler({
  container: canvasContainer,
  drd: {
    propertiesPanel: { parent: '#properties-panel-container' },
    additionalModules,
  },
  decisionTable: {
    additionalModules: [CustomTranslateModule], // 决策表只需 i18n
  },
  literalExpression: {
    additionalModules: [CustomTranslateModule],
  },
  common: { linting: dmnlintConfig },
  moddleExtensions: {
    camunda: CamundaModdleDescriptor,
  },
});
```

### 6.3 Vue 组件挂载要点

```vue
<template>
  <div class="modeler-container">
    <!-- bpmn-js 画布挂载点 -->
    <div ref="canvasRef" class="canvas"></div>
    <!-- 属性面板挂载点（由 bpmn-js-properties-panel 接管） -->
    <div id="properties-panel-container" class="properties-panel"></div>
  </div>
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLElement>();
let modeler: BpmnModeler;

onMounted(async () => {
  modeler = new BpmnModeler({ container: canvasRef.value! /* ... */ });
  await modeler.importXML(emptyDiagram);
});

onUnmounted(() => modeler?.destroy());

// 暴露给父组件
defineExpose({
  importXML: (xml: string) => modeler.importXML(xml),
  exportXML: () => modeler.saveXML({ format: true }),
  importBase64: (base64: string) => {
    /* ... */
  },
});
</script>
```

### 6.4 布局样式关键点

源码参考 `packages/design/bpmn-design/src/styles/bpmn-designer.less`：

```less
.modeler-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .canvas {
    flex: 1;
    width: 100%;
    height: 100%;
    // 隐藏原生 lint 按钮
    .bjsl-button {
      display: none;
    }
    // 小地图定位
    .djs-minimap {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }

  .properties-panel {
    max-width: 400px;
    min-width: 400px;
    border-left: 1px solid var(--border);
    overflow-y: auto;
    max-height: calc(100% - 63px);
  }
}
```

---

## 7. 组件清单与 naive-ui 映射

| 原型元素 | naive-ui 组件 | 备注 |
| --- | --- | --- |
| 应用标题栏 | 自定义 div | flex 布局 + `-webkit-app-region: drag` |
| 文档标签页 | 自定义 div | 多标签，含关闭按钮 |
| 主题切换 | `n-button` (quaternary) + `useThemeStore` |  |
| 属性面板开关 | `n-button` (quaternary) | toggle 显隐 |
| 窄工具栏按钮 | `n-button` (quaternary, circle) + `n-tooltip` |  |
| 画布悬浮条 | 自定义 div (absolute) | `backdrop-filter: blur` |
| 新建下拉 | `n-dropdown` | BPMN / DMN 选择 |
| 属性面板分组 | `n-collapse` | 可折叠 |
| 属性输入框 | `n-input` / `n-select` / `n-textarea` |  |
| 视图切换 | `n-button` | toggle 语义 |
| 底部状态栏 | 自定义 div + `n-tag` / `n-tooltip` |  |
| 校验报错 | `n-badge` + `n-tooltip` |  |
| 文件对话框 | `@tauri-apps/plugin-dialog` | open / save |
| 消息提示 | `useMessage` / `useNotification` | naive-ui Provider |

---

## 8. 交互流程

### 8.1 新建 BPMN 流程

```
欢迎页 → 点击「新建 BPMN 流程图」
       → 路由 /designer/bpmn
       → BpmnDesigner onMounted
       → 初始化 BpmnModeler
       → importXML(空流程模板)
       → 标签页显示「未命名.bpmn ●」
```

### 8.2 打开本地文件

```
标题栏「＋新建」下拉 / 快捷键 ⌘O
  → @tauri-apps/plugin-dialog.open({ filters: ['.bpmn', '.dmn'] })
  → 读取文件内容
  → 根据扩展名判断类型
  → importXML(fileContent)
  → 标签页更新为文件名
```

### 8.3 保存文件

```
快捷键 ⌘S
  → modeler.saveXML({ format: true })
  → @tauri-apps/plugin-dialog.save()
  → 写入文件
  → 状态栏更新为「已保存」
```

### 8.4 DMN 视图切换

```
DRD 图 → 双击决策节点
      → DMN Modeler 自动切换到 decisionTable 视图
      → 属性面板隐藏
      → 标签页名称追加「› 决策表」
      → 状态栏视图按钮变为「DRD 图」(点击返回)
```

### 8.5 校验反馈

```
元素变更 → bpmn-js eventBus 'commandStack.changed'
        → lintModule 自动校验
        → 底部状态栏更新错误/警告计数
        → 点击报错 → 跳转到问题元素
```

---

## 9. 明暗主题色值对照

| 元素          | 浅色              | 深色             |
| ------------- | ----------------- | ---------------- |
| 应用背景      | `#f1f5f9`         | `#0a0a0b`        |
| 面板/标题栏   | `#ffffff`         | `#18181b`        |
| 画布          | `#fafafa`         | `#131316`        |
| 悬浮条        | `#ffffff` + blur  | `#27272a` + blur |
| 主色          | `#0d9488`         | `#2dd4bf`        |
| 边框          | `#e2e8f0`         | `#2a2a2e`        |
| 主文字        | `#0f172a`         | `#f4f4f5`        |
| 阴影          | `rgba(0,0,0,.08)` | `rgba(0,0,0,.5)` |
| 选中态背景    | `#e0f2f1`         | `#134e4a`        |
| BPMN 画布描边 | 深色 `#333`       | 白色 `#FFF`      |

> BPMN/DMN Renderer 暗色配置：`bpmnRenderer: { defaultFillColor: darkFillColor, defaultStrokeColor: '#FFF' }`

---

## 10. 尺寸规范汇总

| 区域         | 尺寸                    | 说明                        |
| ------------ | ----------------------- | --------------------------- |
| 标题栏       | 38px                    | 应用标识 + 标签页 + 操作    |
| 左侧窄工具栏 | 48px 宽                 | 垂直图标列                  |
| 工具栏       | 42px                    | （仅决策表页有，表格操作）  |
| 画布悬浮条   | ~30px 高，顶部偏移 16px | 居中浮动                    |
| 小地图       | 150×100px               | 右下角                      |
| 属性面板     | 340px 宽                | 可开关                      |
| 底部状态栏   | 28px                    | 三栏布局                    |
| 窗口默认     | 1440×810                | minWidth 800, minHeight 600 |
| 卡片圆角     | 12px                    |                             |
| 按钮圆角     | 6px                     |                             |
| 输入框圆角   | 4px                     |                             |

---

## 11. 开发计划

### Phase 1：基础框架搭建（1-2 周）

- [ ] 清理冗余依赖（移除 ant-design-vue / arco-design / primevue，统一 naive-ui）
- [ ] 修正 `index.html` 标题和入口脚本路径
- [ ] 实现标题栏组件（品牌 + 多标签页 + 主题/面板开关）
- [ ] 实现底部状态栏组件（视图 toggle + 保存状态 + 校验报错 + 版本）
- [ ] 实现 Pinia store：标签页管理（多模型状态）、保存状态
- [ ] 路由调整：`/designer/bpmn` 和 `/designer/dmn` 全屏布局

### Phase 2：BPMN 建模器（2-3 周）

- [ ] 参照 `AnYiBpmnDesignerKunpeng.vue` 源码，组装 BpmnModeler
- [ ] 实现画布容器 + 属性面板挂载
- [ ] 实现左侧窄工具栏（选择/平移/连线/创建/空间/对齐）
- [ ] 实现画布悬浮操作条（校验/模拟/撤销重做/对齐/缩放）
- [ ] 集成 lint 校验 + 底部报错联动
- [ ] 集成小地图模块
- [ ] 实现明暗主题切换（含 bpmnRenderer 配置）

### Phase 3：DMN 建模器（1-2 周）

- [ ] 参照 `AnYiDmnDesigner.vue` 源码，组装 DmnModeler
- [ ] 实现 DRD 图视图 + 属性面板
- [ ] 实现决策表视图 + 表格操作工具栏
- [ ] 实现 DRD ↔ 决策表视图切换（双击 + 状态栏 toggle）
- [ ] 决策表视图属性面板隐藏逻辑

### Phase 4：文件管理（1 周）

- [ ] 集成 `@tauri-apps/plugin-dialog` 打开/保存文件
- [ ] 实现新建下拉（BPMN / DMN 类型选择）
- [ ] 多标签页文件状态管理（未保存标记、关闭确认）
- [ ] 导出功能（`.bpmn` / `.dmn` / `.svg` / `.png`）

### Phase 5：打磨与优化（1 周）

- [ ] i18n 完善（中英文全覆盖）
- [ ] 快捷键绑定（⌘N 新建 / ⌘O 打开 / ⌘S 保存 / ⌘Z 撤销）
- [ ] UnoCSS 主题变量与 CSS 变量统一
- [ ] 暗色主题全面测试（含 bpmn-js 内部元素配色）
- [ ] 窗口状态持久化（`tauri-plugin-window-state`）
- [ ] 性能优化（懒加载、Modeler 销毁回收）

### Phase 6：扩展功能（按需）

- [ ] 元素模板管理（`@kunpeng/bpmn-template-designer`）
- [ ] 流程模拟运行（`bpmn-js-token-simulation`）
- [ ] XML 视图编辑器（CodeMirror / Monaco）
- [ ] 命令面板（⌘K）
- [ ] 自动更新（`tauri-plugin-updater`）

---

> 📐 **交互原型预览**：`docs/prototype.html`（纯 HTML，浏览器直接打开或 `python3 -m http.server 8888`）
