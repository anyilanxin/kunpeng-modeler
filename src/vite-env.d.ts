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
