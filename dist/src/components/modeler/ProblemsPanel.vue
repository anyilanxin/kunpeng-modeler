<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useLintIssuesStore, type ProblemItem } from '@/stores/lintIssues';
import {
  PROBLEMS_COLLAPSE_THRESHOLD,
  usePanelLayoutStore,
} from '@/stores/panelLayout';

type PanelTab = 'output' | 'problems';

const props = withDefaults(
  defineProps<{
    height?: number;
  }>(),
  { height: 220 },
);

const { t } = useI18n();
const lintIssuesStore = useLintIssuesStore();
const panelLayoutStore = usePanelLayoutStore();

// 从上层 inject 关闭方法（完全隐藏面板，与折叠不同）
const closeProblems = inject<() => void>('closeProblems', () => {});
// 设置 Problems 面板高度（由 ModelerLayout provide）
const setProblemsHeight = inject<(h: number) => void>('setProblemsHeight', () => {});

/**
 * 折叠态：面板塌缩为仅一条拖拽手柄（带 handlebar 图标），不卸载组件。
 * 拖拽低于 PROBLEMS_COLLAPSE_THRESHOLD（= 标题栏两倍高度）自动折叠；
 * 点击折叠态手柄恢复到 PROBLEMS_COLLAPSE_THRESHOLD 高度。
 */
const collapsed = computed(() => panelLayoutStore.problemsCollapsed);

/**
 * 当前激活的底部 tab：
 * - output：仅输出错误消息，不触发画布红色标注，不污染元素属性面板
 * - problems：显示所有错误的详细信息，同时激活画布 lint 标注（红色圆圈）与元素属性面板错误提示
 *
 * 切换到 problems 才调用 linting.activate()，离开 problems（切到 output）则调用 linting.deactivate()。
 */
const activeTab = ref<PanelTab>('output');

// 当前激活 tab 的校验问题——消息列表用 activeIssues（清空后隐藏），
// 数量统计用 activeAllIssues（清空消息不影响真实错误数）
const problems = computed(() => lintIssuesStore.activeIssues);

// Problems tab 展示的是完整错误列表（不受 dismissed 影响）：它代表"所有错误"。
const allProblems = computed(() => lintIssuesStore.activeAllIssues);

const errorCount = computed(() => allProblems.value.filter((p) => p.severity === 'error').length);
const warnCount = computed(() => allProblems.value.filter((p) => p.severity === 'warning').length);

// output tab 的消息列表是否为空（含 dismissed 后变空的情况）
const isOutputEmpty = computed(() => problems.value.length === 0);
// problems tab 是否为空（真正无错误）
const isProblemsEmpty = computed(() => allProblems.value.length === 0);

/** 清空当前 tab 校验结果（走 store） */
function clearProblems() {
  lintIssuesStore.clearIssues();
}

/** 点击错误项：滚动并选中对应的画布元素 */
function handleItemClick(item: ProblemItem) {
  const modeler = lintIssuesStore.activeModelerRef;
  if (!item.id || !modeler) return;
  try {
    const linting = modeler.getModeler?.()?.get('linting');
    if (linting?.showError) {
      linting.showError({ id: item.id, message: item.message, category: item.severity });
    }
  } catch {
    // ignore
  }
}

/** 激活画布错误标注（红色圆圈）+ 元素属性面板错误提示 */
function activateAnnotations() {
  try {
    const modeler = lintIssuesStore.activeModelerRef;
    const linting = modeler?.getModeler?.()?.get('linting');
    linting?.activate?.();
  } catch {
    // ignore
  }
}

/** 停用画布错误标注 */
function deactivateAnnotations() {
  try {
    const modeler = lintIssuesStore.activeModelerRef;
    const linting = modeler?.getModeler?.()?.get('linting');
    linting?.deactivate?.();
  } catch {
    // ignore
  }
}

