<script setup lang="ts">
/**
 * 主题变量桥接器
 *
 * 必须作为 n-config-provider 的直接子组件渲染。
 *
 * 原因：Vue 的 inject 只能拿到父级 provide 的值，
 * 组件自身的 provide（在 setup 中执行）对自己不可见。
 * 而 n-config-provider 在自己的 setup 中 provide(configProviderInjectionKey, ...)，
 * 所以 useThemeVars() 必须在它的子组件中调用，否则拿不到 theme 配置。
 *
 * 此组件负责把 naive-ui 的 common 主题变量同步到 :root 上，
 * 供非 naive-ui 组件（标题栏、状态栏、画布工具栏等）通过
 * var(--naive-body-color) 等方式复用，做到主题统一。
 */
import { watch } from 'vue';
import { useThemeVars } from 'naive-ui';

const themeVars = useThemeVars();

watch(
  themeVars,
  (vars) => {
    const root = document.documentElement;
    root.style.setProperty('--naive-body-color', vars.bodyColor);
    root.style.setProperty('--naive-text-color', vars.textColor1);
    root.style.setProperty('--naive-text-color-2', vars.textColor2);
    root.style.setProperty('--naive-text-color-3', vars.textColor3);
    root.style.setProperty('--naive-card-color', vars.cardColor);
    root.style.setProperty('--naive-border-color', vars.borderColor);
    root.style.setProperty('--naive-popover-color', vars.popoverColor);
    root.style.setProperty('--naive-modal-color', vars.modalColor);
    root.style.setProperty('--naive-input-color', vars.inputColor);
    root.style.setProperty('--naive-table-color', vars.tableColor);
    root.style.setProperty('--naive-hover-color', vars.hoverColor);
    root.style.setProperty('--naive-action-color', vars.actionColor);
    root.style.setProperty('--naive-divider-color', vars.dividerColor);
    root.style.setProperty('--naive-tab-color', vars.tabColor);
    root.style.setProperty('--naive-icon-color', vars.iconColor);
    root.style.setProperty('--naive-icon-color-hover', vars.iconColorHover);
    root.style.setProperty('--naive-pressed-color', vars.pressedColor);
    // 主色（品牌蓝）同步到 :root，供非 naive-ui 组件复用
    root.style.setProperty('--naive-primary-color', vars.primaryColor);
    root.style.setProperty('--naive-primary-color-hover', vars.primaryColorHover);
    root.style.setProperty('--naive-primary-color-pressed', vars.primaryColorPressed);
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <!-- 仅做主题变量同步，不渲染任何 DOM -->
</template>
