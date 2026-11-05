import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// 注：旧 @kunpeng-js 线 workspace 直连时代的 dist 补丁插件
// （lang-expression / dmn overview-renderer 变量名冲突重命名）已移除——
// @kunpeng-io 线包 dist 自包含，不再出现该类冲突。

// eslint-disable-next-line n/prefer-global/process
const HOST = process.env.TAURI_DEV_HOST;
// 应用版本唯一来源：package.json 的 version 字段，编译期注入为 __APP_VERSION__
const APP_VERSION = (
  JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as {
    version: string;
  }
).version;
// https://vitejs.dev/config/
export default defineConfig(
  async () =>
    ({
      define: {
        __APP_VERSION__: JSON.stringify(APP_VERSION),
      },
      plugins: [
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
        },
        dedupe: ['vue'],
      },
      // @kunpeng-io/linting 的 kunpeng-compat 规则在包构建期已 rollup commonjs
      // 互操作打进 dist（消费端零解析链），无需 optimizeDeps 特判；旧 workspace
      // 时代的 lang-expression/overview-renderer 补丁与未具名面板别名已随
      // @kunpeng-io dist 自包含一并移除。
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
