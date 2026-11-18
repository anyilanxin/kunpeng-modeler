# 顶部工具栏替换为内核插件 + 内核 i18n 接入

> 2026-11-18 立项。分支 `feat/kernel-toolbar-i18n`（自 main 切）。配套内核仓文档：kunpeng-bpm-inner `design-docs/工具栏重置画布与i18n插件.md`（内核侧重置画布补齐 + `@kunpeng-io/i18n` 新包先行开发，本仓消费）。

## 一、是什么 / 为什么

自研悬浮工具栏 `src/components/modeler/CanvasToolbar.vue`（~300 行：校验/模拟/撤销/重做/重置/缩放/横纵切换/适应，手工 inject modelerRef 调命令）整体退役，改为装配内核 `@kunpeng-io/bpmn-js-toolbar` / `@kunpeng-io/dmn-js-toolbar` 插件（参考 anyi-platform `AnYiBpmnDesignerKunpeng.vue` 接入方式：additionalModules + `bpmnToolbar.actions` + styles）；同时接入内核新 i18n 插件 `@kunpeng-io/i18n`，内核 UI 文案（palette/pad/菜单/工具栏/DMN 视图）随应用语言中英切换。

收益：工具栏能力与内核同源演进（内核已多出：颜色组、按钮禁用态同步、溢出收纳「更多」弹层、真实校验开关、只读态适配）；宿主删一块自维护 UI；建模器 UI 双语化零自研。

## 二、能力对照（自研 → 内核插件）

| 自研工具栏 | 内核插件 | 备注 |
|---|---|---|
| 撤销/重做 | ✅ 内置（含禁用态同步） | 升级 |
| 缩小/放大/百分比/适应画布 | ✅ 内置（百分比可点击复位） | 升级 |
| 横纵布局切换（BPMN） | ✅ 内置（随朝向换图标） | 升级 |
| 校验（无实现） | ✅ 内置真实开关（宿主已装 linting/modeler，自动出现） | 补齐 |
| 重置画布 | ⏳ 内核本轮补齐（`resetXml` config） | 前置依赖 |
| 模拟（无实现、无内核能力） | ❌ 移除 | 死按钮，随替换退役 |
| — | ✅ 颜色组、溢出收纳、只读态 | 内核附赠 |

## 三、改动面

1. **依赖**：+ `@kunpeng-io/bpmn-js-toolbar` / `@kunpeng-io/dmn-js-toolbar` / `@kunpeng-io/i18n`；按内核发版升级受影响包（bpmn-js / dmn-js / dmn-js-properties-panel 等）。
2. **BpmnModeler.vue**：`additionalModules` += `BpmnToolbarModule` + `createBpmnI18nModule(locale)`；构造项 `bpmnToolbar: { resetXml: () => createEmptyBpmn() }`（保 kunpeng/modeler 命名空间与版本标记）；import `@kunpeng-io/bpmn-js-toolbar/styles`。
3. **DmnModeler.vue**：同款 `DmnToolbarModule` + `createDmnI18nModule(locale)` + `dmnToolbar: { resetXml: () => createEmptyDmn() }` + styles。
4. **删除**：`CanvasToolbar.vue`、DesignerView 挂载与 `modelerRef` inject 链、`locales/*/toolbar.*` 词条。
5. **重置后状态同步**：内核重置走 importXML → 挂 `import.done` 监听 saveXML→`tabsStore.updateXml`（现有 `commandStack.changed` 同步不覆盖 import 路径；tab 切换导入也会触发，hash 判脏幂等无害）。
6. **语言切换**：`setLanguage()` 变更 locale → 重建当前 tab 的 modeler 实例（每 tab 独立实例天然支持；复用主题切换既有重建/恢复路径）——内核 i18n v1 为构造期语言，热切换属内核缓执行项。
7. 工具栏随画布容器渲染：每 tab 各自一条、XML 视图态随画布隐藏（现单条悬浮条 + `activeViewMode` 手动 v-show 的逻辑一并退役）。

## 四、验收标准

1. `pnpm build` 绿；
2. 亮/暗双主题：工具栏观感与画布既有 `--bio-*` 皮肤一致，暗色不返白；
3. BPMN/DMN 双线：工具栏全钮实测（撤销重做禁用态、缩放百分比、适应、横纵切换(BPMN)、颜色组、校验开关(BPMN)、重置→空模板且 tab XML 同步、可继续编辑/保存）；
4. 中英切换：palette/pad/替换·对齐菜单/工具栏/DMN 决策表/下钻徽标随语言切换，重启会话语言保持；
5. 冒烟：导入导出往返、lint 面板点击定位、多 tab 切换、主题切换画布不销毁；
6. `git grep CanvasToolbar` 零残留。

## 五、分阶段计划

| 阶段 | 范围 | 验证 | 预估 |
|------|------|------|------|
| S1 依赖升级+插件装配 | 两 Modeler 接工具栏/i18n 模块、删自研组件 | build + 双线双主题全钮走查 | 0.5 天 |
| S2 重置与同步 | resetXml 注入、import.done 同步、语言切换重建 | 重置后编辑/保存/切 tab 回放 | 0.5 天 |
| S3 清理收尾 | 词条清理、死代码清扫、（可选）dmg 实测 | 全验收标准 | 0.5 天 |

前置依赖：内核 P1–P4 发版完成（toolbar 两包新版 + i18n 包 + dmn-js/bpmn-js 新版）。

## 六、风险

- 内核升级连带（vite Rolldown 补丁目标、alias 映射）——升级后先 `pnpm build` 验补丁命中，白屏先查 alias（AGENTS 陷阱 1/2/3）；
- 主题切换与重建 modeler 的交互回归（陷阱 4）——S1 验证必测；
- dmn-js 升级幅度大（views 层 i18n 接管）——DMN 线全功能回归（决策表编辑/下钻/面板）。

## 执行记录

（随阶段回填）
