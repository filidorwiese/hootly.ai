import { createRoot } from 'react-dom/client';
import App from './App';
import { initLanguage } from '../shared/i18n';
import 'highlight.js/styles/github.css';

async function init() {
  console.log('[Hootly] Iframe app starting...');

  // Initialize language
  await initLanguage();

  // Mount React app
  const container = document.getElementById('hootly-root');
  if (!container) {
    console.error('[Hootly] Mount point not found');
    return;
  }

  const root = createRoot(container);
  root.render(<App />);

  console.log('[Hootly] Iframe app mounted');
}

init();
