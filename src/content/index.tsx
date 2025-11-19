import { createRoot } from 'react-dom/client';
import App from './App';
import 'highlight.js/styles/github.css';

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

  // Listen for toggle command from background
  chrome.runtime.onMessage.addListener((message) => {
    console.log('[FireClaude] Received message:', message);
    if (message.type === 'toggleDialog') {
      console.log('[FireClaude] Posting toggle message to window');
      window.postMessage({ type: 'fireclaude-toggle' }, '*');
    }
  });

  console.log('[FireClaude] Content script initialized successfully');
}

// Start initialization
init();
