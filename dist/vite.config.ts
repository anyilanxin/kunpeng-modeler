import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// Rolldown 在解析部分 minified 的 @kunpeng 包 dist 文件时存在变量名冲突
// （如 lang-expression/dist/index.js 中既有 import 的 h 又有本地 var h）。
// 这里在 load 阶段将冲突的本地标识符重命名以绕过该问题。
const LANG_EXP_SUFFIX = 'packages/bpm/lang-expression/dist/index.js';
const OVERVIEW_RENDERER_SUFFIX =
  'packages/dmn/dmn-js/lib/overview/overview-renderer/OverviewRenderer.js';
const patchCache = new Map<string, string>();
function patchLangExpression(id: string, source: string): string {
  const cached = patchCache.get(id);
  if (cached) return cached;
  // Rolldown 在解析 minified dist 时，本地变量 h（dontCompleteExpression 数组）
  // 与 import 的 h（@codemirror/language 的 highlight）冲突。
  // 需要把本地 h 的定义、所有引用、以及 export 全部统一重命名为 h$kp。
  const patched = source
    .replace('], h = [', '], h$kp = [')
    .replace('exclude: h', 'exclude: h$kp')
    .replace('h as dontCompleteExpression', 'h$kp as dontCompleteExpression');
  patchCache.set(id, patched);
  return patched;
}

function patchOverviewRenderer(id: string, source: string): string {
  const cached = patchCache.get(id);
  if (cached) return cached;
  // OverviewRenderer.js 中局部变量 h（颜色 "#666"）与 Rolldown 注入的
  // preact h 冲突，把所有 h 标识符统一重命名为 h$ov。
  const patched = source.replace(/\bh\b/g, 'h$ov');
  patchCache.set(id, patched);
  return patched;
}

// bpmnlint-plugin-kunpeng-compat 是 CJS 源码包，其规则文件被
// @kunpeng/linting/compiled-config.js 以 ESM import 加载。Vite 对 /@fs/ 下
// 纯 CJS 文件（只有 require、无 import）直接透传，浏览器原生 ESM 无法识别
// module.exports / require。这里在 transform 阶段检测纯 CJS 规则文件并
// 追加 ESM re-export，让 Vite 把它当混合模块处理，触发 CJS interop。
const KUNPENG_COMPAT_PREFIX =
  'packages/bpmn/bpmnlint-plugin-kunpeng-compat/';
function isKunpengCompatSource(id: string): boolean {
  return id.includes(KUNPENG_COMPAT_PREFIX) && id.endsWith('.js');
}

function kunpengPatchPlugin() {
  return {
    name: 'kunpeng-lang-expression-patch',
    enforce: 'pre' as const,
    load(id: string) {
      if (id.endsWith(LANG_EXP_SUFFIX)) {
        try {
          return patchLangExpression(id, readFileSync(id, 'utf-8'));
        } catch {
          return null;
        }
      }
      if (id.endsWith(OVERVIEW_RENDERER_SUFFIX)) {
        try {
          return patchOverviewRenderer(id, readFileSync(id, 'utf-8'));
        } catch {
          return null;
        }
      }
      return null;
    },
  };
}

// eslint-disable-next-line n/prefer-global/process
const HOST = process.env.TAURI_DEV_HOST;
// https://vitejs.dev/config/
export default defineConfig(
  async () =>
    ({
      plugins: [
        kunpengPatchPlugin(),
        vue(),
        UnoCSS(),
        AutoImport({
          imports: [
            'vue',
            {
              'naive-ui': [
                'useDialog',
                'useMessage',
                'useNotification',
                'useLoadingBar',
              ],
            },
          ],
        }),
        Components({
          resolvers: [NaiveUiResolver()],
        }),
      ],
      resolve: {
        alias: {
          // eslint-disable-next-line unicorn/prefer-module
          '@': resolve(__dirname, 'src'),
          // Map unscoped bpmn-io package names used in @kunpeng dist files
          // to their actual scoped package names (Rolldown requires explicit resolution).
          'bpmn-js-properties-panel': '@kunpeng/bpmn-js-properties-panel',
        },
        dedupe: ['vue'],
      },
      optimizeDeps: {
        // @kunpeng/bpmnlint-plugin-kunpeng-compat 是 CJS 源码包，其规则文件
        // 被 @kunpeng/linting/compiled-config.js 以 ESM import 加载。esbuild
        // 预打包会把 CJS require/module.exports 转成 ESM export。
        include: [
          '@kunpeng/linting',
          '@kunpeng/bpmnlint-plugin-kunpeng-compat',
        ],
        // 排除 @kunpeng workspace 包，避免 dev 模式预打包时卡死
        // 这些包通过 kunpengPatchPlugin 按需处理即可
        exclude: [
          '@kunpeng/bpmn-js-behaviors',
          '@kunpeng/bpmn-js-properties-panel',
          '@kunpeng/bpmn-moddle',
          '@kunpeng/dmn-js',
          '@kunpeng/dmn-js-properties-panel',
          '@kunpeng/dmn-moddle',
          '@kunpeng/properties-panel',
          'bpmn-js',
          'bpmn-js-bpmnlint',
          'bpmn-js-create-append-anything',
          'diagram-js',
          'diagram-js-grid',
          'diagram-js-minimap',
        ],
      },
      clearScreen: false,
      server: {
        port: 1420,
        strictPort: true,
        host: HOST || false,
        hmr: HOST
          ? {
              protocol: 'ws',
              HOST,
              port: 1421,
            }
          : undefined,
        watch: {
          ignored: ['**/src-tauri/**'],
        },
      },
    }) as any,
);
