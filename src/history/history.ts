import { Storage } from '../shared/storage';
import type { Conversation, Persona, Message, Settings } from '../shared/types';
import { DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';
import { getApiKey } from '../shared/providers';

interface DateGroup {
  label: string;
  conversations: Conversation[];
}

let allPersonas: Persona[] = [];
let pendingDeleteId: string | null = null;
let currentSettings: Settings | null = null;
let activeConversationId: string | null = null;
let isStreaming = false;
let streamingContent = '';

// Import state
let pendingImportData: Conversation[] | null = null;

// Context toggle state per conversation
const contextEnabledMap: Map<string, boolean> = new Map();

// Group conversations by date categories
function groupByDate(conversations: Conversation[]): DateGroup[] {
  const now = Date.now();
  const today = new Date(now).setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const thisWeek = today - 7 * 24 * 60 * 60 * 1000;
  const thisMonth = today - 30 * 24 * 60 * 60 * 1000;

  const groups: Record<string, Conversation[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  conversations.forEach((conv) => {
    const updated = conv.updatedAt;
    if (updated >= today) {
      groups.today.push(conv);
    } else if (updated >= yesterday) {
      groups.yesterday.push(conv);
    } else if (updated >= thisWeek) {
      groups.thisWeek.push(conv);
    } else if (updated >= thisMonth) {
      groups.thisMonth.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  const result: DateGroup[] = [];
  if (groups.today.length > 0) result.push({ label: t('history.today') || 'Today', conversations: groups.today });
  if (groups.yesterday.length > 0) result.push({ label: t('history.yesterday') || 'Yesterday', conversations: groups.yesterday });
  if (groups.thisWeek.length > 0) result.push({ label: t('history.thisWeek') || 'This Week', conversations: groups.thisWeek });
  if (groups.thisMonth.length > 0) result.push({ label: t('history.thisMonth') || 'This Month', conversations: groups.thisMonth });
  if (groups.older.length > 0) result.push({ label: t('history.older') || 'Older', conversations: groups.older });

  return result;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPersonaIcon(personaId?: string): string {
  if (!personaId) return '';
  const persona = allPersonas.find((p) => p.id === personaId);
  return persona?.icon || '';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get the first context found in a conversation's messages
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

function renderConversation(conv: Conversation): string {
  const personaIcon = getPersonaIcon(conv.personaId);
  const messageCount = conv.messages.length;
  const messagesLabel = t('history.messages', { count: messageCount }) || `${messageCount} msgs`;

  const messagesHtml = conv.messages
    .map(
      (msg) => `
      <div class="message ${msg.role}">
        <div class="message-role">${msg.role === 'user' ? t('response.you') || 'You' : 'Claude'}</div>
        <div class="message-content">${escapeHtml(msg.content)}</div>
      </div>
    `
    )
    .join('');

  const continueLabel = t('history.continue') || 'Continue';
  const sendLabel = t('input.send') || 'Send';
  const placeholder = t('input.placeholder') || 'Hoot me a question...';

  // Check if conversation has context
  const originalContext = getConversationContext(conv);
  const hasContext = originalContext !== null;
  const contextEnabled = contextEnabledMap.get(conv.id) || false;

  // Build context toggle HTML
  let contextToggleHtml = '';
  if (hasContext) {
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

    contextToggleHtml = `
      <div class="context-toggle" data-id="${conv.id}">
        <button class="context-toggle-btn ${contextEnabled ? 'enabled' : ''}" data-id="${conv.id}" title="${toggleTitle}">
          🌐
        </button>
        <span class="context-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  } else {
    // No context available - show disabled state
    const noContextLabel = t('history.noOriginalContext') || 'No page context';
    contextToggleHtml = `
      <div class="context-toggle" data-id="${conv.id}">
        <button class="context-toggle-btn" data-id="${conv.id}" disabled title="${noContextLabel}">
          🌐
        </button>
        <span class="context-badge unavailable">${noContextLabel}</span>
      </div>
    `;
  }

  return `
    <div class="conversation-item" data-id="${conv.id}">
      <div class="conversation-header">
        <div class="conversation-title">${escapeHtml(conv.title)}</div>
        <div class="conversation-meta">
          ${personaIcon ? `<span class="persona-icon">${personaIcon}</span>` : ''}
          <span>${formatDate(conv.updatedAt)}</span>
          <span>${messagesLabel}</span>
          <div class="conversation-actions">
            <button class="action-btn view-btn" data-id="${conv.id}" title="${t('history.view') || 'View'}">
              ${t('history.view') || 'View'}
            </button>
            <button class="action-btn continue" data-id="${conv.id}" title="${continueLabel}">
              ${continueLabel}
            </button>
            <button class="action-btn delete" data-id="${conv.id}" title="${t('history.delete') || 'Delete'}">
              ${t('settings.delete') || 'Delete'}
            </button>
          </div>
        </div>
      </div>
      <div class="conversation-messages">
        ${messagesHtml}
      </div>
      <div class="input-area" data-id="${conv.id}">
        <div class="streaming-indicator" data-id="${conv.id}">
          <div class="message-role">Claude</div>
          <div class="streaming-content"></div>
        </div>
        <div class="cancel-hint" style="display: none;" data-id="${conv.id}">
          Press <strong>Esc</strong> to stop generating
        </div>
        <div class="input-footer">
          ${contextToggleHtml}
        </div>
        <div class="input-wrapper">
          <textarea class="input-textarea" data-id="${conv.id}" placeholder="${placeholder}" rows="2"></textarea>
          <button class="send-btn" data-id="${conv.id}" title="${sendLabel}">▶</button>
          <button class="clear-btn" data-id="${conv.id}" title="${t('input.clear') || 'Clear'}">✕</button>
        </div>
      </div>
    </div>
  `;
}

function renderHistoryList(conversations: Conversation[]): void {
  const container = document.getElementById('historyList')!;
  const emptyState = document.getElementById('emptyState')!;

  if (conversations.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Sort by updatedAt descending
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = groupByDate(sorted);

  container.innerHTML = groups
    .map(
      (group) => `
      <div class="date-group">
        <div class="date-group-header">${group.label}</div>
        ${group.conversations.map(renderConversation).join('')}
      </div>
    `
    )
    .join('');

  // Add click handlers
  container.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      const item = container.querySelector(`.conversation-item[data-id="${id}"]`);
      if (item) {
        item.classList.toggle('expanded');
      }
    });
  });

  container.querySelectorAll('.action-btn.delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        showDeleteConfirm(id);
      }
    });
  });

  // Click on item header toggles expand
  container.querySelectorAll('.conversation-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('action-btn')) return;
      const item = header.closest('.conversation-item');
      if (item) {
        item.classList.toggle('expanded');
      }
    });
  });

  // Continue button handlers
  container.querySelectorAll('.action-btn.continue').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        startContinueConversation(id);
      }
    });
  });

  // Send button handlers
  container.querySelectorAll('.send-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        handleSendMessage(id);
      }
    });
  });

  // Clear button handlers
  container.querySelectorAll('.clear-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        const textarea = container.querySelector(`.input-textarea[data-id="${id}"]`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = '';
          textarea.focus();
        }
      }
    });
  });

  // Context toggle handlers
  container.querySelectorAll('.context-toggle-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        handleContextToggle(id, conversations);
      }
    });
  });

  // Textarea Enter key handlers
  container.querySelectorAll('.input-textarea').forEach((textarea) => {
    textarea.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' && !ke.shiftKey) {
        e.preventDefault();
        const id = (textarea as HTMLElement).dataset.id;
        if (id) {
          handleSendMessage(id);
        }
      }
    });

    // Auto-expand textarea
    textarea.addEventListener('input', () => {
      const ta = textarea as HTMLTextAreaElement;
      ta.style.height = 'auto';
      const scrollHeight = ta.scrollHeight;
      const minHeight = 48;
      const maxHeight = 144;
      ta.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    });
  });
}

function showDeleteConfirm(id: string): void {
  pendingDeleteId = id;
  const dialog = document.getElementById('confirmDialog')!;
  dialog.classList.add('visible');
}

function hideDeleteConfirm(): void {
  pendingDeleteId = null;
  const dialog = document.getElementById('confirmDialog')!;
  dialog.classList.remove('visible');
}

async function deleteConversation(id: string): Promise<void> {
  await Storage.deleteConversation(id);
  const conversations = await Storage.getConversations();
  renderHistoryList(conversations);
}

function handleContextToggle(convId: string, conversations: Conversation[]): void {
  const currentEnabled = contextEnabledMap.get(convId) || false;
  contextEnabledMap.set(convId, !currentEnabled);

  // Re-render the history list to update the UI
  renderHistoryList(conversations);

  // Re-expand and continue the conversation that was active
  const container = document.getElementById('historyList')!;
  const item = container.querySelector(`.conversation-item[data-id="${convId}"]`);
  if (item) {
    item.classList.add('expanded');
    item.classList.add('continuing');

    // Focus the textarea
    const textarea = item.querySelector('.input-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }
}

function startContinueConversation(id: string): void {
  const container = document.getElementById('historyList')!;

  // Close any other continuing conversations
  container.querySelectorAll('.conversation-item.continuing').forEach((item) => {
    item.classList.remove('continuing');
  });

  // Open this conversation for continuing
  const item = container.querySelector(`.conversation-item[data-id="${id}"]`);
  if (item) {
    item.classList.add('expanded');
    item.classList.add('continuing');
    activeConversationId = id;

    // Focus the textarea
    const textarea = item.querySelector('.input-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }
}

async function handleSendMessage(convId: string): Promise<void> {
  if (isStreaming) return;

  const container = document.getElementById('historyList')!;
  const textarea = container.querySelector(`.input-textarea[data-id="${convId}"]`) as HTMLTextAreaElement;
  const streamingIndicator = container.querySelector(`.streaming-indicator[data-id="${convId}"]`) as HTMLElement;
  const cancelHint = container.querySelector(`.cancel-hint[data-id="${convId}"]`) as HTMLElement;
  const sendBtn = container.querySelector(`.send-btn[data-id="${convId}"]`) as HTMLButtonElement;
  const messagesContainer = container.querySelector(`.conversation-item[data-id="${convId}"] .conversation-messages`) as HTMLElement;

  if (!textarea || !textarea.value.trim()) return;

  const prompt = textarea.value.trim();
  textarea.value = '';
  textarea.disabled = true;
  sendBtn.disabled = true;
  isStreaming = true;
  streamingContent = '';

  // Add user message to UI immediately
  const userMessageHtml = `
    <div class="message user">
      <div class="message-role">${t('response.you') || 'You'}</div>
      <div class="message-content">${escapeHtml(prompt)}</div>
    </div>
  `;
  messagesContainer.insertAdjacentHTML('beforeend', userMessageHtml);

  // Show streaming indicator
  streamingIndicator.classList.add('visible');
  const streamingContentEl = streamingIndicator.querySelector('.streaming-content') as HTMLElement;
  streamingContentEl.textContent = t('response.thinking') || 'Thinking...';
  cancelHint.style.display = 'block';

  // Get conversation and settings
  const conversations = await Storage.getConversations();
  const conversation = conversations.find((c) => c.id === convId);
  if (!conversation || !currentSettings) {
    setStreamingError(convId, 'Conversation not found');
    return;
  }

  // Get persona system prompt
  const persona = allPersonas.find((p) => p.id === conversation.personaId);
  let combinedSystemPrompt = persona?.systemPrompt || '';
  if (currentSettings.systemPrompt) {
    combinedSystemPrompt = combinedSystemPrompt
      ? `${combinedSystemPrompt}\n\n${currentSettings.systemPrompt}`
      : currentSettings.systemPrompt;
  }

  // Build context if enabled
  let context = undefined;
  const contextEnabled = contextEnabledMap.get(convId) || false;
  if (contextEnabled) {
    const originalContext = getConversationContext(conversation);
    if (originalContext) {
      if (originalContext.type === 'selection') {
        context = {
          url: originalContext.url,
          title: originalContext.title,
          selection: originalContext.content,
        };
      } else {
        context = {
          url: originalContext.url,
          title: originalContext.title,
          fullPage: originalContext.content,
        };
      }
    }
  }

  // Add user message to conversation
  const userMessage: Message = {
    role: 'user',
    content: prompt,
    timestamp: Date.now(),
    context,
  };
  conversation.messages.push(userMessage);

  // Send to API
  try {
    const apiKey = getApiKey(currentSettings);
    if (!apiKey) {
      setStreamingError(convId, t('dialog.noApiKey') || 'No API key configured');
      return;
    }

    await chrome.runtime.sendMessage({
      type: 'sendPrompt',
      payload: {
        prompt,
        context,
        conversationHistory: conversation.messages.slice(0, -1), // Exclude the new user message, it's added in payload
        settings: { ...currentSettings, systemPrompt: combinedSystemPrompt },
      },
    });

    // Store conversation ref for the message listener
    activeConversationId = convId;
  } catch (err) {
    setStreamingError(convId, err instanceof Error ? err.message : 'Failed to send message');
  }
}

function setStreamingError(convId: string, error: string): void {
  const container = document.getElementById('historyList')!;
  const streamingIndicator = container.querySelector(`.streaming-indicator[data-id="${convId}"]`) as HTMLElement;
  const cancelHint = container.querySelector(`.cancel-hint[data-id="${convId}"]`) as HTMLElement;
  const textarea = container.querySelector(`.input-textarea[data-id="${convId}"]`) as HTMLTextAreaElement;
  const sendBtn = container.querySelector(`.send-btn[data-id="${convId}"]`) as HTMLButtonElement;

  const streamingContentEl = streamingIndicator.querySelector('.streaming-content') as HTMLElement;
  streamingContentEl.textContent = `Error: ${error}`;
  streamingIndicator.style.background = 'rgba(220, 53, 69, 0.1)';

  cancelHint.style.display = 'none';
  textarea.disabled = false;
  sendBtn.disabled = false;
  isStreaming = false;
}

async function handleStreamChunk(content: string): Promise<void> {
  if (!activeConversationId) return;

  streamingContent += content;

  const container = document.getElementById('historyList')!;
  const streamingIndicator = container.querySelector(`.streaming-indicator[data-id="${activeConversationId}"]`) as HTMLElement;
  const streamingContentEl = streamingIndicator?.querySelector('.streaming-content') as HTMLElement;

  if (streamingContentEl) {
    streamingContentEl.textContent = streamingContent;
  }
}

async function handleStreamEnd(fullContent: string): Promise<void> {
  if (!activeConversationId) return;

  const convId = activeConversationId;
  const container = document.getElementById('historyList')!;
  const streamingIndicator = container.querySelector(`.streaming-indicator[data-id="${convId}"]`) as HTMLElement;
  const cancelHint = container.querySelector(`.cancel-hint[data-id="${convId}"]`) as HTMLElement;
  const textarea = container.querySelector(`.input-textarea[data-id="${convId}"]`) as HTMLTextAreaElement;
  const sendBtn = container.querySelector(`.send-btn[data-id="${convId}"]`) as HTMLButtonElement;
  const messagesContainer = container.querySelector(`.conversation-item[data-id="${convId}"] .conversation-messages`) as HTMLElement;

  // Add assistant message to UI
  const assistantMessageHtml = `
    <div class="message assistant">
      <div class="message-role">Claude</div>
      <div class="message-content">${escapeHtml(fullContent)}</div>
    </div>
  `;
  messagesContainer.insertAdjacentHTML('beforeend', assistantMessageHtml);

  // Hide streaming indicator
  streamingIndicator.classList.remove('visible');
  const streamingContentEl = streamingIndicator.querySelector('.streaming-content') as HTMLElement;
  streamingContentEl.textContent = '';
  streamingIndicator.style.background = '';
  cancelHint.style.display = 'none';

  // Re-enable input
  textarea.disabled = false;
  sendBtn.disabled = false;
  isStreaming = false;
  streamingContent = '';

  // Update conversation in storage
  const conversations = await Storage.getConversations();
  const conversation = conversations.find((c) => c.id === convId);
  if (conversation) {
    const assistantMessage: Message = {
      role: 'assistant',
      content: fullContent,
      timestamp: Date.now(),
    };
    conversation.messages.push(assistantMessage);
    conversation.updatedAt = Date.now();
    await Storage.saveConversation(conversation);
  }

  textarea.focus();
}

function handleStreamError(error: string): void {
  if (activeConversationId) {
    setStreamingError(activeConversationId, error);
  }
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });
}

// Import dialog functions
function showImportDialog(): void {
  const dialog = document.getElementById('importDialog')!;
  dialog.classList.add('visible');
  resetImportDialog();
}

function hideImportDialog(): void {
  const dialog = document.getElementById('importDialog')!;
  dialog.classList.remove('visible');
  resetImportDialog();
}

function resetImportDialog(): void {
  pendingImportData = null;
  const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
  const fileInfo = document.getElementById('importFileInfo')!;
  const modeSection = document.getElementById('importModeSection')!;
  const errorEl = document.getElementById('importError')!;
  const successEl = document.getElementById('importSuccess')!;
  const confirmBtn = document.getElementById('confirmImport') as HTMLButtonElement;
  const selectBtn = document.getElementById('selectFileBtn')!;

  fileInput.value = '';
  fileInfo.style.display = 'none';
  modeSection.style.display = 'none';
  errorEl.style.display = 'none';
  successEl.style.display = 'none';
  confirmBtn.disabled = true;
  selectBtn.style.display = 'block';
}

function showImportError(message: string): void {
  const errorEl = document.getElementById('importError')!;
  const successEl = document.getElementById('importSuccess')!;
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  successEl.style.display = 'none';
}

function showImportSuccess(message: string): void {
  const errorEl = document.getElementById('importError')!;
  const successEl = document.getElementById('importSuccess')!;
  successEl.textContent = message;
  successEl.style.display = 'block';
  errorEl.style.display = 'none';
}

interface ImportExportData {
  version?: string;
  exportedAt?: string;
  conversations: Conversation[];
}

function validateImportData(data: unknown): data is ImportExportData {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.conversations)) return false;

  // Validate each conversation has required fields
  for (const conv of obj.conversations) {
    if (typeof conv !== 'object' || !conv) return false;
    const c = conv as Record<string, unknown>;
    if (typeof c.id !== 'string' || !c.id) return false;
    if (typeof c.title !== 'string') return false;
    if (typeof c.createdAt !== 'number') return false;
    if (typeof c.updatedAt !== 'number') return false;
    if (!Array.isArray(c.messages)) return false;

    // Validate each message
    for (const msg of c.messages) {
      if (typeof msg !== 'object' || !msg) return false;
      const m = msg as Record<string, unknown>;
      if (m.role !== 'user' && m.role !== 'assistant') return false;
      if (typeof m.content !== 'string') return false;
      if (typeof m.timestamp !== 'number') return false;
    }
  }

  return true;
}

async function handleFileSelect(file: File): Promise<void> {
  const fileInfo = document.getElementById('importFileInfo')!;
  const fileName = document.getElementById('importFileName')!;
  const convCount = document.getElementById('importConvCount')!;
  const modeSection = document.getElementById('importModeSection')!;
  const confirmBtn = document.getElementById('confirmImport') as HTMLButtonElement;
  const selectBtn = document.getElementById('selectFileBtn')!;
  const errorEl = document.getElementById('importError')!;

  // Reset error state
  errorEl.style.display = 'none';

  try {
    const text = await file.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      showImportError(t('history.importInvalidJson') || 'Invalid JSON file');
      return;
    }

    if (!validateImportData(data)) {
      showImportError(t('history.importInvalidFormat') || 'Invalid file format');
      return;
    }

    if (data.conversations.length === 0) {
      showImportError(t('history.importEmpty') || 'No conversations in file');
      return;
    }

    // Store data for import
    pendingImportData = data.conversations;

    // Show file info
    fileName.textContent = file.name;
    const countText = t('history.importConvCount', { count: data.conversations.length }) ||
      `${data.conversations.length} conversation(s)`;
    convCount.textContent = countText;

    fileInfo.style.display = 'flex';
    modeSection.style.display = 'flex';
    selectBtn.style.display = 'none';
    confirmBtn.disabled = false;
  } catch (err) {
    showImportError(t('history.importReadError') || 'Failed to read file');
  }
}

async function performImport(mode: 'merge' | 'replace'): Promise<void> {
  if (!pendingImportData) return;

  const confirmBtn = document.getElementById('confirmImport') as HTMLButtonElement;
  confirmBtn.disabled = true;

  try {
    if (mode === 'replace') {
      // Replace all: clear existing and save new
      await chrome.storage.local.set({ hootly_conversations: pendingImportData });
    } else {
      // Merge: add new conversations, skip duplicates by id
      const existing = await Storage.getConversations();
      const existingIds = new Set(existing.map(c => c.id));

      const toAdd = pendingImportData.filter(c => !existingIds.has(c.id));
      const merged = [...existing, ...toAdd];

      await chrome.storage.local.set({ hootly_conversations: merged });
    }

    const successMsg = t('history.importSuccess') || 'Import successful!';
    showImportSuccess(successMsg);

    // Refresh the list after a short delay
    setTimeout(async () => {
      hideImportDialog();
      const conversations = await Storage.getConversations();
      renderHistoryList(conversations);
    }, 1500);
  } catch (err) {
    showImportError(t('history.importFailed') || 'Import failed');
    confirmBtn.disabled = false;
  }
}

async function exportHistory(): Promise<void> {
  const conversations = await Storage.getConversations();

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    conversations,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `hootly-history-${timestamp}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

async function init(): Promise<void> {
  // Initialize language
  await initLanguage();

  // Load settings and personas
  currentSettings = await Storage.getSettings();
  allPersonas = [...DEFAULT_PERSONAS, ...(currentSettings.customPersonas || [])];

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
      if (activeConversationId) {
        setStreamingError(activeConversationId, 'Cancelled');
      }
    }
  });

  // Set logo
  const logo = document.getElementById('logo') as HTMLImageElement;
  logo.src = chrome.runtime.getURL('icons/icon-48.png');

  // Apply translations
  applyTranslations();

  // Load and render conversations
  const conversations = await Storage.getConversations();
  renderHistoryList(conversations);

  // Close button handler
  document.getElementById('closeBtn')!.addEventListener('click', (e) => {
    e.preventDefault();
    window.close();
  });

  // Export button handler
  document.getElementById('exportBtn')!.addEventListener('click', () => {
    exportHistory();
  });

  // Import button handler
  document.getElementById('importBtn')!.addEventListener('click', () => {
    showImportDialog();
  });

  // Import dialog handlers
  document.getElementById('cancelImport')!.addEventListener('click', hideImportDialog);

  document.getElementById('selectFileBtn')!.addEventListener('click', () => {
    document.getElementById('importFileInput')!.click();
  });

  document.getElementById('importFileInput')!.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      handleFileSelect(input.files[0]);
    }
  });

  document.getElementById('confirmImport')!.addEventListener('click', () => {
    const modeInput = document.querySelector('input[name="importMode"]:checked') as HTMLInputElement;
    const mode = (modeInput?.value || 'merge') as 'merge' | 'replace';
    performImport(mode);
  });

  // Click outside import dialog to cancel
  document.getElementById('importDialog')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideImportDialog();
    }
  });

  // Delete confirmation handlers
  document.getElementById('cancelDelete')!.addEventListener('click', hideDeleteConfirm);
  document.getElementById('confirmDelete')!.addEventListener('click', async () => {
    if (pendingDeleteId) {
      await deleteConversation(pendingDeleteId);
      hideDeleteConfirm();
    }
  });

  // Click outside dialog to cancel
  document.getElementById('confirmDialog')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideDeleteConfirm();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
