import { Storage } from '../shared/storage';
import type { Conversation, Persona, Settings } from '../shared/types';
import { DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';

interface DateGroup {
  label: string;
  conversations: Conversation[];
}

let allPersonas: Persona[] = [];
let pendingDeleteId: string | null = null;
let currentSettings: Settings | null = null;

// Import state
let pendingImportData: Conversation[] | null = null;

// Search state
let allConversations: Conversation[] = [];
let currentSearchQuery = '';

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

// Search conversations by title and message content
function filterConversations(conversations: Conversation[], query: string): Conversation[] {
  if (!query.trim()) return conversations;

  const lowerQuery = query.toLowerCase().trim();

  return conversations.filter((conv) => {
    // Check title match
    if (conv.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check message content match
    for (const msg of conv.messages) {
      if (msg.content.toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }

    return false;
  });
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
    </div>
  `;
}

function renderHistoryList(conversations: Conversation[]): void {
  const container = document.getElementById('historyList')!;
  const emptyState = document.getElementById('emptyState')!;
  const noResultsState = document.getElementById('noResultsState')!;

  // Apply search filter
  const filtered = filterConversations(conversations, currentSearchQuery);

  // Handle empty states
  if (allConversations.length === 0) {
    // No conversations at all
    container.innerHTML = '';
    emptyState.style.display = 'block';
    noResultsState.style.display = 'none';
    return;
  }

  if (filtered.length === 0 && currentSearchQuery) {
    // No results for search query
    container.innerHTML = '';
    emptyState.style.display = 'none';
    noResultsState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  noResultsState.style.display = 'none';

  // Sort by updatedAt descending
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
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

  // Continue button handlers - opens popup window
  container.querySelectorAll('.action-btn.continue').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        openContinuePopup(id);
      }
    });
  });
}

function openContinuePopup(conversationId: string): void {
  chrome.runtime.sendMessage({
    type: 'continueConversation',
    payload: { conversationId },
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

function showClearAllConfirm(): void {
  const dialog = document.getElementById('clearAllDialog')!;
  dialog.classList.add('visible');
}

function hideClearAllConfirm(): void {
  const dialog = document.getElementById('clearAllDialog')!;
  dialog.classList.remove('visible');
}

async function clearAllHistory(): Promise<void> {
  await chrome.storage.local.set({ hootly_conversations: [] });
  allConversations = [];
  renderHistoryList(allConversations);
}

async function deleteConversation(id: string): Promise<void> {
  await Storage.deleteConversation(id);
  allConversations = await Storage.getConversations();
  renderHistoryList(allConversations);
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
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')!;
    const translated = t(key);
    if (translated) {
      (el as HTMLInputElement).placeholder = translated;
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
      allConversations = await Storage.getConversations();
      renderHistoryList(allConversations);
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

  // Set logo
  const logo = document.getElementById('logo') as HTMLImageElement;
  logo.src = chrome.runtime.getURL('icons/icon-48.png');

  // Apply translations
  applyTranslations();

  // Load and render conversations
  allConversations = await Storage.getConversations();
  renderHistoryList(allConversations);

  // Search input handlers
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const clearSearchBtn = document.getElementById('clearSearchBtn')!;

  searchInput.addEventListener('input', () => {
    currentSearchQuery = searchInput.value;
    clearSearchBtn.style.display = currentSearchQuery ? 'flex' : 'none';
    renderHistoryList(allConversations);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderHistoryList(allConversations);
    searchInput.focus();
  });

  // Close button handler
  document.getElementById('closeBtn')!.addEventListener('click', (e) => {
    e.preventDefault();
    window.close();
  });

  // Export button handler
  document.getElementById('exportBtn')!.addEventListener('click', () => {
    exportHistory();
  });

  // Clear All button handler
  document.getElementById('clearAllBtn')!.addEventListener('click', () => {
    showClearAllConfirm();
  });

  // Clear All confirmation handlers
  document.getElementById('cancelClearAll')!.addEventListener('click', hideClearAllConfirm);
  document.getElementById('confirmClearAll')!.addEventListener('click', async () => {
    await clearAllHistory();
    hideClearAllConfirm();
  });

  // Click outside clear all dialog to cancel
  document.getElementById('clearAllDialog')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideClearAllConfirm();
    }
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
