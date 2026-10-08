import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/',
  resolve: {
    // This repository has no symlinked packages; keep paths usable in restricted Windows workspaces.
    preserveSymlinks: true,
    // Keep the site's exact Three.js r180 implementation and controls.
    alias: { three: fileURLToPath(new URL('./src/vendor/three.module.js', import.meta.url)) }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    manifest: true,
    target: ['chrome90', 'edge90', 'firefox90', 'safari15'],
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/vendor/')) return 'three';
        }
      }
    }
  }
});
