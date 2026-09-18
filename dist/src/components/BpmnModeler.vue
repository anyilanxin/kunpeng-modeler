<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

// 鲲鹏私有模块
import KunpengBehaviorModule from '@kunpeng/bpmn-js-behaviors';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  KunpengPropertiesProviderModule,
} from '@kunpeng/bpmn-js-properties-panel';
import KunpengBpmnModdle from '@kunpeng/bpmn-moddle/resources/kunpeng.json';
import '@kunpeng/properties-panel/assets/properties-panel.css';

import CodeEditor from '@/components/CodeEditor.vue';
// 本地工具
import { createEmptyBpmn } from '@/utils/bpmn-templates';
import { createI18nOptions } from '@/utils/modeler-i18n';
// BPMN 校验（@kunpeng/linting：含 camunda-compat 规则 + 画布标注）
import lintingModule from '@kunpeng/linting/modeler';
import { Linter } from '@kunpeng/linting';
// 第三方扩展模块
import AddExporterModule from '@bpmn-io/add-exporter';
import BpmnColorPickerModule from 'bpmn-js-color-picker/colors';
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
// bpmn-js 核心
import BpmnModeler from 'bpmn-js/lib/Modeler';
import gridModule from 'diagram-js-grid';
import MinimapModule from 'diagram-js-minimap';

// CSS（确保 bpmn-js 正确渲染）
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js-color-picker/colors/color-picker.css';
// @kunpeng/linting 画布错误标注样式
import '@kunpeng/linting/assets/linting.css';

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
  lint: [reports: any[]];
}>();

const canvasRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const modeler = shallowRef<BpmnModeler | null>(null);

// 当前 XML 内容（用于 XML 编辑器双向绑定）
const currentXml = ref(props.xml || createEmptyBpmn());

// 属性面板挂载 ID（唯一，避免多实例冲突）
const panelId = `bpmn-properties-${Math.random().toString(36).slice(2, 8)}`;

async function initModeler() {
  if (modeler.value || !canvasRef.value) return;

  const CustomTranslateModule = createI18nOptions(props.lang);

  const additionalModules = [
    gridModule,
    CreateAppendAnythingModule,
    AddExporterModule,
    BpmnColorPickerModule,
    KunpengBehaviorModule,
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    KunpengPropertiesProviderModule,
    MinimapModule,
    CustomTranslateModule,
    lintingModule,
  ];

  const config: Record<string, any> = {
    container: canvasRef.value,
    propertiesPanel: {
      parent: `#${panelId}`,
    },
    // linting 模块默认 _active=false：画布红色标注/属性面板错误提示由底部 ProblemsPanel
    // 切换到 Problems tab 时通过 linting.activate() 显式开启，避免 Output tab 污染画布。
    linting: {
      active: false,
    },
    additionalModules,
    colorPicker: {
      // 参照 packages/design 的 CUSTOM_COLOR_PICKER_COLORS 配置
      colors: [
        { label: 'Default', fill: undefined, stroke: undefined },
        { label: 'ForestGreen', fill: undefined, stroke: '#228B22' },
        { label: 'BlueNoFill', fill: undefined, stroke: '#0D4372' },
        { label: 'Blue', fill: '#BBDEFB', stroke: '#0D4372' },
        { label: 'OrangeNoFill', fill: undefined, stroke: '#6B3C00' },
        { label: 'Orange', fill: '#FFE0B2', stroke: '#6B3C00' },
        { label: 'GreenNoFill', fill: undefined, stroke: '#205022' },
        { label: 'Green', fill: '#C8E6C9', stroke: '#205022' },
        { label: 'RedNoFill', fill: undefined, stroke: '#831311' },
        { label: 'Red', fill: '#FFCDD2', stroke: '#831311' },
        { label: 'PurpleNoFill', fill: undefined, stroke: '#5B176D' },
        { label: 'Purple', fill: '#E1BEE7', stroke: '#5B176D' },
        { label: 'ExtendColorOneNoFill', fill: undefined, stroke: '#3069a7' },
        { label: 'ExtendColorOne', fill: '#8fb6f8', stroke: '#3069a7' },
        { label: 'ExtendColorTwoNoFill', fill: undefined, stroke: '#1e80ff' },
        { label: 'ExtendColorTwo', fill: '#6ab4ee', stroke: '#1e80ff' },
        { label: 'ExtendColorThreeNoFill', fill: undefined, stroke: '#75597d' },
        { label: 'ExtendColorThree', fill: '#ff6b81', stroke: '#75597d' },
        { label: 'ExtendColorFourNoFill', fill: undefined, stroke: '#ed742e' },
        { label: 'ExtendColorFour', fill: '#f3ae57', stroke: '#ed742e' },
      ],
    },
    moddleExtensions: {
      kunpeng: KunpengBpmnModdle,
    },
    exporter: {
      name: 'kunpeng-modeler',
      version: __APP_VERSION__,
    },
  };

  // 暗色主题渲染配置
  if (props.theme === 'dark') {
    config.bpmnRenderer = {
      defaultFillColor: '#1a1a1a',
      defaultStrokeColor: '#FFF',
    };
  }

  modeler.value = new BpmnModeler(config);

  // 创建 @kunpeng/linting 的 Linter 实例（desktop modeler + cloud 规则）
  linterInstance = new Linter({ modeler: 'desktop', type: 'cloud' });

  // 注册事件
  const eventBus = modeler.value.get('eventBus') as any;
  eventBus.on('element.changed', () => {
    saveAndEmit();
  });
  eventBus.on('commandStack.changed', () => {
    saveAndEmit();
  });

  // 加载初始内容
  const initialXml = props.xml || createEmptyBpmn();
  currentXml.value = initialXml;
  try {
    await modeler.value.importXML(initialXml);
    // 适应屏幕
    const canvas = modeler.value.get('canvas') as any;
    canvas.zoom('fit-viewport', 'auto');
    // 导入后主动跑一次校验
    runLint(initialXml);
  } catch (error) {
    console.error('[BpmnModeler] importXML failed', error);
  }
}

