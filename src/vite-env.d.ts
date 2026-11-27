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

// / <reference types="vite/client" />

// 编译期由 vite.config.ts 的 define 注入，取自 package.json 的 version 字段
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_DEFAULT_LOCALE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, any>;
  export default component;
}

// ===== 第三方包类型声明（JS 包无 .d.ts） =====
// @kunpeng-io 内核（bpmn-js/dmn-js）与 linting/behaviors 自带类型声明；
// 两个属性面板家族包无 d.ts，按运行时契约声明
declare module '@kunpeng-io/bpmn-js-properties-panel';
declare module '@kunpeng-io/dmn-js-properties-panel';
declare module 'bpmn-js-color-picker/colors';
declare module 'diagram-js-grid';
declare module 'diagram-js-minimap';
