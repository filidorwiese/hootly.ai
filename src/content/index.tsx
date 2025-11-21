import { Storage } from '../shared/storage';

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

  // Create iframe for complete style isolation
  const iframe = document.createElement('iframe');
  iframe.id = 'fireowl-frame';
  iframe.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border: none !important;
    z-index: 2147483647 !important;
    background: transparent !important;
    pointer-events: none !important;
    color-scheme: light !important;
  `;
  iframe.setAttribute('allowtransparency', 'true');
  document.body.appendChild(iframe);

  // Wait for iframe to load
  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    // Trigger load for about:blank
    iframe.src = 'about:blank';
  });

  const iframeDoc = iframe.contentDocument!;
  const iframeWin = iframe.contentWindow!;

  // Write the iframe HTML with React app
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
      <style>
        *, *::before, *::after {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: transparent;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          pointer-events: none;
        }
        #fireowl-root {
          pointer-events: none;
        }
        #fireowl-root > * {
          pointer-events: auto;
        }
      </style>
    </head>
    <body>
      <div id="fireowl-root"></div>
    </body>
    </html>
  `);
  iframeDoc.close();

  // Expose chrome API to iframe
  (iframeWin as any).chrome = chrome;

  // Expose page info to iframe
  (iframeWin as any).__FIREOWL_PAGE_INFO__ = {
    url: window.location.href,
    title: document.title,
    getSelection: () => window.getSelection()?.toString() || '',
    getPageText: () => document.body.innerText || '',
  };

  // Load and execute the iframe bundle
  const script = iframeDoc.createElement('script');
  script.src = chrome.runtime.getURL('iframe-app.js');
  iframeDoc.body.appendChild(script);

  console.log('[FireOwl] Iframe created, loading app...');

  // Forward toggle commands to iframe
  const sendToggleToIframe = () => {
    console.log('[FireOwl] Sending toggle to iframe');
    iframeWin.postMessage({ type: 'fireowl-toggle' }, '*');
  };

  // Listen for toggle command from background
  chrome.runtime.onMessage.addListener((message) => {
    console.log('[FireOwl] Received message:', message);
    if (message.type === 'toggleDialog') {
      sendToggleToIframe();
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
      sendToggleToIframe();
    }
  });

  console.log('[FireOwl] Content script initialized successfully');
}

// Start initialization
init();
