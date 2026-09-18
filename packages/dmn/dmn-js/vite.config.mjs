import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const nonbundledDependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies,
});

// Collect src/**/*.js as individual entries so preserveModules outputs a
// 1:1 mirror of src/ in lib/. This is required because consumers deep-import
// paths like @kunpeng/dmn-js/lib/Modeler.
const entries = Object.fromEntries(
  glob
    .sync('src/**/*.js')
    .map((file) => [
      path.relative('src', file.slice(0, -3)),
      path.resolve(__dirname, file),
    ]),
);

/**
 * Vite plugin: copy CSS/font assets from dmn-js sub-packages and dependencies
 * into dist/assets/ so consumers can import them via @kunpeng/dmn-js/dist/assets.
 * Replaces the former scripts/copy-assets.mjs post-build step.
 */
function copyAssetsPlugin() {
  return {
    name: 'copy-dmn-assets',
    async closeBundle() {
      const fsp = await import('node:fs/promises');

      function resolvePkg(module, sub) {
        const pkgPath = require.resolve(`${module}/package.json`);
        return path.dirname(pkgPath) + sub;
      }

      async function copyDir(srcDir, destDir) {
        await fsp.mkdir(destDir, { recursive: true });
        try {
          const entries = await fsp.readdir(srcDir);
          for (const entry of entries) {
            const src = path.join(srcDir, entry);
            const stat = await fsp.stat(src);
            if (stat.isFile()) {
              await fsp.copyFile(src, path.join(destDir, entry));
            }
          }
        } catch {
          /* skip missing dirs */
        }
      }

      const dest = 'dist/assets';

      // dmn-font CSS + fonts
      await copyDir(
        resolvePkg('dmn-font', '/dist/css'),
        path.join(dest, 'dmn-font/css'),
      );
      await copyDir(
        resolvePkg('dmn-font', '/dist/font'),
        path.join(dest, 'dmn-font/font'),
      );

      // diagram-js CSS
      await copyDir(resolvePkg('diagram-js', '/assets'), dest);

      // dmn-js sub-package CSS
      for (const sub of [
        '@kunpeng/dmn-js-shared',
        '@kunpeng/dmn-js-drd',
        '@kunpeng/dmn-js-decision-table',
        '@kunpeng/dmn-js-literal-expression',
        '@kunpeng/dmn-js-boxed-expression',
      ]) {
        await copyDir(resolvePkg(sub, '/assets/css'), dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [copyAssetsPlugin()],
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
