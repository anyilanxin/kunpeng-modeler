<script setup lang="ts">
import type { DropdownOption } from 'naive-ui';
import type { Ref, VNodeChild } from 'vue';

import { computed, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { createEmptyBpmn } from '@/utils/bpmn-templates';
import { createEmptyDmn } from '@/utils/dmn-templates';
import { useTabsStore, type ModelTab } from '@/stores/tabs';
import { useThemeStore, type ThemeMode } from '@/stores/theme';
import { useLintIssuesStore } from '@/stores/lintIssues';
import { supportLanguages, setLanguage } from '@/locales';
import { saveModelFile } from '@/services/modelFile';

const { t, locale } = useI18n();
const router = useRouter();
const tabsStore = useTabsStore();
const themeStore = useThemeStore();
const lintIssuesStore = useLintIssuesStore();

const togglePanel = inject<() => void>('togglePanel', () => {});
const showPanel = inject<Ref<boolean>>('showPanel', ref(true));

// 所有 tab 的 modeler 实例引用（用于保存所有文件时遍历 saveXML）
// 跨 ModelerLayout/DesignerView 兄弟层级，从全局 store 读取
const modelerRefs = computed(() => lintIssuesStore.modelerRefs);

const tabsContainerRef = ref<HTMLElement>();

const tabs = computed(() => tabsStore.tabs);
const activeId = computed(() => tabsStore.activeId);
const isDark = computed(() => themeStore.isDark);
const themeMode = computed(() => themeStore.mode);

/* ---- Tab 宽度自适应 ---- */
const TAB_DEFAULT_WIDTH = 130;
const TAB_MIN_WIDTH = 10;
const ACTIONS_WIDTH = 66; // + 按钮和更多按钮预留宽度

const containerWidth = ref(800);
let resizeObserver: null | ResizeObserver = null;

onMounted(() => {
  const el = document.querySelector('.titlebar-tabs');
  if (el) {
    containerWidth.value = el.getBoundingClientRect().width;
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width;
      }
    });
    resizeObserver.observe(el);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

// tab 数量变化时自动滚动到末尾（让 + 和更多按钮可见）
watch(
  () => tabs.value.length,
  (newLen, oldLen) => {
    if (newLen > (oldLen ?? 0)) {
      nextTick(() => {
        const el = tabsContainerRef.value;
        if (el) {
          el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        }
      });
    }
  },
);

/** 计算 tab 宽度：初始 130px，多了等比缩到 10px，再多了滚动 */
const tabWidth = computed(() => {
  const count = tabs.value.length;
  if (count === 0) return TAB_DEFAULT_WIDTH;
  const available = containerWidth.value - ACTIONS_WIDTH;
  const ideal = available / count;
  return Math.max(TAB_MIN_WIDTH, Math.min(TAB_DEFAULT_WIDTH, ideal));
});

/* ---- 图标 SVG（用于渲染下拉项） ---- */
const BPMN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12.11 2l.086.002c.283.005.563.023.84.05.216.023.387.19.424.405l.273 1.585a.52.52 0 00.38.41 7.816 7.816 0 011.748.711.52.52 0 00.553-.024l1.302-.919a.484.484 0 01.585.015c.537.436 1.028.927 1.465 1.464.137.169.14.408.014.585l-.9 1.274a.52.52 0 00-.019.56c.32.556.575 1.154.753 1.784a.52.52 0 00.408.376l1.522.262a.484.484 0 01.403.425 9.956 9.956 0 01.05 1.29l-.002.071c-.008.239-.024.475-.048.71a.484.484 0 01-.403.424l-1.498.258a.522.522 0 00-.41.381 7.82 7.82 0 01-.75 1.823.52.52 0 00.021.557l.873 1.237a.484.484 0 01-.015.585 10.065 10.065 0 01-1.464 1.465.484.484 0 01-.585.014l-1.244-.878a.52.52 0 00-.55-.016 7.82 7.82 0 01-1.823.75.52.52 0 00-.381.41l-.258 1.497a.485.485 0 01-.425.404 10.06 10.06 0 01-2.07 0 .484.484 0 01-.424-.403l-.265-1.533a.521.521 0 00-.374-.398 7.796 7.796 0 01-.917-.321 7.807 7.807 0 01-.885-.425.52.52 0 00-.55.02l-1.266.893a.485.485 0 01-.585-.015 10.043 10.043 0 01-.77-.694l-.166-.17a10.08 10.08 0 01-.528-.6.484.484 0 01-.015-.585l.876-1.241a.52.52 0 00.02-.56 7.817 7.817 0 01-.758-1.82.52.52 0 00-.41-.378l-1.49-.257a.484.484 0 01-.405-.425 10.061 10.061 0 010-2.07.484.484 0 01.404-.425l1.491-.257a.52.52 0 00.41-.378c.173-.63.426-1.242.758-1.82a.52.52 0 00-.02-.56L4.22 6.284a.484.484 0 01.015-.585c.168-.207.344-.407.528-.6l.166-.17a10.021 10.021 0 01.77-.695.484.484 0 01.585-.014l1.27.896c.162.11.374.114.546.017a7.82 7.82 0 011.793-.73.52.52 0 00.382-.41l.266-1.536a.484.484 0 01.424-.404c.313-.032.627-.05.942-.053h.204zM12 6a6 6 0 100 12 6 6 0 000-12zm-2 3.135a1 1 0 011.64-.768l3.438 2.865a1 1 0 010 1.536l-3.438 2.865a1 1 0 01-1.64-.768z" fill="currentColor"/></svg>';
const DMN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 2.996a2 2 0 00-2 2l-.006 14.012a2 2 0 002 2h14a2 2 0 002-1.999L21 4.997a2 2 0 00-2-2.001H5zM11 11l7.994.008v2.996L11 13.996V11zm0-5.996l7.994.01v3.99L11 8.994v-3.99zm-6 0l4 .01v3.99l-4-.01v-3.99zm3.977 8.992L4.994 14v-2.996L8.977 11v2.996zM4.994 16l3.983-.004V19l-3.983.004V16zM11 19.004v-3.012l7.994.008v3.008L11 19.004z" fill="currentColor"/></svg>';
const SAVE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM6 5h8v4H6V5zm6 14v-5H8v5H6v-7h12v7h-2z" fill="currentColor"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05 7.05 5.636 12 10.586z" fill="currentColor"/></svg>';

/** 渲染带图标的下拉选项 label */
function renderIconLabel(iconSvg: string, text: string, unsaved = false): VNodeChild {
  return h('span', { class: 'dd-label' }, [
    h('span', { class: 'dd-icon', innerHTML: iconSvg }),
    h('span', { class: 'dd-text' }, text),
    unsaved ? h('span', { class: 'dt-mod' }) : null,
  ]);
}

/* ---- 新建模型下拉选项 ---- */
const newOptions = computed<DropdownOption[]>(() => [
  {
    key: 'header',
    type: 'group',
    label: t('tabs.newDiagram'),
    children: [
      { key: 'new-bpmn', label: () => renderIconLabel(BPMN_ICON, t('tabs.newBpmn')) },
      { key: 'new-dmn', label: () => renderIconLabel(DMN_ICON, t('tabs.newDmn')) },
    ],
  },
]);

function handleNewSelect(key: string) {
  if (key === 'new-bpmn') {
    tabsStore.openTab({ type: 'bpmn', title: tabsStore.nextDefaultName('bpmn'), xml: createEmptyBpmn() });
    router.push({ name: 'designer', params: { type: 'bpmn' } });
  } else if (key === 'new-dmn') {
    tabsStore.openTab({ type: 'dmn', title: tabsStore.nextDefaultName('dmn'), xml: createEmptyDmn() });
    router.push({ name: 'designer', params: { type: 'dmn' } });
  }
}

/* ---- Ctrl/Cmd+S 保存当前文件 ----
 * 直接监听 keydown，preventDefault 阻止 WebView 默认行为（如保存网页）。
 * macOS 用 Meta（Cmd），Windows/Linux 用 Ctrl。
 */
function handleSaveShortcut(e: KeyboardEvent) {
  const isSave = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 's' || e.key === 'S');
  if (!isSave) return;
  e.preventDefault();
  handleSaveCurrent();
}

