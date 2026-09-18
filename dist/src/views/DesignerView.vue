<script setup lang="ts">
import type { Ref } from 'vue';

import { computed, inject, nextTick, provide, reactive, ref, watch } from 'vue';

import BpmnModeler from '@/components/BpmnModeler.vue';
import DmnModeler from '@/components/DmnModeler.vue';
import CanvasToolbar from '@/components/modeler/CanvasToolbar.vue';
import { useLintIssuesStore } from '@/stores/lintIssues';
import { usePanelLayoutStore } from '@/stores/panelLayout';
import { useTabsStore } from '@/stores/tabs';
import { useThemeStore } from '@/stores/theme';
import HomeView from '@/views/HomeView.vue';

const tabsStore = useTabsStore();
const themeStore = useThemeStore();
const panelLayoutStore = usePanelLayoutStore();
const lintIssuesStore = useLintIssuesStore();

const tabs = computed(() => tabsStore.tabs);
const activeId = computed(() => tabsStore.activeId);
const hasTabs = computed(() => tabsStore.hasTabs);

// 属性面板开关（从 ModelerLayout inject）
const showPanel = inject<Ref<boolean>>('showPanel', ref(true));
// 属性面板宽度（从 ModelerLayout inject）
const panelWidth = inject<Ref<number>>('panelWidth', ref(340));

/** 拖拽手柄更新宽度 */
function handleUpdatePanelWidth(w: number) {
  panelLayoutStore.setPanelWidth(w);
}

/** 折叠/展开面板（来自子组件的 update 请求） */
function handleUpdateShowPanel(val: boolean) {
  if (!val) {
    showPanel.value = false;
  } else {
    // 重新展开时保留用户上次使用的宽度，与 TitleBar 按钮的展开行为保持一致
    showPanel.value = true;
  }
}

// CanvasToolbar 根据当前激活 tab 的 viewMode 决定显隐
const activeViewMode = computed(() => tabsStore.activeViewMode);

// 收集每个 tab 的 modeler 实例引用（key = tab.id）
// 同步写入 lintIssuesStore，供 ProblemsPanel 跨层级访问（点击错误项跳转画布）
const modelerRefs = reactive<Record<string, any>>({});

// 当前激活 tab 的 modeler 引用（computed，随 activeId 切换）
const modelerRef = computed(() => modelerRefs[activeId.value] ?? null);

// 每个 tab 的校验问题统一由 lintIssuesStore 管理（跨 ModelerLayout / DesignerView 兄弟层级共享）

/**
 * 处理 modeler 校验结果
 * @kunpeng/linting 返回扁平的 reports 数组，每项 { id, message, category, rule }
 * 这里映射为 ProblemItem[] 写入 store
 */
function handleLint(tabId: string, reports: any[]) {
  const items = (reports || []).map((report) => {
    const category = report.category || report.severity || 'error';
    return {
      severity: category === 'warn' || category === 'warning' ? 'warning' : 'error',
      message: report.message || report.name || String(report.rule || '未知问题'),
      source: report.rule,
      id: report.id,
    };
  });
  lintIssuesStore.setIssues(tabId, items);
}

// 当前主题
const theme = computed(() => (themeStore.isDark ? 'dark' : 'light'));

// 内容变更：写入对应 tab 的 XML
function handleChange(tabId: string, xml: string) {
  tabsStore.updateXml(tabId, xml);
}

// 设置组件 ref 的回调（同步写入 store，供 ProblemsPanel 跨层级访问）
function setModelerRef(tabId: string) {
  return (el: any) => {
    if (el) {
      modelerRefs[tabId] = el;
    } else {
      delete modelerRefs[tabId];
    }
    lintIssuesStore.setModelerRef(tabId, el);
  };
}

// CanvasToolbar 在 DesignerView 子树内，仍可通过 inject 拿到当前激活 modeler
provide('modelerRef', modelerRef);
// modelerRefs 已同步写入 lintIssuesStore，供 TitleBar / ProblemsPanel 跨层级访问
// 校验问题列表也由 lintIssuesStore 全局共享，避免 provide/inject 跨兄弟层级失效

/**
 * tab 切换时刷新画布
 * v-show 从 display:none 恢复后，canvas 尺寸需要重新校正 + 适配视口
 */
watch(activeId, (newId) => {
  if (!newId) return;
  // 同步当前激活 tab 到 lint store，让 StatusBar / ProblemsPanel 显示对应问题
  lintIssuesStore.setActiveTab(newId);
  nextTick(() => {
    const modeler = modelerRefs[newId];
    modeler?.refreshCanvas?.();
  });
});

// 初始同步一次激活 tab
lintIssuesStore.setActiveTab(activeId.value);
</script>

<template>
  <template v-if="hasTabs">
    <div class="designer-view">
      <!-- 中间画布 + 悬浮条 -->
      <div class="canvas-wrapper">
        <CanvasToolbar v-show="activeViewMode === 'model'" />

        <!-- 每个 tab 独立挂载一个 modeler 实例，v-show 控制可见性 -->
        <template v-for="tab in tabs" :key="tab.id">
          <BpmnModeler
            v-if="tab.type === 'bpmn'"
            :ref="setModelerRef(tab.id)"
            v-show="tab.id === activeId"
            :xml="tab.xml"
            :theme="theme"
            :show-panel="showPanel"
            :panel-width="panelWidth"
            :view-mode="tab.viewMode"
            @change="(xml: string) => handleChange(tab.id, xml)"
            @update:panel-width="handleUpdatePanelWidth"
            @update:show-panel="handleUpdateShowPanel"
            @lint="(reports: any[]) => handleLint(tab.id, reports)"
          />
          <DmnModeler
            v-else
            :ref="setModelerRef(tab.id)"
            v-show="tab.id === activeId"
            :xml="tab.xml"
            :theme="theme"
            :show-panel="showPanel"
            :panel-width="panelWidth"
            :view-mode="tab.viewMode"
            @change="(xml: string) => handleChange(tab.id, xml)"
            @update:panel-width="handleUpdatePanelWidth"
            @update:show-panel="handleUpdateShowPanel"
          />
        </template>
      </div>
    </div>
  </template>

  <!-- 无激活标签时，显示欢迎页 -->
  <HomeView v-else />
</template>

<style scoped>
.designer-view {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
</style>
