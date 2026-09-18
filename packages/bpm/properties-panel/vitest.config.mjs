import path from 'node:path';
import { defineConfig } from 'vitest/config';
import babel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            importSource: 'preact',
            runtime: 'automatic'
          }],
          'babel-plugin-inline-react-svg',
          ['babel-plugin-module-resolver', {
            alias: {
              preact: './preact',
              react: './preact/compat'
            }
          }]
        ]
      }
    })
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*.{spec,spec.js}'],
    setupFiles: ['./test/globals.js'],
    assetsInclude: ['**/*.css', '**/*.svg']
  },
  resolve: {
    alias: {
      preact: path.resolve(__dirname, './preact'),
      react: path.resolve(__dirname, './preact/compat'),
      'react-dom': path.resolve(__dirname, './preact/compat')
    }
  },
  define: {
    'process.env': '{}',
    'window.__env__': '{}'
  }
});
