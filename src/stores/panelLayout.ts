import { ref } from 'vue';

import { defineStore } from 'pinia';

const STORAGE_KEY = 'kunpeng-panel-width';
const PROBLEMS_HEIGHT_KEY = 'kunpeng-problems-height';

/** 属性面板默认宽度 */
export const DEFAULT_PANEL_WIDTH = 340;

/** 允许的最大宽度上限（绝对值，实际还要与屏幕 70% 取小者） */
const MAX_PANEL_WIDTH = 2000;

/** Problems 面板默认高度 */
export const DEFAULT_PROBLEMS_HEIGHT = 220;
/** Problems 面板最小高度（低于此值触发折叠） */
export const MIN_PROBLEMS_HEIGHT = 30;
/** Problems 面板最大高度（不超过视口 70%） */
const MAX_PROBLEMS_HEIGHT = 800;
/**
 * 折叠阈值 = 内容标题栏（34px）的三倍。
 * 拖拽低于此高度自动折叠；从折叠态首次展开恢复到此高度。
 */
export const PROBLEMS_COLLAPSE_THRESHOLD = 102;
/** 折叠态：仅保留拖拽手柄条的高度 */
export const PROBLEMS_COLLAPSED_HEIGHT = 3;

/**
 * 从 localStorage 读取上次保存的属性面板宽度，
 * 校验失败则返回默认宽度。
 */
function loadStoredWidth(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const w = Number.parseInt(stored, 10);
      if (Number.isFinite(w) && w >= DEFAULT_PANEL_WIDTH && w <= MAX_PANEL_WIDTH) {
        return w;
      }
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return DEFAULT_PANEL_WIDTH;
}

/**
 * 从 localStorage 读取上次保存的 Problems 面板高度，
 * 校验失败则返回默认高度。
 */
function loadStoredProblemsHeight(): number {
  try {
    const stored = localStorage.getItem(PROBLEMS_HEIGHT_KEY);
    if (stored !== null) {
      const h = Number.parseInt(stored, 10);
      if (Number.isFinite(h) && h >= MIN_PROBLEMS_HEIGHT && h <= MAX_PROBLEMS_HEIGHT) {
        return h;
      }
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return DEFAULT_PROBLEMS_HEIGHT;
}

export const usePanelLayoutStore = defineStore('panelLayout', () => {
  const panelWidth = ref<number>(loadStoredWidth());

  function setPanelWidth(w: number) {
    const clamped = Math.max(
      DEFAULT_PANEL_WIDTH,
      Math.min(w, Math.min(MAX_PANEL_WIDTH, window.innerWidth * 0.7)),
    );
    panelWidth.value = clamped;
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  }

  // ===== Problems 面板高度 =====
  const problemsHeight = ref<number>(loadStoredProblemsHeight());

  function setProblemsHeight(h: number) {
    const clamped = Math.max(
      MIN_PROBLEMS_HEIGHT,
      Math.min(h, Math.min(MAX_PROBLEMS_HEIGHT, window.innerHeight * 0.4)),
    );
    problemsHeight.value = clamped;
    try {
      localStorage.setItem(PROBLEMS_HEIGHT_KEY, String(clamped));
    } catch {
      // ignore
    }
  }

  // ===== Problems 面板折叠态（不卸载组件，仅塌缩为手柄条） =====
  const problemsCollapsed = ref<boolean>(false);

  function setProblemsCollapsed(val: boolean) {
    problemsCollapsed.value = val;
  }

  /** 恢复默认宽度并持久化 */
  function resetPanelWidth() {
    panelWidth.value = DEFAULT_PANEL_WIDTH;
    try {
      localStorage.setItem(STORAGE_KEY, String(DEFAULT_PANEL_WIDTH));
    } catch {
      // ignore
    }
  }

  return {
    panelWidth,
    setPanelWidth,
    resetPanelWidth,
    problemsHeight,
    setProblemsHeight,
    problemsCollapsed,
    setProblemsCollapsed,
  };
});
