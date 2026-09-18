import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {

    // bpmn-js / diagram-js ship extension-less ESM imports (e.g.
    // `../../util/LabelUtil`); ensure Vite falls back to `.js`.
    extensions: [ '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json' ],
    alias: [

      // `import ... from 'lib/'` resolves to the package entry (lib/index.js),
      // while `import ... from 'lib/Foo'` resolves to lib/Foo.js.
      { find: /^lib\/$/, replacement: path.resolve(__dirname, 'lib/index.js') },
      { find: /^lib\/(.+)$/, replacement: path.resolve(__dirname, 'lib/$1.js') },
      { find: 'test', replacement: path.resolve(__dirname, 'test') },

      // bpmn-js/test/helper imports mocha-test-container-support; provide a
      // minimal shim so it resolves under vitest without pulling in mocha.
      { find: 'mocha-test-container-support', replacement: path.resolve(__dirname, 'test/testContainer.js') },
    ],
  },

  // .bpmn/.json fixtures are imported as raw strings by the test specs; CSS is
  // imported via insertCSS and is cosmetic under happy-dom.
  assetsInclude: [ '**/*.css', '**/*.bpmn', '**/*.svg' ],
  define: {
    'process.env': '{}',
    'window.__env__': '{}',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [ 'test/**/*{Spec,spec}.js' ],
    // Example.spec.js is an integration smoke test that depends on
    // bpmn-js-properties-panel / bpmn-js-element-templates, which would create
    // circular workspace dependencies. Exclude it from the default test run.
    exclude: [ '**/node_modules/**', '**/dist/**', 'test/spec/Example.spec.js' ],
    setupFiles: [ './test/globals.js' ],
  },
});