onMounted(() => {
  window.addEventListener('keydown', handleSaveShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSaveShortcut);
});

/* ---- 更多操作下拉选项 ----
 * 第一组（保存所有/关闭所有/关闭其他）用普通 option + render-label
 * 第二组（模型列表）用单个 type:'render' 节点包裹成可滚动容器，
 * 因为 naive-ui 的 type:'group' 渲染为 Fragment，没有外层 DOM，无法设置 max-height。
 */
const moreOptions = computed<DropdownOption[]>(() => {
  const items: DropdownOption[] = [
    {
      key: 'save-current',
      label: encodeMoreLabel(SAVE_ICON, t('tabs.saveCurrent')),
      props: { class: 'more-action-item' },
    },
    {
      key: 'save-all',
      label: encodeMoreLabel(SAVE_ICON, t('tabs.saveAll')),
      props: { class: 'more-action-item' },
    },
    {
      key: 'close-all',
      label: encodeMoreLabel(CLOSE_ICON, t('tabs.closeAll')),
      props: { class: 'more-action-item' },
    },
    {
      key: 'close-others',
      label: encodeMoreLabel(CLOSE_ICON, t('tabs.closeOthers')),
      props: { class: 'more-action-item' },
    },
  ];

  if (tabs.value.length > 0) {
    // 分隔线
    items.push({ key: 'div-models', type: 'divider', props: { class: 'more-action-divider' } });

    // 第二组：标题固定 + 列表可滚动（标题在滚动容器外，不会被滚走）
    items.push({
      key: 'models-group',
      type: 'render',
      render: () =>
        h('div', { class: 'more-model-group' }, [
          h('div', { class: 'more-group-label' }, t('tabs.openModels')),
          h(
            'div',
            { class: 'more-model-list' },
            tabs.value.map((tab) =>
              h('div', {
                key: tab.id,
                class: ['more-model-item', tab.id === activeId.value ? 'dd-item-active' : ''],
                onClick: () => selectTab(tab.id),
              }, [renderIconLabel(tab.type === 'bpmn' ? BPMN_ICON : DMN_ICON, tab.title, !tabsStore.isTabSaved(tab.id))]),
            ),
          ),
        ]),
    });
  }

  return items;
});

