<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  KunpengPropertiesProviderModule,
} from '@kunpeng/dmn-js-properties-panel';
// CSS
import '@kunpeng/dmn-js/dist/assets/diagram-js.css';
import '@kunpeng/dmn-js/dist/assets/dmn-font/css/dmn-codes.css';
import '@kunpeng/dmn-js/dist/assets/dmn-font/css/dmn-embedded.css';
import '@kunpeng/dmn-js/dist/assets/dmn-font/css/dmn.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-boxed-expression-controls.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-boxed-expression.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-decision-table.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-drd.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-literal-expression.css';
import '@kunpeng/dmn-js/dist/assets/dmn-js-shared.css';
// DMN 核心（鲲鹏二次开发包）
import DmnModeler from '@kunpeng/dmn-js/lib/Modeler';
import { OverviewModule } from '@kunpeng/dmn-js/lib/overview';
import KunpengModdleDescriptor from '@kunpeng/dmn-moddle/resources/kunpeng.json';
import '@kunpeng/properties-panel/assets/properties-panel.css';

import CodeEditor from '@/components/CodeEditor.vue';
// 本地工具
import { createEmptyDmn } from '@/utils/dmn-templates';
import dmnlintConfig from '@/utils/dmnlint-config';
import { createI18nOptions } from '@/utils/modeler-i18n';
// 第三方扩展模块
import AddExporterModule from '@bpmn-io/add-exporter';
import gridModule from 'diagram-js-grid';
import { DrdLinting } from 'dmn-js-dmnlint';

const props = withDefaults(
  defineProps<{
    lang?: string;
    panelWidth?: number;
    showPanel?: boolean;
    theme?: 'dark' | 'light';
    viewMode?: 'model' | 'xml';
    xml?: string;
  }>(),
  {
    xml: '',
    theme: 'light',
    showPanel: true,
    panelWidth: 340,
    viewMode: 'model',
    lang: 'zh-CN',
  },
);

const emit = defineEmits<{
  change: [xml: string];
  'update:panelWidth': [width: number];
  'update:showPanel': [val: boolean];
}>();

const canvasRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const modeler = shallowRef<any>(null);

// 当前 XML 内容（用于 XML 编辑器双向绑定）
const currentXml = ref(props.xml || createEmptyDmn());

// 属性面板挂载 ID
const panelId = `dmn-properties-${Math.random().toString(36).slice(2, 8)}`;

// 当前激活的视图类型（drd / decisionTable / literalExpression）
const activeViewType = ref('drd');
// 属性面板仅在 DRD 视图下显示
const showProperty = ref(true);

async function initModeler() {
  if (modeler.value || !canvasRef.value) return;

  const CustomTranslateModule = createI18nOptions(props.lang);

  const additionalModules = [
    DmnPropertiesPanelModule,
    DmnPropertiesProviderModule,
    KunpengPropertiesProviderModule,
    AddExporterModule,
    OverviewModule,
    gridModule,
    DrdLinting,
    CustomTranslateModule,
  ];

  const config: Record<string, any> = {
    container: canvasRef.value,
    drd: {
      propertiesPanel: {
        parent: `#${panelId}`,
      },
      additionalModules,
      exporter: {
        name: 'kunpeng-modeler',
        version: '2026.0.0',
      },
    },
    decisionTable: {
      additionalModules: [CustomTranslateModule],
    },
    literalExpression: {
      additionalModules: [CustomTranslateModule],
    },
    common: {
      linting: dmnlintConfig,
    },
    moddleExtensions: {
      kunpeng: KunpengModdleDescriptor,
    },
  };

  // 暗色主题渲染配置
  if (props.theme === 'dark') {
    config.drd.drdRenderer = {
      defaultFillColor: '#1a1a1a',
      defaultStrokeColor: '#FFF',
    };
  }

  modeler.value = new DmnModeler(config);

  // 监听视图变化：跟踪当前视图类型，控制属性面板显隐
  modeler.value.on('views.changed', (event: any) => {
    const { type } = event.activeView;
    activeViewType.value = type;
    showProperty.value = type === 'drd';
    saveAndEmit();
  });

  // 监听元素变化 + 视图激活切换
  modeler.value.on('import.done', () => {
    const activeView = modeler.value?.getActiveView?.();
    if (activeView) {
      activeViewType.value = activeView.type;
      showProperty.value = activeView.type === 'drd';
    }
    const activeViewer = modeler.value?.getActiveViewer?.();
    if (activeViewer) {
      const eventBus = activeViewer.get('eventBus');
      eventBus.on('elements.changed', () => {
        saveAndEmit();
      });
      eventBus.on('activate.change', () => {
        saveAndEmit();
      });
    }
  });

  // 加载初始内容
  const initialXml = props.xml || createEmptyDmn();
  currentXml.value = initialXml;
  try {
    await modeler.value.importXML(initialXml);
    // 延迟执行 fit-viewport，确保容器尺寸已就绪
    nextTick(() => {
      fitViewport();
    });
  } catch (error) {
    console.error('[DmnModeler] importXML failed', error);
  }
}

