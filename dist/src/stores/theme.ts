import { watch, ref, computed } from 'vue';

import { defineStore } from 'pinia';

const STORAGE_KEY = 'kunpeng-theme-mode';

export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 从 localStorage 读取上次保存的主题偏好，
 * 如果没有记录则默认跟随系统（auto）。
 */
function loadStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return 'auto';
}

/** 当前系统是否偏好暗色 */
function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(loadStoredMode());

  // 系统偏好的实时反映（auto 模式下跟随它）
  const systemDark = ref(systemPrefersDark());

  // 监听系统主题变化（仅在 auto 模式下生效）
  let mediaQuery: MediaQueryList | null = null;
  function setupMediaListener() {
    if (mediaQuery) return;
    mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    if (mediaQuery) {
      mediaQuery.addEventListener('change', (e) => {
        systemDark.value = e.matches;
      });
    }
  }
  setupMediaListener();

  /** 实际是否暗色（auto 模式下跟随系统） */
  const isDark = computed(() => {
    if (mode.value === 'auto') return systemDark.value;
    return mode.value === 'dark';
  });

  function applyTheme(dark: boolean) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    syncWindowTheme(dark);
  }

  /**
   * 同步 Tauri 原生窗口标题栏主题
   * - macOS：用自定义 `set_titlebar_dark` 命令直接设 NSWindow appearance。
   *   （tauri 的 setTheme 设的是 NSApplication appearance，会覆盖窗口级，
   *    且对默认原生标题栏不一定生效）
   * - 其他平台：继续用 win.setTheme
   * 首次调用时 IPC 可能未就绪，加 retry 确保生效。
   */
  async function syncWindowTheme(dark: boolean, retries = 5) {
    const isMac = navigator.userAgent.includes('Mac');
    for (let i = 0; i <= retries; i++) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        if (isMac) {
          // macOS 只走原生 NSWindow appearance
          await invoke('set_titlebar_dark', { dark });
        } else {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          const win = getCurrentWindow();
          await win.setTheme(dark ? 'dark' : 'light');
        }
        return;
      } catch {
        // IPC 未就绪或浏览器模式，重试
        if (i < retries) {
          await new Promise((r) => setTimeout(r, 300 * (i + 1)));
        }
      }
    }
  }

  /** 设置主题模式 */
  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // 忽略写入失败
    }
  }

  /**
   * 直接点击图标时的快捷切换：
   * 在 light / dark 之间来回切（auto 视当前实际效果决定）
   */
  function toggleTheme() {
    setMode(isDark.value ? 'light' : 'dark');
  }

  // 同步 <html> class（UnoCSS dark: 前缀依赖）+ Tauri 窗口主题
  watch(
    isDark,
    (dark) => {
      applyTheme(dark);
    },
    { immediate: true },
  );

  return { mode, isDark, systemDark, toggleTheme, setMode };
});