/** 把图标+文字+是否未保存编码成字符串（供 renderMoreLabel 解析） */
function encodeMoreLabel(iconSvg: string, text: string, unsaved = false): string {
  return JSON.stringify({ iconSvg, text, unsaved });
}

/** 渲染更多下拉第一组的 label（从编码字符串解析图标+文字） */
function renderMoreLabel(option: DropdownOption): VNodeChild {
  try {
    const { iconSvg, text, unsaved } = JSON.parse(String(option.label ?? '{}'));
    return renderIconLabel(iconSvg, text, unsaved);
  } catch {
    return renderIconLabel('', String(option.label ?? ''));
  }
}

/**
 * 保存单个 tab 到磁盘：
 * 1. 同步最新画布状态到 tab.xml（调 modeler.saveXML）
 * 2. 写盘（首次弹对话框选路径，已有路径直接写）
 * 3. 更新 tab 的 filePath / saved / title
 * 用户取消则跳过。
 */
async function saveOneTab(tab: ModelTab) {
  // 1. 同步最新画布状态到 tab.xml
  const modeler = modelerRefs.value[tab.id];
  if (modeler?.saveXML) {
    try {
      const xml = await modeler.saveXML();
      if (xml) tab.xml = xml;
    } catch (err) {
      console.error(`[saveOneTab] 同步 ${tab.title} 失败:`, err);
    }
  }

  // 2. 保存到磁盘（首次弹对话框选路径，已有路径直接写）
  const result = await saveModelFile(tab);
  if (result.ok && result.filePath) {
    // 记住路径 + 标记已保存
    tabsStore.setFilePath(tab.id, result.filePath);
    tabsStore.markSaved(tab.id);
    // 用实际文件名更新 tab 标题
    const fileName = result.filePath.split(/[\\/]/).pop();
    if (fileName) tabsStore.setTitle(tab.id, fileName);
  }
}