/**
 * 通知 DMN-js 重新计算画布尺寸并适配视图
 * 参照 AnYiDmnDesigner 的 handleReZoom + resizeCanvas
 */
function fitViewport() {
  if (!modeler.value) return;
  setTimeout(() => {
    try {
      const activeViewer = modeler.value?.getActiveViewer?.();
      if (!activeViewer) return;
      const canvas = activeViewer.get('canvas');
      canvas.resized();
      canvas.zoom('fit-viewport', 'auto');
    } catch {
      // ignore
    }
  }, 50);
}

let saveTimer: null | ReturnType<typeof setTimeout> = null;

async function saveAndEmit() {
  if (!modeler.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const result = await modeler.value!.saveXML({ format: true });
      currentXml.value = result.xml;
      emit('change', result.xml);
    } catch (error) {
      console.error('[DmnModeler] saveXML failed', error);
    }
  }, 300);
}

async function importXML(xml: string) {
  if (!modeler.value) return;
  try {
    await modeler.value.importXML(xml);
  } catch (error) {
    console.error('[DmnModeler] importXML failed', error);
  }
}

async function saveXML(): Promise<string | undefined> {
  if (!modeler.value) return;
  try {
    const result = await modeler.value.saveXML({ format: true });
    currentXml.value = result.xml;
    return result.xml;
  } catch (error) {
    console.error('[DmnModeler] saveXML failed', error);
    return undefined;
  }
}

/** 切换到 XML 视图前，先从 modeler 序列化最新内容到编辑器 */
async function syncXmlFromModeler() {
  if (!modeler.value) return;
  try {
    const result = await modeler.value.saveXML({ format: true });
    currentXml.value = result.xml;
  } catch (error) {
    console.error('[DmnModeler] syncXmlFromModeler failed', error);
  }
}

/** 从 XML 编辑器内容重新导入到 modeler（切回模型视图时调用） */
async function syncXmlToModeler() {
  if (!modeler.value) return;
  try {
    await modeler.value.importXML(currentXml.value);
    emit('change', currentXml.value);
    nextTick(() => fitViewport());
  } catch (error) {
    console.error('[DmnModeler] syncXmlToModeler failed', error);
  }
}

function destroyModeler() {
  if (modeler.value) {
    try {
      modeler.value.destroy();
    } catch {
      // ignore
    }
    modeler.value = null;
  }
}

/**
 * 窗口大小变化时通知 dmn-js 重新计算画布尺寸
 * 参照 AnYiBpmnDesignerKunpeng.vue 的 resizeCanvas()
 */
let resizeTimer: null | ReturnType<typeof setTimeout> = null;
function resizeCanvas() {
  if (!modeler.value) return;
  // v-show 隐藏的 tab 不处理 resize（display:none 时尺寸为 0，切回时由 refreshCanvas 校正）
  const container = containerRef.value;
  if (container && container.offsetParent === null) return;
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // 仅在 DRD 视图下调整画布尺寸
    if (activeViewType.value !== 'drd') return;
    try {
      const activeViewer = modeler.value?.getActiveViewer?.();
      if (!activeViewer) return;
      const canvas = activeViewer.get('canvas');
      canvas.resized();
    } catch {
      // ignore
    }
  }, 100);
}

