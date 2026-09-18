// / <reference types="vite/client" />

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
declare module '@bpmn-io/add-exporter';
declare module 'bpmn-js-color-picker/colors';
declare module 'bpmn-js-create-append-anything';
declare module 'diagram-js-grid';
declare module 'diagram-js-minimap';
declare module 'dmn-js-dmnlint';

// ===== @kunpeng/linting 校验模块 =====
declare module '@kunpeng/linting';
declare module '@kunpeng/linting/modeler';

// ===== 本地 JS 工具模块 =====
declare module '@/utils/dmnlint-config';
