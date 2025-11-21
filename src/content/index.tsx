import { createRoot } from 'react-dom/client';
import App from './App';
import { Storage } from '../shared/storage';
import { initLanguage } from '../shared/i18n';
import 'highlight.js/styles/github.css';

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

  // Inject Inter font from Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);

  // Create container for React app
  const container = document.createElement('div');
  container.id = 'fireclaude-root';
  document.body.appendChild(container);

  console.log('[FireOwl] Container created, mounting React...');

  // Mount React app
  const root = createRoot(container);
  root.render(<App />);

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