/** 切换 tab：仅 problems tab 才激活画布标注 */
function switchTab(tab: PanelTab) {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  if (tab === 'problems') {
    // 延迟一帧，确保 modeler 已就绪
    requestAnimationFrame(activateAnnotations);
  } else {
    deactivateAnnotations();
  }
}

// activeTab / modeler 引用变化时，确保画布标注与当前 tab 一致
watch(
  () => lintIssuesStore.activeModelerRef,
  (modeler) => {
    if (!modeler) return;
    // modeler 就绪后，按当前 tab 同步标注状态
    if (activeTab.value === 'problems') {
      requestAnimationFrame(activateAnnotations);
    } else {
      deactivateAnnotations();
    }
  },
);

// 折叠时停用画布标注；展开时若当前在 problems tab 则重新激活
watch(collapsed, (isCollapsed) => {
  if (isCollapsed) {
    deactivateAnnotations();
  } else if (activeTab.value === 'problems') {
    requestAnimationFrame(activateAnnotations);
  }
});

// 面板挂载（StatusBar 打开）：面板出现挤压画布，需触发 resize 让画布适配新尺寸
onMounted(() => {
  notifyCanvasResize();
});

onBeforeUnmount(() => {
  // 面板关闭时停用画布标注，避免红色圆圈残留
  deactivateAnnotations();
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
  document.body.classList.remove('problems-resizing');
  // 面板卸载（StatusBar 关闭）：画布重新扩大，需触发 resize 适配
  notifyCanvasResize();
});

function handleClose() {
  closeProblems();
}

/** 清空错误列表 */
function handleClear() {
  clearProblems();
}

/** 复制全部错误信息到剪贴板 */
async function handleCopy() {
  if (isOutputEmpty.value) return;
  const text = problems.value
    .map((p) => {
      const sev = p.severity === 'error' ? 'Error' : 'Warning';
      const loc = p.source ? ` [${p.source}${p.line ? `:${p.line}` : ''}]` : '';
      return `${sev}${loc}: ${p.message}`;
    })
    .join('\n');
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 剪贴板不可用时静默忽略
  }
}

/* ============== 顶部拖拽手柄：调整面板高度 ============== */
let dragStartY = 0;
let dragStartHeight = 0;
// 拖拽过程中是否在松开时折叠面板
let pendingCollapse = false;

/**
 * 通知画布容器尺寸已变化，触发 bpmn-js 重新适配视口。
 * 底部面板高度变化会挤压中间画布区域，必须显式调用 refreshCanvas()
 * 否则 diagram-js 视口计算会错位（canvas.resized 不会自动触发）。
 */
function notifyCanvasResize() {
  // refreshCanvas 内部已用 nextTick 包裹，确保 DOM 高度更新后才执行
  lintIssuesStore.activeModelerRef?.refreshCanvas?.();
}

function onResizeMove(e: MouseEvent) {
  // 面板在底部，向下拖（delta 正）→ 高度变小
  const delta = e.clientY - dragStartY;
  const newHeight = dragStartHeight - delta;
  if (newHeight < PROBLEMS_COLLAPSE_THRESHOLD) {
    // 低于阈值（= 标题栏两倍高度）：标记折叠，不再继续缩矮
    pendingCollapse = true;
    return;
  }
  pendingCollapse = false;
  setProblemsHeight(newHeight);
}

function onResizeEnd() {
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
  document.body.classList.remove('problems-resizing');
  if (pendingCollapse) {
    pendingCollapse = false;
    panelLayoutStore.setProblemsCollapsed(true);
  }
  // 拖拽结束（无论折叠还是调整高度），画布尺寸已变化，需要重新适配视口
  notifyCanvasResize();
}

function onResizeStart(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  dragStartY = e.clientY;
  dragStartHeight = props.height;
  pendingCollapse = false;
  document.body.classList.add('problems-resizing');
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
}

/**
 * 折叠态手柄的点击/拖拽入口：
 * - 点击（无显著移动）：展开到 PROBLEMS_COLLAPSE_THRESHOLD（= 标题栏两倍高度）
 * - 拖拽：从阈值高度开始向上拖拽调整
 */
