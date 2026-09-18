import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nonbundledDependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies,
});

// Collect src/**/*.js as individual entries so preserveModules outputs a
// 1:1 mirror of src/ in lib/. This is required because consumers deep-import
// paths like @kunpeng/dmn-js-drd/lib/Modeler.
const entries = Object.fromEntries(
  glob
    .sync('src/**/*.js')
    .map((file) => [
      path.relative('src', file.slice(0, -3)),
      path.resolve(__dirname, file),
    ]),
);

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'lib',
    sourcemap: true,
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) =>
        nonbundledDependencies.some((d) => id === d || id.startsWith(`${d}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
