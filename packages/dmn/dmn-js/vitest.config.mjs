import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(root, 'src'),
      test: path.resolve(root, 'test')
    }
  },
  // .dmn and .css fixtures are imported via require() as raw text by the
  // test specs (cf. insertCSS + diagram loading).
  assetsInclude: ['**/*.dmn', '**/*.css'],
  define: {
    'window.__env__': '{}'
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*Spec.js'],
    setupFiles: ['./test/globals.js']
  }
});
