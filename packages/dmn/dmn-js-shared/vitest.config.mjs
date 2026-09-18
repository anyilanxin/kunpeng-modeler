import path from 'node:path';

import { defineConfig } from 'vitest/config';
import babel from 'vite-plugin-babel';

export default defineConfig({
    plugins: [
        // Transform Inferno JSX in .js source/test files. esbuild alone cannot
        // handle Inferno's multi-function JSX (createVNode vs
        // createComponentVNode), so babel-plugin-inferno is required.
        babel({
            babelConfig: {
                plugins: ['inferno']
            }
        })
    ],
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src'),
            test: path.resolve(__dirname, 'test')
        }
    },
    define: {
        'window.__env__': '{}'
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['test/**/*Spec.js'],
        setupFiles: ['./test/globals.js'],
        assetsInclude: ['**/*.dmn', '**/*.css']
    }
});