let collapsedDragStartY = 0;

function onCollapsedMouseDown(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  collapsedDragStartY = e.clientY;
  // 先展开到阈值高度，再接管 mousemove 实时调整
  panelLayoutStore.setProblemsCollapsed(false);
  setProblemsHeight(PROBLEMS_COLLAPSE_THRESHOLD);
  document.body.classList.add('problems-resizing');
  document.addEventListener('mousemove', onCollapsedDragMove);
  document.addEventListener('mouseup', onCollapsedDragEnd);
}

function onCollapsedDragMove(e: MouseEvent) {
  const delta = e.clientY - collapsedDragStartY;
  // 向上拖（delta 负）→ 高度变大
  const newHeight = PROBLEMS_COLLAPSE_THRESHOLD - delta;
  if (newHeight >= PROBLEMS_COLLAPSE_THRESHOLD) {
    setProblemsHeight(newHeight);
  }
}

function onCollapsedDragEnd() {
  document.removeEventListener('mousemove', onCollapsedDragMove);
  document.removeEventListener('mouseup', onCollapsedDragEnd);
  document.body.classList.remove('problems-resizing');
  // 从折叠态展开后面板占据空间，画布尺寸变化，需要重新适配视口
  notifyCanvasResize();
}
</script>

<template>
  <!-- 折叠态：仅一条带 handlebar 图标的拖拽手柄（高度 PROBLEMS_COLLAPSED_HEIGHT） -->
  <div
    v-if="collapsed"
    class="pp-collapsed-bar"
    :title="t('problems.dragToResize')"
    @mousedown="onCollapsedMouseDown"
  >
    <!-- handlebar 图标：复用属性面板同款 path，旋转 90° 适配横向手柄，绝对定位居中溢出显示 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="64"
      viewBox="0 0 9 64"
      class="pp-collapsed-icon"
    >
      <path
        fill-rule="evenodd"
        d="M.343 32L6 26.343V1.5a1.5 1.5 0 113 0v61a1.5 1.5 0 11-3 0V37.657L.343 32z"
      ></path>
    </svg>
  </div>

  <!-- 展开态：完整面板 -->
  <div v-else class="problems-panel" :style="{ height: props.height + 'px' }">
    <!-- 顶部拖拽手柄：上下拖动调整面板高度（视觉与属性面板竖向拖拽条一致：默认透明，hover 整条变实心蓝） -->
    <div class="pp-resizer" @mousedown="onResizeStart" :title="t('problems.dragToResize')"></div>

    <!-- 标题栏 -->
    <div class="pp-header">
      <!-- 左侧：tab 切换（错误数量由底部 StatusBar 统一显示，这里不再重复） -->
      <div class="pp-tabs">
        <button
          class="pp-tab"
          :class="{ 'pp-tab-active': activeTab === 'output' }"
          @click="switchTab('output')"
        >
          {{ t('problems.tabOutput') }}
        </button>
        <button
          class="pp-tab"
          :class="{ 'pp-tab-active': activeTab === 'problems' }"
          @click="switchTab('problems')"
        >
          {{ t('problems.tabProblems') }}
        </button>
      </div>

      <!-- 右侧：操作按钮（仅 output tab 显示 copy/clear，关闭按钮始终显示） -->
      <div class="pp-actions">
        <!-- 复制错误信息（仅 output tab 且非空时显示） -->
        <button
          v-if="activeTab === 'output' && !isOutputEmpty"
          class="pp-icon-btn"
          :title="t('problems.copy')"
          @click="handleCopy"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            class="action-svg"
          >
            <path d="M20 6h18a2 2 0 0 1 2 2v22M8 16v24c0 1.105.891 2 1.996 2h20.007A1.99 1.99 0 0 0 32 40.008V15.997A1.997 1.997 0 0 0 30 14H10a2 2 0 0 0-2 2Z"></path>
          </svg>
        </button>
        <!-- 清空错误信息（仅 output tab 且非空时显示） -->
        <button
          v-if="activeTab === 'output' && !isOutputEmpty"
          class="pp-icon-btn"
          :title="t('problems.clear')"
          @click="handleClear"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            class="action-svg"
          >
            <path d="M5 11h5.5m0 0v29a1 1 0 0 0 1 1h25a1 1 0 0 0 1-1V11m-27 0H16m21.5 0H43m-5.5 0H32m-16 0V7h16v4m-16 0h16M20 18v15m8-15v15"></path>
          </svg>
        </button>
        <!-- 关闭 -->
        <button class="pp-icon-btn" :title="t('problems.close')" @click="handleClose">
          <div class="i-carbon-close"></div>
        </button>
      </div>
    </div>

    <!-- 内容区：根据 tab 切换 -->
    <div class="pp-body">
      <!-- ============ Output Tab ============ -->
      <template v-if="activeTab === 'output'">
        <!-- 清空消息后：列表为空但实际仍有错误 -->
        <div v-if="isOutputEmpty && allProblems.length > 0" class="pp-empty">
          <div class="i-carbon-error pp-empty-icon pp-empty-icon-warn"></div>
          <span>{{ t('problems.dismissedHint', { count: errorCount + warnCount }) }}</span>
        </div>
        <!-- 真正无错误 -->
        <div v-else-if="isOutputEmpty" class="pp-empty">
          <div class="i-carbon-checkmark-outline pp-empty-icon"></div>
          <span>{{ t('problems.outputEmpty') }}</span>
        </div>
        <ul v-else class="pp-list">
          <li
            v-for="(item, idx) in problems"
            :key="idx"
            class="pp-item"
            :class="item.severity"
            @click="handleItemClick(item)"
          >
            <div
              class="pp-item-icon"
              :class="item.severity === 'error' ? 'i-carbon-error' : 'i-carbon-warning'"
            ></div>
            <span class="pp-item-msg">{{ item.message }}</span>
            <span v-if="item.source" class="pp-item-source">
              {{ item.source }}<template v-if="item.line">:{{ item.line }}</template>
            </span>
          </li>
        </ul>
      </template>

      <!-- ============ Problems Tab ============ -->
      <template v-else>
        <div v-if="isProblemsEmpty" class="pp-empty">
          <div class="i-carbon-checkmark-outline pp-empty-icon"></div>
          <span>{{ t('problems.empty') }}</span>
        </div>
        <ul v-else class="pp-list">
          <li
            v-for="(item, idx) in allProblems"
            :key="idx"
            class="pp-item"
            :class="item.severity"
            @click="handleItemClick(item)"
          >
            <div
              class="pp-item-icon"
              :class="item.severity === 'error' ? 'i-carbon-error' : 'i-carbon-warning'"
            ></div>
            <span class="pp-item-msg">{{ item.message }}</span>
            <span v-if="item.source" class="pp-item-source">
              {{ item.source }}<template v-if="item.line">:{{ item.line }}</template>
            </span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 折叠态：仅一条带 handlebar 图标的横向手柄（与属性面板折叠态 handlebar 视觉一致，方向旋转 90°） */
