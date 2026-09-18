import { readFileSync } from 'node:fs';

import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const outputDir = 'dist';

const distros = [
  {
    input: 'src/Viewer.js',
    output: 'dmn-viewer'
  },
  {
    input: 'src/NavigatedViewer.js',
    output: 'dmn-navigated-viewer'
  },
  {
    input: 'src/Modeler.js',
    output: 'dmn-modeler'
  }
];

/**
 * Build standalone UMD distributions.
 *
 * Produces 6 bundles (3 entries x development/production) named
 * `DmnJS` on the global object, bundling all dependencies.
 *
 * Run via `pnpm run build:distro`. NODE_ENV toggles which variant is
 * produced: pass NODE_ENV=development for the unminified build,
 * NODE_ENV=production (default) for the terser-minified build. The
 * build-distro task runs both.
 */
export default defineConfig(() => {
  const NODE_ENV = process.env.NODE_ENV || 'production';

  const isProduction = NODE_ENV === 'production';

  const fileNameSuffix = isProduction ? 'production.min' : 'development';

  return {
    plugins: [
      bannerPlugin(isProduction)
    ],
    esbuild: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    },
    resolve: {
      // In development, prefer the dev:module field (unminified builds)
      mainFields: (NODE_ENV === 'development' ? ['dev:module'] : []).concat([
        'module',
        'main'
      ])
    },
    build: {
      emptyOutDir: false,
      outDir: outputDir,
      sourcemap: true,
      // production bundles are minified with terser (matching the
      // former rollup + @rollup/plugin-terser setup); development
      // bundles are left unminified.
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        format: {
          comments: /license|@preserve/
        }
      },
      rollupOptions: {
        input: Object.fromEntries(
          distros.map((d) => [d.output, d.input])
        ),
        output: {
          format: 'umd',
          name: 'DmnJS',
          entryFileNames: `[name].${fileNameSuffix}.js`
        }
      }
    }
  };
});


// helpers //////////////////////

/**
 * Vite/Rollup plugin that prepends a license banner to each output
 * chunk. The banner is resolved per-bundle using the entry name
 * (e.g. `dmn-viewer`) so that the `{{name}}` template placeholder is
 * filled correctly for every distribution.
 */
function bannerPlugin(minified) {
  const bannerName = minified ? 'banner-min' : 'banner';

  const bannerTemplate = readFileSync(
    new URL(`./resources/${bannerName}.txt`, import.meta.url),
    'utf8'
  );

  return {
    name: 'dmn-js-distro-banner',
    renderChunk(code, chunk) {
      const banner = processTemplate(bannerTemplate, {
        version: pkg.version,
        date: today(),
        name: chunk.name
      });

      return {
        code: `${banner}\n${code}`,
        map: null
      };
    }
  };
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function today() {
  const d = new Date();

  return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function processTemplate(str, args) {
  return str.replace(/\{\{\s*([^\s]+)\s*\}\}/g, function(_, n) {
    var replacement = args[n];

    if (!replacement) {
      throw new Error('unknown template {{ ' + n + ' }}');
    }

    return replacement;
  });
}
