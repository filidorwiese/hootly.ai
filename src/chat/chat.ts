import { Storage } from '../shared/storage';
import type { Conversation, Persona, Message, Settings } from '../shared/types';
import { DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';
import { getApiKey } from '../shared/providers';

let currentConversation: Conversation | null = null;
let currentSettings: Settings | null = null;
let allPersonas: Persona[] = [];
let isStreaming = false;
let streamingContent = '';
let contextEnabled = false;
let conversationId: string | null = null;

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getConversationContext(conv: Conversation): { type: 'selection' | 'fullpage'; url: string; title: string; content: string } | null {
  for (const msg of conv.messages) {
    if (msg.context) {
      if (msg.context.selection) {
        return {
          type: 'selection',
          url: msg.context.url,
          title: msg.context.title,
          content: msg.context.selection,
        };
      } else if (msg.context.fullPage) {
        return {
          type: 'fullpage',
          url: msg.context.url,
          title: msg.context.title,
          content: msg.context.fullPage,
        };
      }
    }
  }
  return null;
}

function renderMessages(): void {
  if (!currentConversation) return;

  const container = document.getElementById('messagesContainer')!;
  const emptyState = document.getElementById('emptyState')!;

  if (currentConversation.messages.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  container.innerHTML = currentConversation.messages
    .map(
      (msg) => `
      <div class="message ${msg.role}">
        <div class="message-role">${msg.role === 'user' ? (t('response.you') || 'You') : 'Claude'}</div>
        <div class="message-content">${escapeHtml(msg.content)}</div>
      </div>
    `
    )
    .join('');

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function renderContextToggle(): void {
  if (!currentConversation) return;

  const container = document.getElementById('contextToggle')!;
  const originalContext = getConversationContext(currentConversation);
  const hasContext = originalContext !== null;

  if (!hasContext) {
    const noContextLabel = t('history.noOriginalContext') || 'No page context';
    container.innerHTML = `
      <button class="context-toggle-btn" disabled title="${noContextLabel}">
        🌐
      </button>
      <span class="context-badge unavailable">${noContextLabel}</span>
    `;
    return;
  }

  const contextType = originalContext.type;
  const contextChars = originalContext.content.length;
  const badgeClass = contextEnabled ? (contextType === 'selection' ? 'selection' : 'fullpage') : '';
  const badgeText = contextEnabled
    ? (contextType === 'selection'
        ? (t('context.selection', { chars: contextChars }) || `Selection (${contextChars} chars)`)
        : (t('context.fullPage') || 'Full page'))
    : (t('context.noContext') || 'No context');
  const toggleTitle = contextEnabled
    ? (t('context.disableContext') || 'Click to disable context')
    : (t('context.clickToEnable') || 'Click to enable context');

  container.innerHTML = `
    <button class="context-toggle-btn ${contextEnabled ? 'enabled' : ''}" id="contextToggleBtn" title="${toggleTitle}">
      🌐
    </button>
    <span class="context-badge ${badgeClass}">${badgeText}</span>
  `;

  // Add click handler
  const btn = document.getElementById('contextToggleBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      contextEnabled = !contextEnabled;
      renderContextToggle();
    });
  }
}

function renderPersonaSelector(): void {
  if (!currentConversation || !currentSettings) return;

  const container = document.getElementById('personaSelector')!;
  const currentPersonaId = currentConversation.personaId || 'general';
  const currentPersona = allPersonas.find((p) => p.id === currentPersonaId);

  container.innerHTML = `
    <span>${currentPersona?.icon || '🦉'}</span>
    <select id="personaSelect">
      ${allPersonas.map((p) => `
        <option value="${p.id}" ${p.id === currentPersonaId ? 'selected' : ''}>
          ${p.icon} ${p.name}
        </option>
      `).join('')}
    </select>
  `;

  // Add change handler
  const select = document.getElementById('personaSelect') as HTMLSelectElement;
  if (select) {
    select.addEventListener('change', () => {
      if (currentConversation) {
        currentConversation.personaId = select.value;
      }
    });
  }
}

async function handleSendMessage(): Promise<void> {
  if (isStreaming || !currentConversation || !currentSettings) return;

  const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  const cancelHint = document.getElementById('cancelHint')!;
  const streamingIndicator = document.getElementById('streamingIndicator')!;
  const streamingContentEl = document.getElementById('streamingContent')!;
  const inputWrapper = document.getElementById('inputWrapper')!;
  const burnBtn = document.getElementById('burnBtn')!;

  const prompt = textarea.value.trim();
  if (!prompt) return;

  textarea.value = '';
  textarea.disabled = true;
  sendBtn.disabled = true;
  isStreaming = true;
  streamingContent = '';

  // Add user message immediately
  const userMessage: Message = {
    role: 'user',
    content: prompt,
    timestamp: Date.now(),
  };

  // Build context if enabled
  if (contextEnabled) {
    const originalContext = getConversationContext(currentConversation);
    if (originalContext) {
      if (originalContext.type === 'selection') {
        userMessage.context = {
          url: originalContext.url,
          title: originalContext.title,
          selection: originalContext.content,
        };
      } else {
        userMessage.context = {
          url: originalContext.url,
          title: originalContext.title,
          fullPage: originalContext.content,
        };
      }
    }
  }

  currentConversation.messages.push(userMessage);

  // Update title from first user message if not set
  if (currentConversation.messages.filter(m => m.role === 'user').length === 1) {
    currentConversation.title = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
  }

  renderMessages();

  // Show burn button now that we have messages
  burnBtn.style.display = 'flex';

  // Show streaming UI
  streamingIndicator.classList.add('visible');
  streamingContentEl.textContent = t('response.thinking') || 'Thinking...';
  cancelHint.style.display = 'block';
  inputWrapper.style.display = 'none';

  // Get persona system prompt
  const persona = allPersonas.find((p) => p.id === currentConversation!.personaId);
  let combinedSystemPrompt = persona?.systemPrompt || '';
  if (currentSettings.systemPrompt) {
    combinedSystemPrompt = combinedSystemPrompt
      ? `${combinedSystemPrompt}\n\n${currentSettings.systemPrompt}`
      : currentSettings.systemPrompt;
  }

  // Send to API
  try {
    const apiKey = getApiKey(currentSettings);
    if (!apiKey) {
      setStreamingError(t('dialog.noApiKey') || 'No API key configured');
      return;
    }

    await chrome.runtime.sendMessage({
      type: 'sendPrompt',
      payload: {
        prompt,
        context: userMessage.context,
        conversationHistory: currentConversation.messages.slice(0, -1),
        settings: { ...currentSettings, systemPrompt: combinedSystemPrompt },
      },
    });
  } catch (err) {
    setStreamingError(err instanceof Error ? err.message : 'Failed to send message');
  }
}

function setStreamingError(error: string): void {
  const streamingIndicator = document.getElementById('streamingIndicator')!;
  const streamingContentEl = document.getElementById('streamingContent')!;
  const cancelHint = document.getElementById('cancelHint')!;
  const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  const inputWrapper = document.getElementById('inputWrapper')!;

  streamingContentEl.textContent = `Error: ${error}`;
  streamingIndicator.style.background = 'rgba(220, 53, 69, 0.1)';

  cancelHint.style.display = 'none';
  inputWrapper.style.display = 'block';
  textarea.disabled = false;
  sendBtn.disabled = false;
  isStreaming = false;
}

async function handleStreamChunk(content: string): Promise<void> {
  streamingContent += content;

  const streamingContentEl = document.getElementById('streamingContent');
  if (streamingContentEl) {
    streamingContentEl.textContent = streamingContent;
  }

  // Auto-scroll messages container
  const messagesContainer = document.getElementById('messagesContainer');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

async function handleStreamEnd(fullContent: string): Promise<void> {
  if (!currentConversation) return;

  const streamingIndicator = document.getElementById('streamingIndicator')!;
  const streamingContentEl = document.getElementById('streamingContent')!;
  const cancelHint = document.getElementById('cancelHint')!;
  const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  const inputWrapper = document.getElementById('inputWrapper')!;

  // Add assistant message
  const assistantMessage: Message = {
    role: 'assistant',
    content: fullContent,
    timestamp: Date.now(),
  };
  currentConversation.messages.push(assistantMessage);
  currentConversation.updatedAt = Date.now();

  // Save to storage
  await Storage.saveConversation(currentConversation);

  // Update UI
  renderMessages();

  // Hide streaming indicator
  streamingIndicator.classList.remove('visible');
  streamingContentEl.textContent = '';
  streamingIndicator.style.background = '';
  cancelHint.style.display = 'none';
  inputWrapper.style.display = 'block';

  // Re-enable input
  textarea.disabled = false;
  sendBtn.disabled = false;
  isStreaming = false;
  streamingContent = '';

  textarea.focus();
}

function handleStreamError(error: string): void {
  setStreamingError(error);
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });

  // Handle placeholder translations
  const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.placeholder = t('input.placeholder') || 'Hoot me a question...';
  }
}