.pp-collapsed-bar {
  height: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: row-resize;
  background: transparent;
  border-top: 1px solid var(--naive-border-color);
  transition: background 0.18s ease;
  position: relative;
  z-index: 5;
  /* 允许图标向上溢出手柄条显示 */
  overflow: visible;
}

/* 扩大命中热区 */
.pp-collapsed-bar::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -10px;
  bottom: -2px;
}

.pp-collapsed-bar:hover,
.pp-collapsed-bar:active {
  background: #3b82f6;
}

/*
 * handlebar 图标：复用属性面板同款竖向 path（svg 属性 9x64），旋转 90° 变横向。
 * 保持原始 9x64 尺寸不拉伸（与属性面板一致），旋转后视觉盒子为 64x9。
 * 绝对定位居中，向上溢出 3px 手柄条显示。
 */
.pp-collapsed-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 9px;
  height: 64px;
  pointer-events: none;
  /* 向上偏移 10px：让图标完全脱离 hover 蓝色手柄条，留出清晰间隙 */
  transform: translate(-50%, calc(-50% - 10px)) rotate(90deg);
  transform-origin: center center;
}

.pp-collapsed-icon path {
  fill: #cbd5e1;
  transition: fill 0.18s ease;
}

.pp-collapsed-bar:hover .pp-collapsed-icon path,
.pp-collapsed-bar:active .pp-collapsed-icon path {
  fill: #fff;
}

