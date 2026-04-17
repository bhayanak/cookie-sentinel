import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@background': resolve(__dirname, 'src/background'),
      '@devtools': resolve(__dirname, 'src/devtools'),
      '@popup': resolve(__dirname, 'src/popup'),
      '@content': resolve(__dirname, 'src/content'),
      '@data': resolve(__dirname, 'src/data'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        devtools: resolve(__dirname, 'src/devtools/panel.html'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name]/index.js',
      },
    },
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
  },
});
