import { createRoot } from 'react-dom/client';
import App from './App';
import { initLanguage } from '../shared/i18n';
import { initTheme } from '../shared/theme';
import { allCssVariables } from '../shared/styles';
import 'highlight.js/styles/github.css';

async function init() {
  // console.log('[Hootly] Iframe app starting...');

  // Inject CSS variables for theming
  const styleEl = document.createElement('style');
  styleEl.id = 'hootly-theme-vars';
  styleEl.textContent = allCssVariables;
  document.head.appendChild(styleEl);

  // Initialize theme system (sets data-theme attribute, listens for changes)
  await initTheme();

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

  // console.log('[Hootly] Iframe app mounted');
}

init();