function createNewConversation(): Conversation {
  const defaultPersonaId = currentSettings?.defaultPersonaId || 'general';
  return {
    id: crypto.randomUUID(),
    title: t('history.newConversation') || 'New conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personaId: defaultPersonaId,
  };
}

async function init(): Promise<void> {
  // Initialize language
  await initLanguage();

  // Get conversation ID from URL
  const params = new URLSearchParams(window.location.search);
  conversationId = params.get('conversationId');

  // Set logo
  const logo = document.getElementById('logo') as HTMLImageElement;
  logo.src = chrome.runtime.getURL('icons/icon-48.png');

  // Apply translations
  applyTranslations();

  // Load settings and personas
  currentSettings = await Storage.getSettings();
  allPersonas = [...DEFAULT_PERSONAS, ...(currentSettings.customPersonas || [])];

  // Load or create conversation
  if (conversationId) {
    const conversations = await Storage.getConversations();
    currentConversation = conversations.find((c) => c.id === conversationId) || null;

    if (!currentConversation) {
      showError();
      return;
    }
  } else {
    // Create new conversation for fresh chat page
    currentConversation = createNewConversation();
    conversationId = currentConversation.id;

    // Update URL to include conversation ID (for refresh support)
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('conversationId', conversationId);
    window.history.replaceState({}, '', newUrl.toString());
  }

  // Show main content
  showMainContent();

  // Listen for streaming responses
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'streamChunk') {
      handleStreamChunk(message.payload.content);
    } else if (message.type === 'streamEnd') {
      handleStreamEnd(message.payload.content);
    } else if (message.type === 'streamError') {
      handleStreamError(message.payload.error);
    }
  });

  // Listen for Esc key to cancel streaming
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isStreaming) {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: 'cancelStream' });
      setStreamingError('Cancelled');
    }
  });

  // Settings button
  document.getElementById('settingsBtn')!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'openSettings' });
  });

  // History button
  document.getElementById('historyBtn')!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'openHistory' });
  });

  // Burn button (clear conversation)
  const burnBtn = document.getElementById('burnBtn')!;
  if (currentConversation.messages.length > 0) {
    burnBtn.style.display = 'flex';
  }
  burnBtn.addEventListener('click', async () => {
    if (currentConversation && currentConversation.messages.length > 0) {
      await Storage.deleteConversation(currentConversation.id);
      // Create new conversation and reset state
      currentConversation = createNewConversation();
      conversationId = currentConversation.id;

      // Update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('conversationId', conversationId);
      window.history.replaceState({}, '', newUrl.toString());

      burnBtn.style.display = 'none';
      renderMessages();
      renderContextToggle();
      renderPersonaSelector();
    }
  });

  // Send button
  document.getElementById('sendBtn')!.addEventListener('click', handleSendMessage);

  // Clear input button
  document.getElementById('clearInputBtn')!.addEventListener('click', () => {
    const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
    textarea.value = '';
    textarea.focus();
  });

  // Textarea handlers
  const textarea = document.getElementById('inputTextarea') as HTMLTextAreaElement;
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Auto-expand textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 48;
    const maxHeight = 144;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  });

  // Render UI
  renderMessages();
  renderContextToggle();
  renderPersonaSelector();

  // Focus textarea
  textarea.focus();
}

function showError(): void {
  document.getElementById('loadingState')!.style.display = 'none';
  document.getElementById('errorState')!.style.display = 'flex';
}

function showMainContent(): void {
  document.getElementById('loadingState')!.style.display = 'none';
  document.getElementById('mainContent')!.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', init);
