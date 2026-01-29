import { Storage } from '../shared/storage';
import type { Persona, Settings } from '../shared/types';
import { DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';

let currentSettings: Settings | null = null;
let pendingDeleteId: string | null = null;
let selectedIcon = '🤖';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderPersonaItem(persona: Persona, isDefault: boolean, isBuiltIn: boolean): string {
  const defaultBadge = isDefault ? `<span class="default-badge" data-i18n="personas.default">Default</span>` : '';
  const promptPreview = persona.systemPrompt ? escapeHtml(persona.systemPrompt.slice(0, 150)) + (persona.systemPrompt.length > 150 ? '...' : '') : '';

  const actions = isBuiltIn
    ? `<button class="action-btn set-default" data-id="${persona.id}" title="${t('personas.setDefault') || 'Set as default'}" ${isDefault ? 'disabled style="opacity: 0.5"' : ''}>
        ${t('personas.setDefault') || 'Set default'}
       </button>`
    : `<button class="action-btn set-default" data-id="${persona.id}" title="${t('personas.setDefault') || 'Set as default'}" ${isDefault ? 'disabled style="opacity: 0.5"' : ''}>
        ${t('personas.setDefault') || 'Set default'}
       </button>
       <button class="action-btn edit" data-id="${persona.id}" title="${t('settings.edit') || 'Edit'}">
        ${t('settings.edit') || 'Edit'}
       </button>
       <button class="action-btn delete" data-id="${persona.id}" title="${t('settings.delete') || 'Delete'}">
        ${t('settings.delete') || 'Delete'}
       </button>`;

  return `
    <div class="persona-item ${isBuiltIn ? 'builtin' : ''} ${isDefault ? 'default' : ''}" data-id="${persona.id}">
      <div class="persona-header">
        <span class="persona-icon">${persona.icon}</span>
        <div class="persona-info">
          <div class="persona-name">
            ${escapeHtml(persona.name)}
            ${defaultBadge}
          </div>
        </div>
        <div class="persona-actions">
          ${actions}
        </div>
      </div>
      ${promptPreview ? `<div class="persona-prompt">${promptPreview}</div>` : ''}
    </div>
  `;
}

function renderPersonaLists(): void {
  if (!currentSettings) return;

  const defaultPersonaId = currentSettings.defaultPersonaId || 'general';
  const customPersonas = currentSettings.customPersonas || [];

  const builtinList = document.getElementById('builtinList')!;
  const customList = document.getElementById('customList')!;
  const customEmptyState = document.getElementById('customEmptyState')!;

  builtinList.innerHTML = DEFAULT_PERSONAS.map((p) =>
    renderPersonaItem(p, p.id === defaultPersonaId, true)
  ).join('');

  if (customPersonas.length === 0) {
    customList.innerHTML = '';
    customEmptyState.style.display = 'block';
  } else {
    customEmptyState.style.display = 'none';
    customList.innerHTML = customPersonas.map((p) =>
      renderPersonaItem(p, p.id === defaultPersonaId, false)
    ).join('');
  }

  attachEventListeners();
}

function attachEventListeners(): void {
  document.querySelectorAll('.persona-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('action-btn')) return;
      item.classList.toggle('expanded');
    });
  });

  document.querySelectorAll('.action-btn.set-default').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        await setDefaultPersona(id);
      }
    });
  });

  document.querySelectorAll('.action-btn.edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        editPersona(id);
      }
    });
  });

  document.querySelectorAll('.action-btn.delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        showDeleteConfirm(id);
      }
    });
  });
}

async function setDefaultPersona(id: string): Promise<void> {
  await Storage.saveSettings({ defaultPersonaId: id });
  currentSettings = await Storage.getSettings();
  renderPersonaLists();
}

function editPersona(id: string): void {
  const customPersonas = currentSettings?.customPersonas || [];
  const persona = customPersonas.find((p) => p.id === id);
  if (persona) {
    showModal(persona);
  }
}

