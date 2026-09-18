import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*.spec.js'],
    setupFiles: ['test/globals.js'],
  },
});
