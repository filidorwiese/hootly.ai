import { createRoot } from 'react-dom/client';
import App from './App';

// Create container for React app
const container = document.createElement('div');
container.id = 'fireclaude-root';
document.body.appendChild(container);

// Mount React app
const root = createRoot(container);
root.render(<App />);

// Listen for toggle command from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'toggleDialog') {
    window.postMessage({ type: 'fireclaude-toggle' }, '*');
  }
});

console.log('FireClaude content script initialized');
