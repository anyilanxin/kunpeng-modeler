import { readFileSync } from 'node:fs';

import { defineConfig } from 'vitest/config';

// 将 CSS 文件作为 raw 字符串导入（测试中的 insertCSS 需要拿到 CSS 文本，
// 原 webpack 配置用 type: 'asset/source' 实现同等效果）。
function rawCssPlugin() {
  return {
    name: 'raw-css',
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('.css')) {
        return id;
      }
      return null;
    },
    load(id) {
      if (id.endsWith('.css')) {
        const code = readFileSync(id, 'utf-8');
        return `export default ${JSON.stringify(code)};`;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [rawCssPlugin()],
  resolve: {
    // bpmn-js/test/helper imports mocha-test-container-support; provide a
    // minimal shim so it resolves under vitest without pulling in mocha.
    alias: {
      'mocha-test-container-support': '/test/testContainer.js'
    },
    // 复刻 karma webpack 的 mainFields，让 dev:module 优先解析
    mainFields: [
      'dev:module',
      'browser',
      'module',
      'main'
    ]
  },
  // .bpmn files are imported as raw XML strings by the test specs.
  assetsInclude: ['**/*.bpmn'],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*{Spec,spec}.js'],
    setupFiles: ['./test/expect.js']
  }
});
