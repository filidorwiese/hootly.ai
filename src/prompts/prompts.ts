import { Storage } from '../shared/storage';
import type { SavedPrompt, Settings } from '../shared/types';
import { DEFAULT_PROMPTS } from '../shared/types';
import { t, initLanguage, getLocalizedPromptText } from '../shared/i18n';
import { injectTabHeader, registerExtensionTab } from '../shared/TabHeader';
import { initTheme } from '../shared/theme';

let currentSettings: Settings | null = null;

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

  return `
    <div class="prompt-item ${isBuiltIn ? 'builtin' : ''}" data-id="${prompt.id}">
      <div class="prompt-text ${escapedText.length > 150 ? 'prompt-text-preview' : ''}">${escapedText}</div>
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
