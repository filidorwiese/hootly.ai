import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig(({ command, mode }) => {
  // Check if building for library mode (content/background scripts)
  const isLibBuild = mode === 'lib';

  if (isLibBuild) {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, process.env.BUILD_ENTRY!),
          formats: ['iife'],
          name: 'FireClaude',
          fileName: () => process.env.BUILD_OUTPUT!,
        },
        outDir: 'dist',
        emptyOutDir: false,
        target: 'es2015',
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      },
    };
  }

  return {
    plugins: [
      react(),
      {
        name: 'copy-files',
        closeBundle() {
          mkdirSync('dist', { recursive: true });
          copyFileSync('manifest.json', 'dist/manifest.json');
          copyFileSync('public/background.html', 'dist/background.html');
          const settingsPath = 'dist/src/settings/index.html';
          const settingsAltPath = 'dist/settings.html';
          if (existsSync(settingsPath)) {
            copyFileSync(settingsPath, settingsAltPath);
          } else if (existsSync('dist/index.html')) {
            copyFileSync('dist/index.html', settingsAltPath);
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          settings: resolve(__dirname, 'src/settings/index.html'),
        },
        output: {
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2015',
    },
  };
});