let saveTimer: null | ReturnType<typeof setTimeout> = null;
// @kunpeng/linting 的 Linter 实例
let linterInstance: Linter | null = null;

async function saveAndEmit() {
  if (!modeler.value) return;
  // 防抖
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const result = await modeler.value!.saveXML({ format: true });
      const xml = result.xml as string;
      currentXml.value = xml;
      emit('change', xml);
      // 内容变更后重新跑校验
      runLint(xml);
    } catch (error) {
      console.error('[BpmnModeler] saveXML failed', error);
    }
  }, 300);
}

/**
 * 运行 BPMN 校验：调 @kunpeng/linting 拿到扁平 reports，
 * 推送到画布标注 + emit 给 ProblemsPanel
 */
async function runLint(xml: string) {
  if (!modeler.value || !linterInstance) return;
  try {
    const reports = await linterInstance.lint(xml);
    // 画布错误标注
    const linting = (modeler.value as any).get('linting');
    if (linting?.setErrors) {
      linting.setErrors(reports);
    }
    // 推送到下游 ProblemsPanel
    emit('lint', reports);
  } catch (error) {
    console.error('[BpmnModeler] lint failed', error);
  }
}

async function importXML(xml: string) {
  if (!modeler.value) return;
  try {
    await modeler.value.importXML(xml);
    const canvas = modeler.value.get('canvas') as any;
    canvas.zoom('fit-viewport', 'auto');
  } catch (error) {
    console.error('[BpmnModeler] importXML failed', error);
  }
}

async function saveXML(): Promise<string | undefined> {
  if (!modeler.value) return;
  try {
    const result = await modeler.value.saveXML({ format: true });
    const xml = result.xml as string;
    currentXml.value = xml;
    return xml;
  } catch (error) {
    console.error('[BpmnModeler] saveXML failed', error);
    return undefined;
  }
}

/** 切换到 XML 视图前，先从 modeler 序列化最新内容到编辑器 */
async function syncXmlFromModeler() {
  if (!modeler.value) return;
  try {
    const result = await modeler.value.saveXML({ format: true });
    currentXml.value = result.xml as string;
  } catch (error) {
    console.error('[BpmnModeler] syncXmlFromModeler failed', error);
  }
}

/** 从 XML 编辑器内容重新导入到 modeler（切回模型视图时调用） */
async function syncXmlToModeler() {
  if (!modeler.value) return;
  try {
    await modeler.value.importXML(currentXml.value);
    emit('change', currentXml.value);
    const canvas = modeler.value.get('canvas') as any;
    canvas.zoom('fit-viewport', 'auto');
  } catch (error) {
    console.error('[BpmnModeler] syncXmlToModeler failed', error);
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
 * 窗口大小变化时通知 bpmn-js 重新计算画布尺寸
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
    try {
      const canvas = modeler.value?.get('canvas') as any;
      canvas?.resized();
    } catch {
      // ignore
    }
  }, 100);
}

/**
 * 刷新画布：重新计算尺寸 + 适配视口
 * 用于 tab 切换后（从 display:none 恢复显示时）重新校正画布
 */
function refreshCanvas() {
  if (!modeler.value) return;
  nextTick(() => {
    try {
      const canvas = modeler.value?.get('canvas') as any;
      canvas?.resized();
      canvas?.zoom('fit-viewport', 'auto');
    } catch {
      // ignore
    }
  });
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

// 主题切换时重建 Modeler
watch(
  () => props.theme,
  async () => {
    destroyModeler();
    await initModeler();
  },
);

// 视图模式切换：xml → model 时把编辑器内容导入回 modeler
watch(
  () => props.viewMode,
  async (newMode, oldMode) => {
    if (newMode === 'xml' && oldMode === 'model') {
      // 切到 XML：序列化当前模型到编辑器
      await syncXmlFromModeler();
    } else if (newMode === 'model' && oldMode === 'xml') {
      // 切回模型：把编辑器中的 XML 导入回 modeler
      await syncXmlToModeler();
      // canvas 之前被 v-show 隐藏，恢复后需要重新计算尺寸
      nextTick(() => resizeCanvas());
    }
  },
);

// XML 编辑器内容变化（用户手动编辑 XML 时）
function handleXmlInput(xml: string) {
  currentXml.value = xml;
}

defineExpose({
  importXML,
  saveXML,
  getModeler: () => modeler.value,
  refreshCanvas,
});
</script>

<template>
  <div ref="containerRef" class="bpmn-modeler-container">
    <!-- 模型画布 -->
    <div
      ref="canvasRef"
      class="bpmn-canvas"
      v-show="viewMode === 'model'"
    ></div>

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
      v-show="viewMode === 'model'"
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

    <!-- 属性面板挂载点 -->
    <div
      v-show="showPanel && viewMode === 'model'"
      :id="panelId"
      class="bpmn-properties-panel"
      :style="{ width: panelWidth + 'px' }"
    ></div>
  </div>
</template>

<style scoped>
.bpmn-modeler-container {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.bpmn-canvas {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: var(--bg-canvas, #fafafa);
}

.bpmn-properties-panel {
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

:deep(.djs-minimap) {
  top: auto !important;
  right: 16px !important;
  bottom: 16px !important;
}

.xml-editor-wrapper {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

/* 暗色主题下的画布 */
.dark .bpmn-canvas {
  background: #131316;
}

.dark .bpmn-properties-panel {
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