/** 保存所有文件：逐个 tab 写盘 */
async function handleSaveAll() {
  for (const tab of tabs.value) {
    // 用户取消则跳过该文件，继续保存下一个
    await saveOneTab(tab);
  }
}

/** 保存当前激活文件（Ctrl/Cmd+S 快捷键 & 菜单项共用） */
async function handleSaveCurrent() {
  const tab = tabsStore.activeTab;
  if (!tab) return;
  await saveOneTab(tab);
}

function handleMoreSelect(key: string) {
  if (key === 'save-current') {
    handleSaveCurrent();
  } else if (key === 'save-all') {
    handleSaveAll();
  } else if (key === 'close-all') {
    tabsStore.closeAll();
    router.push('/');
  } else if (key === 'close-others') {
    if (activeId.value) {
      tabsStore.closeOthers(activeId.value);
    }
  } else if (key.startsWith('tab-')) {
    const tabId = key.slice(4);
    selectTab(tabId);
  }
}

/* ---- 语言下拉选项 ---- */
const langOptions = computed<DropdownOption[]>(() =>
  supportLanguages.map((lang) => ({
    key: lang.key,
    label: lang.label,
    props: { class: lang.key === locale.value ? 'dd-item-active' : '' },
  })),
);

function handleLangSelect(key: string) {
  setLanguage(key);
}

/* ---- 主题下拉选项 ---- */
const themeIconSvg = (mode: ThemeMode): string => {
  if (mode === 'light') {
    return '<svg viewBox="0 0 48 48" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4"><circle cx="24" cy="24" r="9" fill="currentColor" stroke="none"/><path d="M21 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM21 37.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM42.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM10.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM39.203 34.96a.5.5 0 0 1 0 .707l-3.536 3.536a.5.5 0 0 1-.707 0l-3.535-3.536a.5.5 0 0 1 0-.707l3.535-3.535a.5.5 0 0 1 .707 0l3.536 3.535ZM16.575 12.333a.5.5 0 0 1 0 .707l-3.535 3.535a.5.5 0 0 1-.707 0L8.797 13.04a.5.5 0 0 1 0-.707l3.536-3.536a.5.5 0 0 1 .707 0l3.535 3.536ZM13.04 39.203a.5.5 0 0 1-.707 0l-3.536-3.536a.5.5 0 0 1 0-.707l3.536-3.535a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1 0 .707l-3.536 3.536ZM35.668 16.575a.5.5 0 0 1-.708 0l-3.535-3.535a.5.5 0 0 1 0-.707l3.535-3.536a.5.5 0 0 1 .708 0l3.535 3.536a.5.5 0 0 1 0 .707l-3.535 3.535Z" fill="currentColor" stroke="none"/></svg>';
  }
  if (mode === 'dark') {
    return '<svg viewBox="0 0 48 48" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4"><path d="M42.108 29.769c.124-.387-.258-.736-.645-.613A17.99 17.99 0 0 1 36 30c-9.941 0-18-8.059-18-18 0-1.904.296-3.74.844-5.463.123-.387-.226-.768-.613-.645C10.558 8.334 5 15.518 5 24c0 10.493 8.507 19 19 19 8.482 0 15.666-5.558 18.108-13.231Z" fill="currentColor" stroke="none"/></svg>';
  }
  return '<svg viewBox="0 0 48 48" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><path d="M24 6C14.059 6 6 14.059 6 24s8.059 18 18 18 18-8.059 18-18S33.941 6 24 6Z" stroke="currentColor"/><path d="M24 6v36M6 24h36M24 6c5 5 7.5 11 7.5 18S29 37 24 42" stroke="currentColor" stroke-linecap="round"/></svg>';
};

