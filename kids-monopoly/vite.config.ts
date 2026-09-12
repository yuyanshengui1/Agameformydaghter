import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: true,
    open: false,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
