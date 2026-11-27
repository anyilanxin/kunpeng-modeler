<!--
  Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CssVarsBridge from '@/components/CssVarsBridge.vue';
import ModelerLayout from '@/layouts/ModelerLayout.vue';
import { useThemeStore } from '@/stores/theme';
import { darkTheme, dateEnUS, dateZhCN, dateZhTW, enUS, zhCN, zhTW } from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';

const themeStore = useThemeStore();
const { locale } = useI18n();

const theme = computed(() => (themeStore.isDark ? darkTheme : null));
const naiveLocale = computed(() =>
  locale.value === 'zh-CN' ? zhCN : locale.value === 'zh-TW' ? zhTW : enUS,
);
const naiveDateLocale = computed(() =>
  locale.value === 'zh-CN' ? dateZhCN : locale.value === 'zh-TW' ? dateZhTW : dateEnUS,
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