const themeOptions = computed<DropdownOption[]>(() => [
  { key: 'light', label: () => renderIconLabel(themeIconSvg('light'), t('settings.lightMode')), props: { class: themeMode.value === 'light' ? 'dd-item-active' : '' } },
  { key: 'dark', label: () => renderIconLabel(themeIconSvg('dark'), t('settings.darkMode')), props: { class: themeMode.value === 'dark' ? 'dd-item-active' : '' } },
  { key: 'auto', label: () => renderIconLabel(themeIconSvg('auto'), t('settings.autoMode')), props: { class: themeMode.value === 'auto' ? 'dd-item-active' : '' } },
]);

function handleThemeSelect(key: string) {
  themeStore.setMode(key as ThemeMode);
}

/* ---- 通用方法 ---- */
function selectTab(id: string) {
  tabsStore.setActive(id);
  const tab = tabsStore.tabs.find((t) => t.id === id);
  if (tab) {
    router.push({ name: 'designer', params: { type: tab.type } });
  }
}

function closeTab(id: string, e: Event) {
  e.stopPropagation();
  tabsStore.closeTab(id);
  if (!tabsStore.hasTabs) {
    router.push('/');
  }
}
</script>

<template>
  <div class="titlebar">
    <!-- 左：品牌 -->
    <div class="titlebar-left">
      <div class="brand" @click="router.push('/')">
        <div class="brand-dot">📊</div>
        <span class="brand-name">Process Modeler</span>
      </div>
    </div>

    <!-- 中：标签页（含 + 和更多按钮，跟随 tab 流动） -->
    <div ref="tabsContainerRef" class="titlebar-tabs">
      <template v-if="tabs.length > 0">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="doc-tab"
          :class="{ active: tab.id === activeId }"
          :style="{ width: tabWidth + 'px', flexShrink: 0 }"
          @click="selectTab(tab.id)"
        >
          <span class="dt-icon">
            <svg v-if="tab.type === 'bpmn'" viewBox="0 0 24 24" class="dt-svg"><path d="M12.11 2l.086.002c.283.005.563.023.84.05.216.023.387.19.424.405l.273 1.585a.52.52 0 00.38.41 7.816 7.816 0 011.748.711.52.52 0 00.553-.024l1.302-.919a.484.484 0 01.585.015c.537.436 1.028.927 1.465 1.464.137.169.14.408.014.585l-.9 1.274a.52.52 0 00-.019.56c.32.556.575 1.154.753 1.784a.52.52 0 00.408.376l1.522.262a.484.484 0 01.403.425 9.956 9.956 0 01.05 1.29l-.002.071c-.008.239-.024.475-.048.71a.484.484 0 01-.403.424l-1.498.258a.522.522 0 00-.41.381 7.82 7.82 0 01-.75 1.823.52.52 0 00.021.557l.873 1.237a.484.484 0 01-.015.585 10.065 10.065 0 01-1.464 1.465.484.484 0 01-.585.014l-1.244-.878a.52.52 0 00-.55-.016 7.82 7.82 0 01-1.823.75.52.52 0 00-.381.41l-.258 1.497a.485.485 0 01-.425.404 10.06 10.06 0 01-2.07 0 .484.484 0 01-.424-.403l-.265-1.533a.521.521 0 00-.374-.398 7.796 7.796 0 01-.917-.321 7.807 7.807 0 01-.885-.425.52.52 0 00-.55.02l-1.266.893a.485.485 0 01-.585-.015 10.043 10.043 0 01-.77-.694l-.166-.17a10.08 10.08 0 01-.528-.6.484.484 0 01-.015-.585l.876-1.241a.52.52 0 00.02-.56 7.817 7.817 0 01-.758-1.82.52.52 0 00-.41-.378l-1.49-.257a.484.484 0 01-.405-.425 10.061 10.061 0 010-2.07.484.484 0 01.404-.425l1.491-.257a.52.52 0 00.41-.378c.173-.63.426-1.242.758-1.82a.52.52 0 00-.02-.56L4.22 6.284a.484.484 0 01.015-.585c.168-.207.344-.407.528-.6l.166-.17a10.021 10.021 0 01.77-.695.484.484 0 01.585-.014l1.27.896c.162.11.374.114.546.017a7.82 7.82 0 011.793-.73.52.52 0 00.382-.41l.266-1.536a.484.484 0 01.424-.404c.313-.032.627-.05.942-.053h.204zM12 6a6 6 0 100 12 6 6 0 000-12zm-2 3.135a1 1 0 011.64-.768l3.438 2.865a1 1 0 010 1.536l-3.438 2.865a1 1 0 01-1.64-.768z" fill="currentColor"></path></svg>
            <svg v-else viewBox="0 0 24 24" class="dt-svg"><path d="M5 2.996a2 2 0 00-2 2l-.006 14.012a2 2 0 002 2h14a2 2 0 002-1.999L21 4.997a2 2 0 00-2-2.001H5zM11 11l7.994.008v2.996L11 13.996V11zm0-5.996l7.994.01v3.99L11 8.994v-3.99zm-6 0l4 .01v3.99l-4-.01v-3.99zm3.977 8.992L4.994 14v-2.996L8.977 11v2.996zM4.994 16l3.983-.004V19l-3.983.004V16zM11 19.004v-3.012l7.994.008v3.008L11 19.004z" fill="currentColor"></path></svg>
          </span>
          <span class="dt-name">{{ tab.title }}</span>
          <span v-if="!tabsStore.isTabSaved(tab.id)" class="dt-mod"></span>
          <button class="dt-close" @click="closeTab(tab.id, $event)">✕</button>
        </div>
      </template>

      <!-- 新建标签（跟随 tab 末尾） -->
      <n-dropdown
        trigger="click"
        placement="bottom-start"
        :options="newOptions"
        @select="handleNewSelect"
      >
        <button class="doc-tab-add">＋</button>
      </n-dropdown>

      <!-- 更多操作（跟随 tab 末尾） -->
      <n-dropdown
        trigger="click"
        placement="bottom-start"
        :options="moreOptions"
        :render-label="renderMoreLabel"
        @select="handleMoreSelect"
      >
        <button class="doc-tab-add" :title="t('tabs.more')">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="more-icon">
            <path d="M38 25v-2h2v2h-2ZM23 25v-2h2v2h-2ZM8 25v-2h2v2H8Z" fill="currentColor" stroke="none"></path>
            <path d="M38 25v-2h2v2h-2ZM23 25v-2h2v2h-2ZM8 25v-2h2v2H8Z"></path>
          </svg>
        </button>
      </n-dropdown>
    </div>

    <!-- 右：操作 -->
    <div class="titlebar-right">
      <!-- 语言切换（naive-ui NDropdown） -->
      <n-dropdown
        trigger="hover"
        placement="bottom-end"
        :options="langOptions"
        @select="handleLangSelect"
      >
        <button class="icon-action" :title="t('settings.language')">
          <svg viewBox="0 0 48 48" fill="none" class="theme-icon">
            <path d="M24 6C14.059 6 6 14.059 6 24s8.059 18 18 18 18-8.059 18-18S33.941 6 24 6Z" stroke="currentColor" stroke-width="3"/>
            <path d="M6 24h36M24 6c5 5 7.5 11 7.5 18S29 37 24 42c-5-5-7.5-11-7.5-18S19 11 24 6Z" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </button>
      </n-dropdown>

      <!-- 主题切换（naive-ui NDropdown） -->
      <n-dropdown
        trigger="hover"
        placement="bottom-end"
        :options="themeOptions"
        @select="handleThemeSelect"
      >
        <button class="icon-action" :title="t('settings.switchTheme')" @click="themeStore.toggleTheme()">
          <svg v-if="!isDark" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="theme-icon">
            <circle cx="24" cy="24" r="9" fill="currentColor" stroke="none"></circle>
            <path d="M21 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM21 37.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM42.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM10.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM39.203 34.96a.5.5 0 0 1 0 .707l-3.536 3.536a.5.5 0 0 1-.707 0l-3.535-3.536a.5.5 0 0 1 0-.707l3.535-3.535a.5.5 0 0 1 .707 0l3.536 3.535ZM16.575 12.333a.5.5 0 0 1 0 .707l-3.535 3.535a.5.5 0 0 1-.707 0L8.797 13.04a.5.5 0 0 1 0-.707l3.536-3.536a.5.5 0 0 1 .707 0l3.535 3.536ZM13.04 39.203a.5.5 0 0 1-.707 0l-3.536-3.536a.5.5 0 0 1 0-.707l3.536-3.535a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1 0 .707l-3.536 3.536ZM35.668 16.575a.5.5 0 0 1-.708 0l-3.535-3.535a.5.5 0 0 1 0-.707l3.535-3.536a.5.5 0 0 1 .708 0l3.535 3.536a.5.5 0 0 1 0 .707l-3.535 3.535Z" fill="currentColor" stroke="none"></path>
          </svg>
          <svg v-else viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter" class="theme-icon">
            <path d="M42.108 29.769c.124-.387-.258-.736-.645-.613A17.99 17.99 0 0 1 36 30c-9.941 0-18-8.059-18-18 0-1.904.296-3.74.844-5.463.123-.387-.226-.768-.613-.645C10.558 8.334 5 15.518 5 24c0 10.493 8.507 19 19 19 8.482 0 15.666-5.558 18.108-13.231Z" fill="currentColor" stroke="none"></path>
          </svg>
        </button>
      </n-dropdown>

      <button
        class="icon-action"
        :class="{ active: showPanel }"
        :title="t('panel.propertiesToggle')"
        @click="togglePanel()"
        v-if="tabs.length > 0"
      >
        <!-- 展开态：右箭头圆圈（点击往右收起/折叠） / 折叠态：左箭头圆圈（点击往左拉出/展开） -->
        <svg
          v-if="showPanel"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="butt"
          stroke-linejoin="miter"
          class="action-svg"
        >
          <circle cx="24" cy="24" r="18"></circle>
          <path d="M19.485 15.515 27.971 24l-8.486 8.485"></path>
        </svg>
        <svg
          v-else
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="butt"
          stroke-linejoin="miter"
          class="action-svg"
        >
          <circle cx="24" cy="24" r="18"></circle>
          <path d="M28.485 32.485 20 24l8.485-8.485"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  height: 31px;
  display: flex;
  align-items: stretch;
  background: var(--naive-card-color);
  border-bottom: 1px solid var(--naive-border-color);
  flex-shrink: 0;
  user-select: none;
}

