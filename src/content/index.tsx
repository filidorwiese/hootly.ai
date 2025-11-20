import { createRoot } from 'react-dom/client';
import App from './App';
import { Storage } from '../shared/storage';
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

function init() {
  console.log('[FireClaude] Content script starting...');

  // Ensure body exists
  if (!document.body) {
    console.log('[FireClaude] Body not ready, waiting...');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
  }

  // Create container for React app
  const container = document.createElement('div');
  container.id = 'fireclaude-root';
  document.body.appendChild(container);

  console.log('[FireClaude] Container created, mounting React...');

  // Mount React app
  const root = createRoot(container);
  root.render(<App />);

  console.log('[FireClaude] React app mounted');

  // Listen for toggle command from background (legacy manifest command)
  chrome.runtime.onMessage.addListener((message) => {
    console.log('[FireClaude] Received message:', message);
    if (message.type === 'toggleDialog') {
      console.log('[FireClaude] Posting toggle message to window');
      window.postMessage({ type: 'fireclaude-toggle' }, '*');
    }
  });

  // Setup keyboard shortcut listener
  let currentShortcut = parseShortcut('Alt+C'); // default

  // Load configured shortcut
  Storage.getSettings().then((settings) => {
    currentShortcut = parseShortcut(settings.shortcut);
    console.log('[FireClaude] Keyboard shortcut configured:', settings.shortcut);
  });

  // Listen for shortcut updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.shortcut) {
      currentShortcut = parseShortcut(changes.settings.newValue.shortcut);
      console.log('[FireClaude] Keyboard shortcut updated:', changes.settings.newValue.shortcut);
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
      console.log('[FireClaude] Keyboard shortcut triggered');
      window.postMessage({ type: 'fireclaude-toggle' }, '*');
    }
  });

  console.log('[FireClaude] Content script initialized successfully');
}

// Start initialization
init();
