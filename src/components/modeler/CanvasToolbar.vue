<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createEmptyBpmn } from '@/utils/bpmn-templates';
import { createEmptyDmn } from '@/utils/dmn-templates';
import { useTabsStore } from '@/stores/tabs';

const { t } = useI18n();
const tabsStore = useTabsStore();
const modelerRef = inject<Ref<any>>('modelerRef', ref(null));

const isDmn = computed(() => tabsStore.activeTab?.type === 'dmn');
const zoomLevel = ref(100);

function getModeler() {
  return modelerRef.value?.getModeler?.();
}

function undo() {
  const modeler = getModeler();
  try {
    const activeViewer = modeler?.getActiveViewer?.() ?? modeler;
    activeViewer?.get('commandStack')?.undo?.();
  } catch { /* noop */ }
}

function redo() {
  const modeler = getModeler();
  try {
    const activeViewer = modeler?.getActiveViewer?.() ?? modeler;
    activeViewer?.get('commandStack')?.redo?.();
  } catch { /* noop */ }
}

/**
 * 重置画布：重新导入空模板并将缩放设为 1
 * 参照 AnYiBpmnDesignerKunpeng.vue 的 handleRestart()
 */
async function restart() {
  const modeler = getModeler();
  if (!modeler) return;
  try {
    const emptyXml = isDmn.value ? createEmptyDmn() : createEmptyBpmn();
    await modeler.importXML(emptyXml);
    nextTick(() => {
      const canvas = modeler.getActiveViewer?.()?.get('canvas') ?? modeler.get('canvas');
      canvas?.zoom(1, 'auto');
      updateZoom();
      updateOrientation();
    });
    // 同步到 tab store
    const activeTab = tabsStore.activeTab;
    if (activeTab) {
      tabsStore.updateXml(activeTab.id, emptyXml);
    }
  } catch (err) {
    console.error('[CanvasToolbar] restart failed', err);
  }
}

function zoomIn() {
  const modeler = getModeler();
  try {
    const canvas = modeler?.getActiveViewer?.()?.get('canvas') ?? modeler?.get('canvas');
    canvas?.zoom(canvas.zoom() * 1.2);
    updateZoom();
  } catch { /* noop */ }
}

function zoomOut() {
  const modeler = getModeler();
  try {
    const canvas = modeler?.getActiveViewer?.()?.get('canvas') ?? modeler?.get('canvas');
    canvas?.zoom(canvas.zoom() / 1.2);
    updateZoom();
  } catch { /* noop */ }
}

function fitView() {
  const modeler = getModeler();
  try {
    const canvas = modeler?.getActiveViewer?.()?.get('canvas') ?? modeler?.get('canvas');
    canvas?.zoom('fit-viewport', 'auto');
    updateZoom();
  } catch { /* noop */ }
}

function updateZoom() {
  const modeler = getModeler();
  try {
    const canvas = modeler?.getActiveViewer?.()?.get('canvas') ?? modeler?.get('canvas');
    zoomLevel.value = Math.round((canvas?.zoom?.() ?? 1) * 100);
  } catch { /* noop */ }
}

/** 当前布局方向（无模型标记时库默认水平） */
const orientation = ref<'horizontal' | 'vertical'>('horizontal');

let wiredViewer: any = null;
let orientationRetries = 0;

function updateOrientation() {
  const modeler = getModeler();
  try {
    const viewer = modeler?.getActiveViewer?.() ?? modeler;
    if (!viewer) {
      // 模型器异步创建：稍后重试，直到能挂上 commandStack.changed 同步
      if (orientationRetries++ < 10) setTimeout(updateOrientation, 300);
      return;
    }
    orientationRetries = 0;
    orientation.value = viewer?.get('orientationService')?.getOrientation?.() ?? 'horizontal';
    // 实例首次可用（或主题切换重建后）挂 commandStack.changed：切换/撤销/重做/重绘
    // 都会触发，保证按钮态跟随命令栈而非仅点击路径
    if (viewer !== wiredViewer) {
      wiredViewer = viewer;
      viewer.get('eventBus')?.on?.('commandStack.changed', updateOrientation);
    }
  } catch { /* noop */ }
}

/** 切换水平/纵向布局（以服务端实读值为准，避免本地状态过期） */
function toggleOrientation() {
  const modeler = getModeler();
  try {
    const viewer = modeler?.getActiveViewer?.() ?? modeler;
    const svc = viewer?.get('orientationService');
    if (!svc) return;
    const current = svc.getOrientation();
    viewer.get('modeling').setOrientation(current === 'vertical' ? 'horizontal' : 'vertical');
    orientation.value = svc.getOrientation();
    updateZoom();
  } catch { /* noop */ }
}

onMounted(updateOrientation);
watch(() => tabsStore.activeTab?.id, () => nextTick(updateOrientation));
</script>

