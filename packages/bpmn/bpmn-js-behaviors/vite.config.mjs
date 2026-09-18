import { defineConfig } from 'vite';

// This package builds via scripts/transpile.mjs (per-file esbuild transpile,
// preserving source tree structure). This config is for tooling uniformity
// and used by vitest.
export default defineConfig({});
