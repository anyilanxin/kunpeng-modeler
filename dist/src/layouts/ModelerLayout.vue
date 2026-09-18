<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import StatusBar from '@/components/modeler/StatusBar.vue';
import TitleBar from '@/components/modeler/TitleBar.vue';
import ProblemsPanel from '@/components/modeler/ProblemsPanel.vue';
import { PROBLEMS_COLLAPSE_THRESHOLD, usePanelLayoutStore } from '@/stores/panelLayout';
import { useTabsStore } from '@/stores/tabs';
import { loadSavedFiles, openModelFile } from '@/services/modelFile';
import { md5Of } from '@/utils/hash';

const router = useRouter();
const tabsStore = useTabsStore();
const panelLayoutStore = usePanelLayoutStore();
const { panelWidth, problemsHeight } = storeToRefs(panelLayoutStore);

/** 判断是否在 Tauri 桌面环境中运行 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** 把一个模型文件打开为标签并跳转到设计器（运行期双击新文件时复用） */
async function openFileAsTab(filePath: string): Promise<void> {
  // 已打开同路径的文件：直接激活，避免重复标签
  const existing = tabsStore.tabs.find((t) => t.filePath === filePath);
  if (existing) {
    tabsStore.setActive(existing.id);
    router.push({ name: 'designer', params: { type: existing.type } });
    return;
  }
  const data = await openModelFile(filePath);
  if (!data) return;
  tabsStore.openTab({
    type: data.type,
    title: data.title,
    xml: data.xml,
    filePath: data.filePath,
    diskMd5: md5Of(data.xml),
  });
  router.push({ name: 'designer', params: { type: data.type } });
}

// 启动时处理 OS 级文件打开（双击关联文件启动）+ 已保存文件恢复
let unlistenOpenedFiles: (() => void) | null = null;

onMounted(async () => {
  // 1) 始终恢复 manifest（直接打开 / 双击文件打开两种场景都需要）
  let restoredAny = false;
  try {
    const files = await loadSavedFiles();
    for (const f of files) {
      tabsStore.openTab({
        type: f.type,
        title: f.title,
        xml: f.xml,
        filePath: f.filePath,
        diskMd5: md5Of(f.xml),
      });
      restoredAny = true;
    }
  } catch {
    // 浏览器模式或首次启动，忽略
  }

  // 2) 消费操作系统传入的待打开文件（双击 .bpmn/.dmn 启动本应用）
  let openedFromOs: string[] = [];
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      openedFromOs = await invoke<string[]>('take_opened_files');
    } catch {
      // 命令不可用，忽略
    }
  }

  if (openedFromOs.length > 0) {
    // 双击文件打开：逐个处理，复用 openFileAsTab 的去重/激活逻辑
    // - 若文件已在 manifest（已恢复为 tab）：openFileAsTab 直接激活它
    // - 若不在：openFileFile 新建 tab 打开（同时写入 manifest）
    for (const p of openedFromOs) {
      await openFileAsTab(p);
    }
  } else if (restoredAny) {
    // 直接打开且有恢复的文件：激活第一个恢复的 tab
    const firstTab = tabsStore.tabs[0];
    router.push({ name: 'designer', params: { type: firstTab.type } });
  }

  // 3) 订阅运行期再次打开文件（应用已运行时双击新文件）
  if (isTauri()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen<string[]>('opened-files', async (event) => {
        const paths = event.payload ?? [];
        await Promise.all(paths.map((p) => openFileAsTab(p)));
      });
      unlistenOpenedFiles = unlisten;
    } catch {
      // 忽略
    }
  }
});

onUnmounted(() => {
  unlistenOpenedFiles?.();
  unlistenOpenedFiles = null;
});

// 属性面板开关
const showPanel = ref(true);

function togglePanel() {
  showPanel.value = !showPanel.value;
}

// Problems 面板开关（底部弹出的问题列表）
const showProblems = ref(false);

function toggleProblems() {
  showProblems.value = !showProblems.value;
  // 通过 StatusBar 重新打开时：恢复展开态，并重置到初始高度（= 内容标题栏 34px 的 3 倍）
  if (showProblems.value) {
    panelLayoutStore.setProblemsCollapsed(false);
    panelLayoutStore.setProblemsHeight(PROBLEMS_COLLAPSE_THRESHOLD);
  }
}

function closeProblems() {
  showProblems.value = false;
}

// XML / 模型视图切换（读当前激活 tab 的 viewMode，每个 tab 独立）
const activeViewMode = computed(() => tabsStore.activeViewMode);

function toggleView() {
  tabsStore.toggleActiveViewMode();
}

// 是否显示建模器布局（有打开的标签时）
const showModeler = computed(() => tabsStore.hasTabs);

// 向下层 provide 属性面板开关状态
provide('showPanel', showPanel);
provide('togglePanel', togglePanel);
// 向下层 provide 属性面板宽度（共享）
provide('panelWidth', panelWidth);
// 向下层 provide 视图切换状态（StatusBar 读激活 tab 的 viewMode）
provide('viewMode', activeViewMode);
provide('toggleView', toggleView);
// 向下层 provide Problems 面板开关（StatusBar 点击错误区域切换）
provide('showProblems', showProblems);
provide('toggleProblems', toggleProblems);
provide('closeProblems', closeProblems);
// 向下层 provide Problems 面板高度（可拖拽调整 + 持久化）
provide('problemsHeight', problemsHeight);
provide('setProblemsHeight', (h: number) => panelLayoutStore.setProblemsHeight(h));
</script>

<template>
  <div class="modeler-layout">
    <!-- 上：顶部导航 -->
    <TitleBar />

    <!-- 中：画布 + 属性面板（占据剩余空间，底部高度变化时自然收缩） -->
    <div class="layout-body">
      <RouterView />
    </div>

    <!-- 下：底部导航（ProblemsPanel + StatusBar，始终在底部） -->
    <div class="layout-footer">
      <!-- Problems 面板（底部弹出，挤压画布向上；折叠态仅显示手柄条，不卸载组件） -->
      <ProblemsPanel
        v-if="showModeler && showProblems"
        :height="problemsHeight"
      />

      <!-- 底部状态栏（有标签时才显示） -->
      <StatusBar v-if="showModeler" />
    </div>
  </div>
</template>

<style scoped>
.modeler-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 下：底部导航整体（ProblemsPanel + StatusBar），不参与 flex 拉伸 */
.layout-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
</style>