/* ============== 属性面板拖拽调整宽度 ============== */
const DEFAULT_PANEL_WIDTH = 340;
// 拖拽过程中是否在松开时折叠面板
let pendingCollapse = false;
let dragStartX = 0;
let dragStartWidth = 0;

function getMaxPanelWidth(): number {
  return Math.floor(window.innerWidth * 0.7);
}

function onResizeMove(e: MouseEvent) {
  const delta = e.clientX - dragStartX;
  const newWidth = dragStartWidth - delta;
  const maxW = getMaxPanelWidth();
  if (newWidth < DEFAULT_PANEL_WIDTH) {
    // 超过下限：标记折叠，不再继续缩窄
    pendingCollapse = true;
    return;
  }
  pendingCollapse = false;
  const clamped = Math.min(newWidth, maxW);
  emit('update:panelWidth', clamped);
  resizeCanvas();
}

function onResizeEnd() {
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
  document.body.classList.remove('panel-resizing');
  if (pendingCollapse) {
    pendingCollapse = false;
    emit('update:showPanel', false);
  }
}

function startResizeDrag(e: MouseEvent, startWidth: number) {
  dragStartX = e.clientX;
  dragStartWidth = startWidth;
  pendingCollapse = false;
  document.body.classList.add('panel-resizing');
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
}

function onResizeStart(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  // 折叠状态下：按下即展开，并在同一手势内继续接管 mousemove，
  // 否则鼠标移动会被 diagram-js 画布（document 级监听）当作框选吞掉。
  if (!props.showPanel) {
    emit('update:showPanel', true);
    startResizeDrag(e, DEFAULT_PANEL_WIDTH);
    return;
  }
  startResizeDrag(e, props.panelWidth || DEFAULT_PANEL_WIDTH);
}

onMounted(() => {
  initModeler();
  window.addEventListener('resize', resizeCanvas);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
  document.body.classList.remove('panel-resizing');
  destroyModeler();
});

watch(
  () => props.theme,
  async () => {
    destroyModeler();
    await initModeler();
  },
);

// 视图模式切换
watch(
  () => props.viewMode,
  async (newMode, oldMode) => {
    if (newMode === 'xml' && oldMode === 'model') {
      await syncXmlFromModeler();
    } else if (newMode === 'model' && oldMode === 'xml') {
      await syncXmlToModeler();
      // canvas 之前被 v-show 隐藏，恢复后需要重新计算尺寸
      nextTick(() => resizeCanvas());
    }
  },
);

function handleXmlInput(xml: string) {
  currentXml.value = xml;
}

defineExpose({
  importXML,
  saveXML,
  getModeler: () => modeler.value,
  refreshCanvas: fitViewport,
});
</script>

<template>
  <div ref="containerRef" class="dmn-modeler-container">
    <!-- 模型画布 -->
    <div ref="canvasRef" class="dmn-canvas" v-show="viewMode === 'model'"></div>

    <!-- XML 编辑器视图 -->
    <div v-if="viewMode === 'xml'" class="xml-editor-wrapper">
      <CodeEditor
        :model-value="currentXml"
        :readonly="false"
        :dark="theme === 'dark'"
        @update:model-value="handleXmlInput"
      />
    </div>

    <!-- 属性面板拖拽手柄（面板折叠后显示 handlebar 图标，可拖拽/点击重新展开） -->
    <div
      v-show="showProperty && viewMode === 'model'"
      class="panel-resizer"
      :class="{ collapsed: !showPanel }"
      :title="showPanel ? '拖拽调整宽度（拖到最小宽度以下将关闭面板）' : '点击或拖拽展开属性面板'"
      @mousedown="onResizeStart"
    >
      <svg
        v-if="!showPanel"
        xmlns="http://www.w3.org/2000/svg"
        width="9"
        height="64"
        viewBox="0 0 9 64"
        class="handlebar-icon"
      >
        <path
          fill-rule="evenodd"
          d="M.343 32L6 26.343V1.5a1.5 1.5 0 113 0v61a1.5 1.5 0 11-3 0V37.657L.343 32z"
        ></path>
      </svg>
    </div>

    <!-- 属性面板挂载点（仅在 DRD 视图下显示） -->
    <div
      v-show="showPanel && showProperty && viewMode === 'model'"
      :id="panelId"
      class="dmn-properties-panel"
      :style="{ width: panelWidth + 'px' }"
    ></div>
  </div>