.problems-panel {
  /* 高度由 inline style 控制（props.height），这里只设最小值 */
  min-height: 30px;
  display: flex;
  flex-direction: column;
  /* overflow:hidden 让内容超出时交给 .pp-body 的滚动条处理，不溢出面板 */
  overflow: hidden;
  background: var(--naive-card-color);
  border-top: 1px solid var(--naive-border-color);
  flex-shrink: 0;
}

/* 顶部拖拽手柄（与属性面板竖向拖拽条视觉一致：默认透明，hover 整条变实心蓝） */
.pp-resizer {
  height: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: row-resize;
  background: transparent;
  transition: background 0.18s ease;
  position: relative;
  z-index: 5;
}

/* 扩大命中热区（向上扩展，避免命中区过窄难抓） */
.pp-resizer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -6px;
  height: 14px;
}

.pp-resizer:hover,
.pp-resizer:active {
  background: #3b82f6;
}

/* 标题栏 */
.pp-header {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 6px;
  border-bottom: 1px solid var(--naive-border-color);
  background: var(--naive-card-color);
  flex-shrink: 0;
}

/* tab 切换组 */
.pp-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
}

.pp-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--naive-text-color-3);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.pp-tab:hover {
  color: var(--naive-text-color-2);
}

.pp-tab-active {
  color: var(--naive-text-color);
}

.pp-tab-active::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  border-radius: 1px;
  background: #165DFF;
}

.pp-count {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.pp-count-error {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.pp-count-warn {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.pp-count .i-carbon-error,
.pp-count .i-carbon-warning {
  font-size: 12px;
}

/* 操作按钮 */
.pp-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pp-icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--naive-text-color-3);
  cursor: pointer;
  font-size: 15px;
  transition: all 0.15s;
}

.pp-icon-btn:hover {
  background: var(--naive-hover-color);
  color: var(--naive-text-color);
}

.pp-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pp-icon-btn:disabled:hover {
  background: transparent;
  color: var(--naive-text-color-3);
}

/* 内联 SVG 图标尺寸（与 carbon icon 视觉一致） */
.action-svg {
  width: 15px;
  height: 15px;
}

/* 内容区 */
.pp-body {
  flex: 1;
  /* min-height:0 必须，否则 flex 子项内容会撑开父容器而不触发滚动 */
  min-height: 0;
  overflow-y: auto;
  padding: 4px 0;
}

/* 空状态 */
.pp-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--naive-text-color-3);
  font-size: 12px;
}

.pp-empty-icon {
  font-size: 28px;
  color: #10b981;
}

.pp-empty-icon-warn {
  color: #f59e0b;
}

/* 问题列表 */
.pp-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pp-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  font-size: 12px;
  color: var(--naive-text-color-2);
  cursor: pointer;
  transition: background 0.12s;
}

.pp-item:hover {
  background: var(--naive-hover-color);
}

.pp-item-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.pp-item.error .pp-item-icon {
  color: #ef4444;
}

.pp-item.warning .pp-item-icon {
  color: #f59e0b;
}

.pp-item-msg {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pp-item-source {
  flex-shrink: 0;
  color: var(--naive-text-color-3);
  font-size: 11px;
  opacity: 0.8;
}
</style>