.titlebar-left {
  display: flex;
  align-items: center;
  padding: 0 10px;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.brand-dot {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4080FF, #165DFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.25);
}

.brand-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

.titlebar-tabs {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--naive-border-color) transparent;
  min-width: 0;
}

.titlebar-tabs::-webkit-scrollbar {
  height: 3px;
}

.titlebar-tabs::-webkit-scrollbar-thumb {
  background: var(--naive-border-color);
  border-radius: 2px;
}

.doc-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 8px;
  border-radius: 0;
  font-size: 12px;
  color: var(--naive-text-color-3);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  border: none;
  border-right: 1px solid var(--naive-border-color);
  box-sizing: border-box;
  position: relative;
}

.doc-tab:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--naive-text-color);
}

.doc-tab.active {
  background: rgba(0, 0, 0, 0.09);
  color: var(--naive-text-color);
  font-weight: 500;
}

.dark .doc-tab:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dark .doc-tab.active {
  background: rgba(255, 255, 255, 0.1);
}

.dt-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.dt-svg {
  width: 14px;
  height: 14px;
}

.dt-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dt-mod {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}

.dt-close {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: inherit;
  opacity: 0.4;
  flex-shrink: 0;
  transition: all 0.15s;
  background: none;
  border: none;
  cursor: pointer;
}

