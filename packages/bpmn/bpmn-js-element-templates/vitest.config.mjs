import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the preact shim shipped via @kunpeng/properties-panel so that the
// react/preact aliases point at real files on disk.
const preactRoot = path.resolve(__dirname, 'node_modules/@kunpeng/properties-panel/preact');

export default defineConfig({
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src/index.js'),
      'test': path.resolve(__dirname, 'test'),
      // bpmn-js/test/helper imports mocha-test-container-support; provide a
      // minimal shim so it resolves under vitest without pulling in mocha.
      'mocha-test-container-support': path.resolve(__dirname, 'test/testContainer.js'),
      'react': path.resolve(preactRoot, 'compat'),
      'react-dom': path.resolve(preactRoot, 'compat'),
      'preact': preactRoot
    }
  },
  esbuild: {
    loader: 'jsx',
    include: [ /src\/.*\.js$/, /test\/.*\.js$/ ],
    jsxImportSource: '@kunpeng/properties-panel/preact',
    jsx: 'automatic'
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } }
  },
  // .bpmn/.json fixtures are imported as raw strings by the test specs; CSS is
  // imported via insertCSS and is cosmetic under happy-dom.
  assetsInclude: [ '**/*.css', '**/*.bpmn', '**/*.svg' ],
  define: {
    'process.env': '{}',
    'window.__env__': '{}'
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [ 'test/**/*{Spec,spec}.js' ],
    setupFiles: [ './test/globals.js' ]
  }
});
