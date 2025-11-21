import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from './App';
import { Storage } from '../shared/storage';
import { initLanguage } from '../shared/i18n';
import highlightStyles from 'highlight.js/styles/github.css?inline';

function parseShortcut(shortcut: string): { key: string; alt: boolean; ctrl: boolean; shift: boolean; meta: boolean } {
  const parts = shortcut.toLowerCase().split('+');
  const modifiers = {
    alt: parts.includes('alt'),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  };
  const key = parts[parts.length - 1];
  return { key, ...modifiers };
}

async function init() {
  console.log('[FireOwl] Content script starting...');

  // Ensure body exists
  if (!document.body) {
    console.log('[FireOwl] Body not ready, waiting...');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
  }

  // Initialize language before mounting React
  await initLanguage();

  // Create container with Shadow DOM for style isolation
  const container = document.createElement('div');
  container.id = 'fireowl-root';
  document.body.appendChild(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inject styles into shadow root
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    ${highlightStyles}

    :host {
      all: initial;
      font-family: 'Inter', sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }
  `;
  shadowRoot.appendChild(styleEl);

  // Create mount point inside shadow root
  const mountPoint = document.createElement('div');
  mountPoint.id = 'fireowl-mount';
  shadowRoot.appendChild(mountPoint);

  // Create emotion cache that injects styles into shadow root
  const emotionCache = createCache({
    key: 'fireowl',
    container: shadowRoot,
  });

  console.log('[FireOwl] Shadow DOM container created, mounting React...');

  // Mount React app with emotion cache provider
  const root = createRoot(mountPoint);
  root.render(
    <CacheProvider value={emotionCache}>
      <App />
    </CacheProvider>
  );

  console.log('[FireOwl] React app mounted');

  // Listen for toggle command from background (legacy manifest command)
  chrome.runtime.onMessage.addListener((message) => {
    console.log('[FireOwl] Received message:', message);
    if (message.type === 'toggleDialog') {
      console.log('[FireOwl] Posting toggle message to window');
      window.postMessage({ type: 'fireclaude-toggle' }, '*');
    }
  });

  // Setup keyboard shortcut listener
  let currentShortcut = parseShortcut('Alt+C'); // default

  // Load configured shortcut
  Storage.getSettings().then((settings) => {
    currentShortcut = parseShortcut(settings.shortcut);
    console.log('[FireOwl] Keyboard shortcut configured:', settings.shortcut);
  });

  // Listen for shortcut updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.shortcut) {
      currentShortcut = parseShortcut(changes.settings.newValue.shortcut);
      console.log('[FireOwl] Keyboard shortcut updated:', changes.settings.newValue.shortcut);
    }
  });

  // Global keyboard listener
  document.addEventListener('keydown', (event) => {
    const matchesModifiers =
      event.altKey === currentShortcut.alt &&
      event.ctrlKey === currentShortcut.ctrl &&
      event.shiftKey === currentShortcut.shift &&
      event.metaKey === currentShortcut.meta;

    const matchesKey = event.key.toLowerCase() === currentShortcut.key;

    if (matchesModifiers && matchesKey) {
      event.preventDefault();
      console.log('[FireOwl] Keyboard shortcut triggered');
      window.postMessage({ type: 'fireclaude-toggle' }, '*');
    }
  });

  console.log('[FireOwl] Content script initialized successfully');
}

// Start initialization
init();