</template>

<style scoped>
.dmn-modeler-container {
  position: relative;
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.dmn-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-canvas, #fafafa);
}

/* 确保 DMN-js 内部容器撑满父元素（palette 除外，保持固定宽度） */
.dmn-canvas :deep(.dmn-js-parent),
.dmn-canvas :deep(.dmn-js-container),
.dmn-canvas :deep(.djs-container) {
  width: 100% !important;
  height: 100% !important;
}

/* 决策表视图：撑满宽度（DMN-js 默认 min-content 导致右侧空白） */
.dmn-canvas :deep(.dmn-decision-table-container) {
  padding: 15px;
}

.dmn-canvas :deep(.dmn-decision-table-container .tjs-table),
.dmn-canvas :deep(.dmn-decision-table-container .tjs-container) {
  width: 100% !important;
}

/* DMN 概览面板定位调整 */
.dmn-canvas :deep(.dmn-overview-panel.open) {
  height: calc(100% - 80px) !important;
  margin: 15px -5px 15px 11px !important;
}

/* 概览工具栏显示时，主内容区域增加内边距 */
.dmn-canvas
  :deep(
    .dmn-js-parent:has(.dmn-overview-toolbar:not(.hidden))
      > div:not(.dmn-overview-toolbar):not(.dmn-overview-panel)
  ) {
  padding: 15px;
}

.dmn-properties-panel {
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid #e2e8f0;
}

/* 属性面板拖拽手柄 */
.panel-resizer {
  flex-shrink: 0;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background 0.18s ease;
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

/*
 * 扩大命中热区：折叠状态下 resizer 紧贴 app 窗口右边缘，会和 OS 级窗口 resize 热区重叠，
 * 导致用户的 mousedown 被 OS 当作“调整 app 窗口宽度”捕获，面板拖拽不生效。
 * 这里用一个向左（画布一侧）偏移的伪元素把命中区做大、做靠内，避开窗口边缘热区。
 */
.panel-resizer::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  /* 向左扩展命中区，宽度 14px，整体落在画布一侧而非窗口边缘 */
  left: -8px;
  width: 14px;
}

.panel-resizer:hover,
.panel-resizer:active {
  background: #3b82f6;
}

/* 折叠状态：宽度不变，仅切换光标 */
.panel-resizer.collapsed {
  cursor: pointer;
}

.panel-resizer.collapsed:hover,
.panel-resizer.collapsed:active {
  background: #3b82f6;
}

/* handlebar 图标 */
.panel-resizer .handlebar-icon {
  flex-shrink: 0;
  pointer-events: none;
  position: absolute;
  right: 3px;
}

.panel-resizer .handlebar-icon path {
  fill: #cbd5e1;
}

.xml-editor-wrapper {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

.dark .dmn-canvas {
  background: #131316;
}

.dark .dmn-properties-panel {
  background: #18181b;
  border-left-color: #2a2a2e;
}

.dark .panel-resizer:hover,
.dark .panel-resizer:active {
  background: #60a5fa;
}

.dark .panel-resizer.collapsed {
  background: transparent;
}

.dark .panel-resizer.collapsed:hover,
.dark .panel-resizer.collapsed:active {
  background: #60a5fa;
}

.dark .panel-resizer .handlebar-icon path {
  fill: #475569;
}

.dark .xml-editor-wrapper {
  background: #282c34;
}
</style>
