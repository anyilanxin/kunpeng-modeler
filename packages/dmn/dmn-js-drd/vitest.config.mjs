import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      test: path.resolve(__dirname, 'test')
    }
  },
  define: {
    'window.__env__': '{}'
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*Spec.js'],
    setupFiles: ['./test/globals.js'],
    assetsInclude: ['**/*.dmn', '**/*.css']
  }
});
