import { Storage } from '../shared/storage';
import type { SavedPrompt, Settings } from '../shared/types';
import { DEFAULT_PROMPTS } from '../shared/types';
import { t, initLanguage, getLocalizedPromptText } from '../shared/i18n';
import { injectTabHeader, registerExtensionTab } from '../shared/TabHeader';
import { initTheme } from '../shared/theme';

let currentSettings: Settings | null = null;
let deleteTargetId: string | null = null;

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderPromptItem(prompt: SavedPrompt, isBuiltIn: boolean): string {
  const displayText = isBuiltIn
    ? getLocalizedPromptText(prompt.id) || prompt.text
    : prompt.text;

  const escapedText = escapeHtml(displayText);

  const actionsHtml = isBuiltIn
    ? ''
    : `
      <div class="prompt-actions">
        <button class="action-btn edit-btn" data-id="${prompt.id}" data-i18n="settings.edit">${t('settings.edit')}</button>
        <button class="action-btn delete delete-btn" data-id="${prompt.id}" data-i18n="settings.delete">${t('settings.delete')}</button>
      </div>
    `;

  return `
    <div class="prompt-item ${isBuiltIn ? 'builtin' : ''}" data-id="${prompt.id}">
      <div class="prompt-header">
        <div class="prompt-text ${escapedText.length > 150 ? 'prompt-text-preview' : ''}">${escapedText}</div>
        ${actionsHtml}
      </div>
    </div>
  `;
}

function renderPromptLists(): void {
  if (!currentSettings) return;

  const customPrompts = currentSettings.customPrompts || [];

  const builtinList = document.getElementById('builtinList')!;
  const customList = document.getElementById('customList')!;
  const customEmptyState = document.getElementById('customEmptyState')!;

  builtinList.innerHTML = DEFAULT_PROMPTS.map((p) =>
    renderPromptItem(p, true)
  ).join('');

  if (customPrompts.length > 0) {
    customList.innerHTML = customPrompts.map((p) =>
      renderPromptItem(p, false)
    ).join('');
    customEmptyState.style.display = 'none';
  } else {
    customList.innerHTML = '';
    customEmptyState.style.display = 'block';
  }

  // Attach event listeners to action buttons
  attachActionListeners();
}

function attachActionListeners(): void {
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (id) openEditModal(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (id) showDeleteConfirm(id);
    });
  });
}

function showModal(isEdit: boolean = false): void {
  const modal = document.getElementById('promptModal')!;
  const title = document.getElementById('modalTitle')!;
  title.textContent = t(isEdit ? 'prompts.editPrompt' : 'prompts.addPrompt');
  modal.classList.add('visible');
}

function hideModal(): void {
  const modal = document.getElementById('promptModal')!;
  const textarea = document.getElementById('promptText') as HTMLTextAreaElement;
  const editingId = document.getElementById('editingPromptId') as HTMLInputElement;

  modal.classList.remove('visible');
  textarea.value = '';
  editingId.value = '';
}

function openAddModal(): void {
  const editingId = document.getElementById('editingPromptId') as HTMLInputElement;
  editingId.value = '';
  showModal(false);
}

function openEditModal(id: string): void {
  if (!currentSettings) return;

  const prompt = currentSettings.customPrompts?.find((p) => p.id === id);
  if (!prompt) return;

  const textarea = document.getElementById('promptText') as HTMLTextAreaElement;
  const editingId = document.getElementById('editingPromptId') as HTMLInputElement;

  textarea.value = prompt.text;
  editingId.value = id;
  showModal(true);
}

async function savePrompt(): Promise<void> {
  const textarea = document.getElementById('promptText') as HTMLTextAreaElement;
  const editingId = document.getElementById('editingPromptId') as HTMLInputElement;

  const text = textarea.value.trim();
  if (!text) return;

  const id = editingId.value || `custom_${Date.now()}`;

  const prompt: SavedPrompt = {
    id,
    text,
    isBuiltIn: false,
    createdAt: editingId.value
      ? currentSettings?.customPrompts?.find((p) => p.id === id)?.createdAt
      : Date.now(),
  };

  await Storage.savePrompt(prompt);
  currentSettings = await Storage.getSettings();

  hideModal();
  renderPromptLists();
}

function showDeleteConfirm(id: string): void {
  deleteTargetId = id;
  const dialog = document.getElementById('confirmDialog')!;
  dialog.classList.add('visible');
}

function hideDeleteConfirm(): void {
  deleteTargetId = null;
  const dialog = document.getElementById('confirmDialog')!;
  dialog.classList.remove('visible');
}

async function confirmDelete(): Promise<void> {
  if (!deleteTargetId) return;

  await Storage.deletePrompt(deleteTargetId);
  currentSettings = await Storage.getSettings();

  hideDeleteConfirm();
  renderPromptLists();
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });
}

async function init(): Promise<void> {
  await initLanguage();
  await initTheme();

  injectTabHeader({ activeTab: 'prompts' });
  await registerExtensionTab();

  currentSettings = await Storage.getSettings();

  applyTranslations();
  renderPromptLists();

  // Add button
  document.getElementById('addPromptBtn')!.addEventListener('click', openAddModal);

  // Modal buttons
  document.getElementById('cancelPromptBtn')!.addEventListener('click', hideModal);
  document.getElementById('savePromptBtn')!.addEventListener('click', savePrompt);

  // Confirm dialog buttons
  document.getElementById('cancelDelete')!.addEventListener('click', hideDeleteConfirm);
  document.getElementById('confirmDelete')!.addEventListener('click', confirmDelete);

  // Close modals on overlay click
  document.getElementById('promptModal')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });
  document.getElementById('confirmDialog')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideDeleteConfirm();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
