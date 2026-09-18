import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    loader: 'ts',
    include: [ /src\/.*\.ts$/, /test\/.*\.ts$/ ],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.ts': 'ts' } },
  },
  test: {
    environment: 'node',
    globals: true,
    include: [ 'test/**/*.spec.{ts,js}' ],
  },
});
