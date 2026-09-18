import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const preactBase = path.resolve(
  __dirname,
  'node_modules/@kunpeng/properties-panel/preact'
);

/**
 * Load .css and .bpmn files as raw strings exported on `default`,
 * mirroring the former raw-loader / karma-webpack behavior. Test specs use
 * `require('.../*.css').default` and `require('.../*.bpmn').default`.
 */
function rawAssetPlugin() {
  return {
    name: 'raw-asset',
    enforce: 'pre',
    transform(_code, id) {
      if (/\.(css|bpmn)$/.test(id)) {
        const content = readFileSync(id, 'utf-8');
        const escaped = JSON.stringify(content);
        return {
          code: `export default ${escaped};`,
          map: null
        };
      }
      return null;
    }
  };
}

/**
 * Transform .svg imports into Preact components (same behavior as the build
 * vite.config.mjs reactSvgPlugin). Kept in sync so tests render the same
 * components that ship in the bundle.
 */
function reactSvgPlugin() {
  return {
    name: 'react-svg',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('.svg')) {
        return null;
      }
      const svg = readFileSync(id, 'utf-8');
      const escaped = JSON.stringify(svg);
      // Inline the SVG via innerHTML and return the root node as a component.
      // This is a lightweight runtime equivalent sufficient for tests.
      return {
        code: [
          `const svgMarkup = ${escaped};`,
          `let _cached = null;`,
          `export default (props = {}) => {`,
          `  if (!_cached) {`,
          `    const wrapper = document.createElement('div');`,
          `    wrapper.innerHTML = svgMarkup.trim();`,
          `    _cached = wrapper.firstElementChild;`,
          `  }`,
          `  const clone = _cached.cloneNode(true);`,
          `  if (props) {`,
          `    for (const key in props) {`,
          `      if (key === 'className') { clone.setAttribute('class', props[key]); }`,
          `      else if (key === 'style' && typeof props[key] === 'object') { Object.assign(clone.style, props[key]); }`,
          `      else { clone.setAttribute(key, props[key]); }`,
          `    }`,
          `  }`,
          `  return clone;`,
          `};`
        ].join('\n'),
        map: null
      };
    }
  };
}

export default defineConfig({
  plugins: [rawAssetPlugin(), reactSvgPlugin()],
  esbuild: {
    loader: 'jsx',
    include: [/src\/.*\.js$/, /test\/.*\.js$/],
    jsxImportSource: '@kunpeng/properties-panel/preact',
    jsx: 'automatic'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  },
  resolve: {
    alias: {
      // react -> preact/compat, mirroring karma.config.js webpack aliases.
      react: path.resolve(preactBase, 'compat'),
      'react-dom': path.resolve(preactBase, 'compat'),
      preact: preactBase,
      // Module resolution roots previously provided by karma-webpack.
      src: path.resolve(__dirname, 'src'),
      test: path.resolve(__dirname, 'test'),
      // bpmn-js/test/helper imports mocha-test-container-support; shim it so
      // it resolves under vitest without a real mocha context.
      'mocha-test-container-support': path.resolve(__dirname, 'test/testContainer.js')
    }
  },
  define: {
    'process.env': '{}',
    'window.__env__': '{}'
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*{Spec,spec}.js'],
    // distroSpec.js is a post-build verification suite run via the mocha-based
    // test:build script; exclude it from vitest to avoid pre-build failures.
    exclude: ['test/distro/**', '**/node_modules/**', '**/dist/**'],
    setupFiles: ['./test/globals.js']
  }
});
