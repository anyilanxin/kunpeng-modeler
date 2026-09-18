import { defineConfig } from 'vitest/config';

// Register chai + custom matchers as global test setup
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.js'],
    setupFiles: ['./test/expect.js']
  }
});