function showModal(persona?: Persona): void {
  const modal = document.getElementById('personaModal')!;
  const modalTitle = document.getElementById('modalTitle')!;
  const editingId = document.getElementById('editingPersonaId') as HTMLInputElement;
  const nameInput = document.getElementById('personaName') as HTMLInputElement;
  const promptInput = document.getElementById('personaSystemPrompt') as HTMLTextAreaElement;

  if (persona) {
    modalTitle.textContent = t('personas.editPersona') || 'Edit Persona';
    editingId.value = persona.id;
    nameInput.value = persona.name;
    promptInput.value = persona.systemPrompt;
    selectedIcon = persona.icon;
  } else {
    modalTitle.textContent = t('personas.addPersona') || 'Add Persona';
    editingId.value = '';
    nameInput.value = '';
    promptInput.value = '';
    selectedIcon = '🤖';
  }

  updateIconSelection();
  modal.classList.add('visible');
  nameInput.focus();
}

function hideModal(): void {
  const modal = document.getElementById('personaModal')!;
  modal.classList.remove('visible');
}

function updateIconSelection(): void {
  document.querySelectorAll('.icon-option').forEach((opt) => {
    const icon = (opt as HTMLElement).dataset.icon;
    opt.classList.toggle('selected', icon === selectedIcon);
  });
}

async function savePersona(): Promise<void> {
  const editingId = (document.getElementById('editingPersonaId') as HTMLInputElement).value;
  const name = (document.getElementById('personaName') as HTMLInputElement).value.trim();
  const systemPrompt = (document.getElementById('personaSystemPrompt') as HTMLTextAreaElement).value.trim();

  if (!name) {
    (document.getElementById('personaName') as HTMLInputElement).focus();
    return;
  }

  const customPersonas = currentSettings?.customPersonas || [];

  if (editingId) {
    const idx = customPersonas.findIndex((p) => p.id === editingId);
    if (idx >= 0) {
      customPersonas[idx] = {
        ...customPersonas[idx],
        name,
        systemPrompt,
        icon: selectedIcon,
      };
    }
  } else {
    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name,
      systemPrompt,
      icon: selectedIcon,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    customPersonas.push(newPersona);
  }

  await Storage.saveSettings({ customPersonas });
  currentSettings = await Storage.getSettings();
  renderPersonaLists();
  hideModal();
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

async function deletePersona(): Promise<void> {
  if (!pendingDeleteId || !currentSettings) return;

  const customPersonas = (currentSettings.customPersonas || []).filter(
    (p) => p.id !== pendingDeleteId
  );

  const updates: Partial<Settings> = { customPersonas };

  if (currentSettings.defaultPersonaId === pendingDeleteId) {
    updates.defaultPersonaId = 'general';
  }

  await Storage.saveSettings(updates);
  currentSettings = await Storage.getSettings();
  renderPersonaLists();
  hideDeleteConfirm();
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
  await initLanguage();

  currentSettings = await Storage.getSettings();

  const logo = document.getElementById('logo') as HTMLImageElement;
  logo.src = chrome.runtime.getURL('icons/icon-48.png');

  applyTranslations();
  renderPersonaLists();

  document.getElementById('backBtn')!.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('addPersonaBtn')!.addEventListener('click', () => {
    showModal();
  });

  document.querySelectorAll('.icon-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      selectedIcon = (opt as HTMLElement).dataset.icon || '🤖';
      updateIconSelection();
    });
  });

  document.getElementById('cancelPersonaBtn')!.addEventListener('click', hideModal);
  document.getElementById('savePersonaBtn')!.addEventListener('click', savePersona);

  document.getElementById('personaModal')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  });

  document.getElementById('cancelDelete')!.addEventListener('click', hideDeleteConfirm);
  document.getElementById('confirmDelete')!.addEventListener('click', deletePersona);

  document.getElementById('confirmDialog')!.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideDeleteConfirm();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
