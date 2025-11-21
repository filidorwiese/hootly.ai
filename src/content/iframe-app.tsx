import { createRoot } from 'react-dom/client';
import App from './App';
import { initLanguage } from '../shared/i18n';
import 'highlight.js/styles/github.css';

async function init() {
  console.log('[FireOwl] Iframe app starting...');

  // Initialize language
  await initLanguage();

  // Mount React app
  const container = document.getElementById('fireowl-root');
  if (!container) {
    console.error('[FireOwl] Mount point not found');
    return;
  }

  const root = createRoot(container);
  root.render(<App />);

  console.log('[FireOwl] Iframe app mounted');
}

init();
