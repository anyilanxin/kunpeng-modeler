import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'window.__env__': '{}'
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [ 'test/**/*.spec.js' ]
  }
});
