import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle() {
        mkdirSync('dist', { recursive: true });
        copyFileSync('manifest.json', 'dist/manifest.json');
        // Move settings.html to root of dist
        copyFileSync('dist/src/settings/index.html', 'dist/settings.html');
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.tsx'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        settings: resolve(__dirname, 'src/settings/index.html'),
        'settings-script': resolve(__dirname, 'src/settings/settings.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Map settings-script to settings.js
          if (chunkInfo.name === 'settings-script') {
            return 'settings.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
