import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const isChrome = process.env.TARGET === 'chrome';
const outDir = isChrome ? 'dist-chrome' : 'dist-firefox';

export default defineConfig(({ command, mode }) => {
  // Check if building for library mode (content/background scripts)
  const isLibBuild = mode === 'lib';

  if (isLibBuild) {
    return {
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      build: {
        lib: {
          entry: resolve(__dirname, process.env.BUILD_ENTRY!),
          formats: ['iife'],
          name: 'FireClaude',
          fileName: () => process.env.BUILD_OUTPUT!,
        },
        outDir,
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
          mkdirSync(outDir, { recursive: true });
          const manifestSrc = isChrome ? 'manifest.chrome.json' : 'manifest.json';
          copyFileSync(manifestSrc, `${outDir}/manifest.json`);
          if (!isChrome) {
            copyFileSync('src/background/background.html', `${outDir}/background.html`);
          }
          copyFileSync('src/content/iframe.html', `${outDir}/iframe.html`);
          const settingsPath = `${outDir}/src/settings/index.html`;
          const settingsAltPath = `${outDir}/settings.html`;
          if (existsSync(settingsPath)) {
            copyFileSync(settingsPath, settingsAltPath);
          } else if (existsSync(`${outDir}/index.html`)) {
            copyFileSync(`${outDir}/index.html`, settingsAltPath);
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
      outDir,
      emptyOutDir: false,
      target: 'es2015',
    },
  };
});
