import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('../package.json', 'utf-8'));

const isChrome = process.env.TARGET === 'chrome';
const outDir = isChrome ? 'dist/chrome' : 'dist/firefox';

export default defineConfig(({ mode }) => {
  // Check if building for library mode (content/background scripts)
  const isLibBuild = mode === 'lib';

  if (isLibBuild) {
    return {
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        '__APP_VERSION__': JSON.stringify(pkg.version),
      },
      build: {
        lib: {
          entry: resolve(__dirname, process.env.BUILD_ENTRY!),
          formats: ['iife'],
          name: 'Hootly.ai',
          fileName: () => process.env.BUILD_OUTPUT!,
        },
        outDir,
        emptyOutDir: false,
        target: 'es2015',
        minify: false,
        rollupOptions: {
          output: {
            inlineDynamicImports: false,
            manualChunks: undefined,
          },
        },
      },
    };
  }

  return {
    define: {
      '__APP_VERSION__': JSON.stringify(pkg.version),
    },
    plugins: [
      react(),
      {
        name: 'copy-files',
        closeBundle() {
          mkdirSync(outDir, { recursive: true });
          const manifestSrc = isChrome ? 'manifest.chrome.json' : 'manifest.firefox.json';
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
          const historyPath = `${outDir}/src/history/index.html`;
          const historyAltPath = `${outDir}/history.html`;
          if (existsSync(historyPath)) {
            copyFileSync(historyPath, historyAltPath);
          }
          const personasPath = `${outDir}/src/personas/index.html`;
          const personasAltPath = `${outDir}/personas.html`;
          if (existsSync(personasPath)) {
            copyFileSync(personasPath, personasAltPath);
          }
          const promptsPath = `${outDir}/src/prompts/index.html`;
          const promptsAltPath = `${outDir}/prompts.html`;
          if (existsSync(promptsPath)) {
            copyFileSync(promptsPath, promptsAltPath);
          }
          const popupPath = `${outDir}/src/popup/index.html`;
          const popupAltPath = `${outDir}/popup.html`;
          if (existsSync(popupPath)) {
            copyFileSync(popupPath, popupAltPath);
          }
          const chatPath = `${outDir}/src/chat/index.html`;
          const chatAltPath = `${outDir}/chat.html`;
          if (existsSync(chatPath)) {
            copyFileSync(chatPath, chatAltPath);
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          settings: resolve(__dirname, 'src/settings/index.html'),
          history: resolve(__dirname, 'src/history/index.html'),
          personas: resolve(__dirname, 'src/personas/index.html'),
          prompts: resolve(__dirname, 'src/prompts/index.html'),
          popup: resolve(__dirname, 'src/popup/index.html'),
          chat: resolve(__dirname, 'src/chat/index.html'),
        },
        output: {
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
      outDir,
      emptyOutDir: false,
      target: 'es2015',
      minify: false,
    },
  };
});
