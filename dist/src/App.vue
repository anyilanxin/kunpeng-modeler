<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CssVarsBridge from '@/components/CssVarsBridge.vue';
import ModelerLayout from '@/layouts/ModelerLayout.vue';
import { useThemeStore } from '@/stores/theme';
import { darkTheme, dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';

const themeStore = useThemeStore();
const { locale } = useI18n();

const theme = computed(() => (themeStore.isDark ? darkTheme : null));
const naiveLocale = computed(() => (locale.value === 'zh-CN' ? zhCN : enUS));
const naiveDateLocale = computed(() =>
  locale.value === 'zh-CN' ? dateZhCN : dateEnUS,
);

/**
 * 全局主题色覆盖：品牌蓝 #165DFF（与 monorepo 其他包 themeColor 一致）
 * 让 naive-ui 所有组件主色（按钮/开关/选中态/链接等）统一为蓝
 */
const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#165DFF',
    primaryColorHover: '#4080FF',
    primaryColorPressed: '#0E42D2',
    primaryColorSuppl: '#165DFF',
  },
}));
</script>

<template>
  <n-config-provider
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :theme="theme"
    :theme-overrides="themeOverrides"
  >
    <!-- 将 naive-ui 主题 CSS 变量同步到 :root，供非 naive-ui 组件复用 -->
    <CssVarsBridge />
    <n-global-style />
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <ModelerLayout />
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