.dt-close:hover {
  background: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.doc-tab-add {
  width: 32px;
  height: 100%;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--naive-text-color-3);
  cursor: pointer;
  transition: all 0.15s;
  background: none;
  border: none;
}

.doc-tab-add:hover {
  background: var(--naive-hover-color);
  color: #165DFF;
}

.more-icon {
  width: 18px;
  height: 18px;
}

.titlebar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  margin-left: auto;
  flex-shrink: 0;
}

/* 右侧操作按钮 */
.icon-action {
  width: 30px;
  height: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: var(--naive-text-color-3);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  background: none;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
}

.theme-icon {
  width: 16px;
  height: 16px;
}

.action-svg {
  width: 16px;
  height: 16px;
}

.icon-action:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--naive-text-color);
}

.icon-action:active {
  background: rgba(0, 0, 0, 0.09);
  color: var(--naive-text-color);
}

/* 属性面板按钮激活态（面板展开时） */
.icon-action.active {
  background: rgba(0, 0, 0, 0.09);
  color: var(--naive-text-color);
}

.dark .icon-action:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dark .icon-action:active,
.dark .icon-action.active {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style>
/* 下拉菜单项样式（非 scoped，因为 NDropdown 渲染到 body） */
.dd-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dd-label .dd-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--n-color-target, currentColor);
}

