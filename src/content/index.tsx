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

  // Store page info to pass to iframe after load
  const pageInfo = {
    url: window.location.href,
    title: document.title,
    getSelection: () => window.getSelection()?.toString() || '',
    getPageText: () => document.body.innerText || '',
  };

  // Wait for iframe to load
  const iframeLoaded = new Promise<void>((resolve) => {
    iframe.onload = () => {
      console.log('[FireOwl] Iframe loaded');
      // Expose chrome API and page info to iframe
      const iframeWin = iframe.contentWindow as any;
      if (iframeWin) {
        iframeWin.chrome = chrome;
        iframeWin.__FIREOWL_PAGE_INFO__ = pageInfo;
      }
      resolve();
    };
  });

  iframe.src = chrome.runtime.getURL('iframe.html');
  document.body.appendChild(iframe);

  await iframeLoaded;
  console.log('[FireOwl] Iframe created and ready');

  // Track dialog state to toggle iframe pointer-events
  let dialogOpen = false;

  // Forward toggle commands to iframe
  const sendToggleToIframe = () => {
    dialogOpen = !dialogOpen;
    console.log('[FireOwl] Sending toggle to iframe, dialogOpen:', dialogOpen);
    iframe.style.pointerEvents = dialogOpen ? 'auto' : 'none';
    iframe.contentWindow?.postMessage({ type: 'fireowl-toggle' }, '*');
  };

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'fireowl-dialog-closed') {
      dialogOpen = false;
      iframe.style.pointerEvents = 'none';
      console.log('[FireOwl] Dialog closed, disabling iframe pointer events');
    }
    // Respond to page info requests from iframe
    if (event.data?.type === 'fireowl-get-page-info') {
      iframe.contentWindow?.postMessage({
        type: 'fireowl-page-info',
        payload: {
          url: window.location.href,
          title: document.title,
          selection: window.getSelection()?.toString() || '',
          pageText: document.body.innerText || '',
        }
      }, '*');
    }
  });

  // Track selection changes and notify iframe for tooltip
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection()?.toString().trim() || '';
    iframe.contentWindow?.postMessage({
      type: 'fireowl-selection-change',
      payload: { hasSelection: selection.length > 0 }
    }, '*');
  });

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
