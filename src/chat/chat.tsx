import { createRoot } from 'react-dom/client';
import { initLanguage } from '../shared/i18n';
import { initTheme } from '../shared/theme';
import { allCssVariables } from '../shared/styles';
import Dialog from '../content/components/Dialog';
import 'highlight.js/styles/github.css';

function ChatApp() {
  // Get conversation ID from URL parameter
  const params = new URLSearchParams(window.location.search);
  const conversationId = params.get('conversationId');

  const handleClose = () => {
    window.close();
  };

  return (
    <Dialog
      isOpen={true}
      onClose={handleClose}
      mode="standalone"
      initialConversationId={conversationId}
    />
  );
}

async function init() {
  // Inject CSS variables for theming
  const styleEl = document.createElement('style');
  styleEl.id = 'hootly-theme-vars';
  styleEl.textContent = allCssVariables;
  document.head.appendChild(styleEl);

  // Initialize theme system
  await initTheme();

  // Initialize language
  await initLanguage();

  // Mount React app
  const container = document.getElementById('chat-root');
  if (!container) {
    console.error('[Hootly] Chat mount point not found');
    return;
  }

  const root = createRoot(container);
  root.render(<ChatApp />);
}

init();