.dd-label .dd-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-label .dt-mod {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}

/* 活跃项高亮（蓝色） */
.n-dropdown-option .dd-item-active {
  color: #3b82f6;
  font-weight: 600;
}

.dark .n-dropdown-option .dd-item-active {
  color: #60a5fa;
}

/* 更多下拉：第一组（操作项）与分隔线样式 */
.more-action-item {
  cursor: pointer;
}

.more-action-divider {
  margin: 4px 0;
}

/* 更多下拉：第二组（标题固定 + 列表滚动），整组最大 30vh */
.more-model-group {
  max-height: 30vh;
  display: flex;
  flex-direction: column;
}

.more-model-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.more-model-list::-webkit-scrollbar {
  width: 4px;
}

.more-model-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

.more-group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--n-label-text-color, #999);
  padding: 6px 12px 4px;
}

.more-model-item {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--n-option-height, 34px);
  padding: 0 12px;
  cursor: pointer;
  color: var(--n-option-text-color);
  transition: color 0.3s var(--n-bezier);
}

/* hover 背景用 ::before，左右各留 4px、圆角，与 naive-ui 原生选项一致 */
.more-model-item::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 4px;
  right: 4px;
  border-radius: var(--n-border-radius, 3px);
  transition: background-color 0.3s var(--n-bezier);
  z-index: 0;
}

.more-model-item > * {
  position: relative;
  z-index: 1;
}

.more-model-item:hover::before {
  background-color: var(--n-option-color-hover, rgba(0, 0, 0, 0.05));
}

.more-model-item:hover {
  color: var(--n-option-text-color-hover);
}

.more-model-item.dd-item-active {
  color: #3b82f6;
  font-weight: 600;
}

.dark .more-model-item.dd-item-active {
  color: #60a5fa;
}
</style>
