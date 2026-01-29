import { Storage } from '../shared/storage';
import type { Conversation, Persona } from '../shared/types';
import { DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';

interface DateGroup {
  label: string;
  conversations: Conversation[];
}

let allPersonas: Persona[] = [];
let pendingDeleteId: string | null = null;

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

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });
}

async function init(): Promise<void> {
  // Initialize language
  await initLanguage();

  // Load personas
  const settings = await Storage.getSettings();
  allPersonas = [...DEFAULT_PERSONAS, ...(settings.customPersonas || [])];

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