<template>
  <div class="canvas-toolbar">
    <!-- 校验/模拟 -->
    <div class="ct-group">
      <button class="ct-btn" :title="t('toolbar.validate')">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="m15 22 7 7 11.5-11.5M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6s18 8.059 18 18Z"></path>
        </svg>
      </button>
      <button class="ct-btn" :title="t('toolbar.simulate')" v-if="!isDmn">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="M24 42c9.941 0 18-8.059 18-18S33.941 6 24 6 6 14.059 6 24s8.059 18 18 18Z"></path>
          <path d="M19 17v14l12-7-12-7Z"></path>
        </svg>
      </button>
    </div>

    <div class="ct-sep"></div>

    <!-- 撤销/重做/重置 -->
    <div class="ct-group">
      <button class="ct-btn" :title="t('toolbar.undo')" @click="undo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="m15.322 23.78-7.778-7.778 7.778-7.778M8.81 16H29.5C35.851 16 41 21.15 41 27.5 41 33.852 35.851 39 29.5 39H17"></path>
        </svg>
      </button>
      <button class="ct-btn" :title="t('toolbar.redo')" @click="redo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="m32.678 23.78 7.778-7.778-7.778-7.778M39.19 16H18.5C12.149 16 7 21.15 7 27.5 7 33.852 12.149 39 18.5 39H31"></path>
        </svg>
      </button>
      <button class="ct-btn" :title="t('toolbar.restart')" @click="restart">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="M25.5 40.503 14.914 40.5a1 1 0 0 1-.707-.293l-9-9a1 1 0 0 1 0-1.414L13.5 21.5m12 19.003L44 40.5m-18.5.003L29 37M13.5 21.5 26.793 8.207a1 1 0 0 1 1.414 0l14.086 14.086a1 1 0 0 1 0 1.414L29 37M13.5 21.5 29 37"></path>
        </svg>
      </button>
    </div>

    <div class="ct-sep"></div>

    <!-- 缩放 -->
    <div class="ct-group ct-zoom">
      <button class="ct-btn" :title="t('toolbar.zoomOut')" @click="zoomOut">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="M32.607 32.607A14.953 14.953 0 0 0 37 22c0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15 4.142 0 7.892-1.679 10.607-4.393Zm0 0L41.5 41.5M29 22H15"></path>
        </svg>
      </button>
      <span class="zoom-val">{{ zoomLevel }}%</span>
      <button class="ct-btn" :title="t('toolbar.zoomIn')" @click="zoomIn">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path d="M32.607 32.607A14.953 14.953 0 0 0 37 22c0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15 4.142 0 7.892-1.679 10.607-4.393Zm0 0L41.5 41.5M29 22H15m7 7V15"></path>
        </svg>
      </button>
      <button
        v-if="!isDmn"
        class="ct-btn"
        :title="orientation === 'vertical' ? t('toolbar.toHorizontal') : t('toolbar.toVertical')"
        @click="toggleOrientation"
      >
        <!-- 布局方向：画布框内实心箭头指向流向，图形反映当前布局（水平 → / 纵向 ↓） -->
        <svg v-if="orientation === 'vertical'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <rect x="6" y="6" width="36" height="36" rx="4"></rect>
          <path d="M24 13v17"></path>
          <path d="M24 36l-6.5-8.5h13z" fill="currentColor" stroke="none"></path>
        </svg>
        <svg v-else viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <rect x="6" y="6" width="36" height="36" rx="4"></rect>
          <path d="M13 24h17"></path>
          <path d="M36 24l-8.5-6.5v13z" fill="currentColor" stroke="none"></path>
        </svg>
      </button>
      <button class="ct-btn" :title="t('toolbar.fitView')" @click="fitView">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="ct-svg-icon">
          <path clip-rule="evenodd" d="M24 6c9.941 0 18 8.059 18 18s-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6Z"></path>
          <path d="M30 24a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="currentColor" stroke="none"></path>
          <path d="M30 24a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.canvas-toolbar {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: var(--naive-card-color);
  border: 1px solid var(--naive-border-color);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ct-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ct-sep {
  width: 1px;
  height: 18px;
  background: var(--naive-border-color);
  margin: 0 4px;
}

.ct-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--naive-text-color-2);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.ct-btn:hover {
  background: var(--naive-hover-color);
  color: var(--naive-text-color);
}

.ct-zoom {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--naive-text-color-2);
}

.zoom-val {
  min-width: 42px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.ct-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
}

/*
 * SVG 通过 <img> 引入时，fill="currentColor" 无法继承父元素 CSS color，
 * 浏览器默认渲染为黑色。暗色主题下需反色为白色。
 * inline SVG 已用 currentColor，无需 invert。
 */
.dark img.ct-svg-icon {
  filter: invert(1);
}
</style>
