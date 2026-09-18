import { defineConfig } from 'vitest/config';

// src and test aliases mirror the webpack resolve configuration that was
// previously provided by karma-webpack (cf. karma.config.js).
export default defineConfig({
  resolve: {
    alias: {
      src: '/src/index.js',
      test: '/test',
      // bpmn-js/test/helper imports mocha-test-container-support; provide a
      // minimal shim so it resolves under vitest without pulling in mocha.
      'mocha-test-container-support': '/test/testContainer.js'
    }
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
