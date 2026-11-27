/*
 * Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createI18n, useI18n } from 'vue-i18n';

import en from './en';
import zhCN from './zh-CN';
import zhTW from './zh-TW';

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: import.meta.env.VITE_DEFAULT_LOCALE || 'zh-CN', // 默认语言
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    en,
  },
});

export default i18n;

export const supportLanguages = [
  { label: '简体中文', key: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW' },
  { label: 'English', key: 'en' },
];

export function setLanguage(locale: string) {
  if (i18n.mode === 'legacy') {
    (i18n.global.locale as any).value = locale;
  } else {
    (i18n.global.locale as any).value = locale;
  }
}

export function getLanguage() {
  return i18n.global.locale;
}

/**
 * 封装的 t 方法，用于 setup 中
 */
export const t = (key: string) => {
  return i18n.global.t(key);
};

/**
 * Hook 形式，如果需要响应式能力推荐使用这个
 */
export const useAppI18n = () => {
  return useI18n();
};
