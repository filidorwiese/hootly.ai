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
  // console.log('[Hootly] Content script starting...');

  // Prevent duplicate injection
  if (document.getElementById('hootly-frame')) {
    return;
  }

  // Ensure body exists
  if (!document.body) {
    // console.log('[Hootly] Body not ready, waiting...');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
  }

  // Create iframe for complete style isolation
  const iframe = document.createElement('iframe');
  iframe.id = 'hootly-frame';
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
  `;
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('allow', 'clipboard-read');

  // Track state
  let dialogOpen = false;
  let isReady = false;
  const pendingToggles: (() => void)[] = [];

  // Persist context mode across dialog close/reopen
  let storedContextEnabled = false;
  let storedContextMode: 'none' | 'selection' | 'fullpage' | 'clipboard' = 'none';

  // Forward toggle commands to iframe
  const sendToggleToIframe = async () => {
    if (!isReady) {
      // Queue the toggle for when iframe is ready
      pendingToggles.push(() => sendToggleToIframe());
      return;
    }
    dialogOpen = !dialogOpen;
    iframe.style.pointerEvents = dialogOpen ? 'auto' : 'none';

    // Read clipboard while user activation is still valid (before async operations)
    let clipboardText: string | null = null;
    if (dialogOpen) {
      iframe.focus(); // Required for Firefox to allow focus inside iframe
      try {
        const text = await navigator.clipboard.readText();
        // Validate: >32 chars and contains space (to filter out passwords)
        if (text && text.length > 32 && text.includes(' ')) {
          clipboardText = text;
        }
      } catch {
        // Clipboard access denied or empty
      }
    }

    // Send toggle with stored context state and clipboard
    iframe.contentWindow?.postMessage({
      type: 'hootly-toggle',
      payload: {
        contextEnabled: storedContextEnabled,
        contextMode: storedContextMode,
        clipboardText,
      }
    }, '*');
  };

  // Listen for toggle command from background - MUST be set up before waiting for iframe
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'toggleDialog') {
      sendToggleToIframe();
    }
  });

  // Wait for iframe to load and React app to mount
  const iframeReady = new Promise<void>((resolve) => {
    const handleReady = (event: MessageEvent) => {
      if (event.data?.type === 'hootly-ready') {
        window.removeEventListener('message', handleReady);
        resolve();
      }
    };
    window.addEventListener('message', handleReady);
  });

  iframe.src = chrome.runtime.getURL('iframe.html');
  document.body.appendChild(iframe);

  await iframeReady;
  isReady = true;

  // Auto-show dialog on first injection (user explicitly activated extension)
  sendToggleToIframe();

  // Process any additional toggles that were queued during iframe load
  while (pendingToggles.length > 0) {
    pendingToggles.shift()!();
  }

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'hootly-dialog-closed') {
      dialogOpen = false;
      iframe.style.pointerEvents = 'none';
    }
    if (event.data?.type === 'hootly-get-page-info') {
      iframe.contentWindow?.postMessage({
        type: 'hootly-page-info',
        payload: {
          url: window.location.href,
          title: document.title,
          selection: window.getSelection()?.toString() || '',
          pageText: document.body.innerText || '',
        }
      }, '*');
    }
    // Store context mode when it changes in iframe
    if (event.data?.type === 'hootly-context-mode') {
      storedContextEnabled = event.data.payload.contextEnabled;
      storedContextMode = event.data.payload.contextMode;
    }
  });

  // Track selection changes and notify iframe for tooltip
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection()?.toString().trim() || '';
    iframe.contentWindow?.postMessage({
      type: 'hootly-selection-change',
      payload: { hasSelection: selection.length > 0 }
    }, '*');
  });

  // Setup keyboard shortcut listener
  let currentShortcut = parseShortcut('Alt+C');

  Storage.getSettings().then((settings) => {
    currentShortcut = parseShortcut(settings.shortcut);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.shortcut) {
      currentShortcut = parseShortcut(changes.settings.newValue.shortcut);
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
      sendToggleToIframe();
    }
  });
}

// Start initialization
init();
