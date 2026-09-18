import { defineConfig } from 'vite';

// This package ships JSON resources only; no compilation needed.
// Vite config is declared for tooling uniformity across the monorepo.
export default defineConfig({
  // no build.lib — nothing to bundle
});
