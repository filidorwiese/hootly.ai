import { Storage } from '../shared/storage';
import { Settings, ModelConfig } from '../shared/types';
import { t, initLanguage, setLanguage } from '../shared/i18n';
import { selectDefaultModel } from '../shared/models';

function getBrowserLanguage(): string {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.split('-')[0].toLowerCase();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });
}

function populateModelSelect(modelSelect: HTMLSelectElement, models: ModelConfig[], currentValue?: string) {
  modelSelect.innerHTML = '';

  if (models.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = t('settings.noModels');
    modelSelect.appendChild(option);
    return;
  }

  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    modelSelect.appendChild(option);
  });

  if (currentValue && models.some(m => m.id === currentValue)) {
    modelSelect.value = currentValue;
  } else if (models.length > 0) {
    // Auto-select default model
    const defaultModel = selectDefaultModel(models);
    if (defaultModel) {
      modelSelect.value = defaultModel;
    }
  }
}

function setModelSelectState(modelSelect: HTMLSelectElement, state: 'loading' | 'disabled' | 'enabled', message?: string) {
  modelSelect.innerHTML = '';
  const option = document.createElement('option');

  switch (state) {
    case 'loading':
      option.value = '';
      option.textContent = t('settings.loadingModels');
      modelSelect.appendChild(option);
      modelSelect.disabled = true;
      break;
    case 'disabled':
      option.value = '';
      option.textContent = message || t('settings.enterApiKeyFirst');
      modelSelect.appendChild(option);
      modelSelect.disabled = true;
      break;
    case 'enabled':
      modelSelect.disabled = false;
      break;
  }
}

async function fetchModelsFromBackground(): Promise<{ success: boolean; models?: ModelConfig[]; error?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'fetchModels' }, (response) => {
      resolve(response || { success: false, error: 'No response from background' });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize language first
  await initLanguage();
  applyTranslations();

  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelSelect = document.getElementById('model') as HTMLSelectElement;
  const maxTokensInput = document.getElementById('maxTokens') as HTMLInputElement;
  const temperatureInput = document.getElementById('temperature') as HTMLInputElement;
  const shortcutInput = document.getElementById('shortcut') as HTMLInputElement;
  const languageSelect = document.getElementById('language') as HTMLSelectElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  // Load current settings
  const settings = await Storage.getSettings();

  // Populate form fields
  apiKeyInput.value = settings.apiKey;
  maxTokensInput.value = settings.maxTokens.toString();
  temperatureInput.value = settings.temperature.toString();
  shortcutInput.value = settings.shortcut;
  languageSelect.value = settings.language;

  // Track current models for language updates
  let currentModels: ModelConfig[] = [];

  // Fetch and populate models
  async function loadModels() {
    if (!apiKeyInput.value.trim()) {
      setModelSelectState(modelSelect, 'disabled');
      return;
    }

    setModelSelectState(modelSelect, 'loading');

    const result = await fetchModelsFromBackground();

    if (result.success && result.models) {
      currentModels = result.models;
      modelSelect.disabled = false;
      populateModelSelect(modelSelect, result.models, settings.model);
    } else {
      setModelSelectState(modelSelect, 'disabled', result.error || t('settings.fetchModelsFailed'));
    }
  }

  // Load models on page load
  await loadModels();

  // Refetch models when API key changes
  let apiKeyDebounce: number | null = null;
  apiKeyInput.addEventListener('input', () => {
    if (apiKeyDebounce) clearTimeout(apiKeyDebounce);
    apiKeyDebounce = window.setTimeout(async () => {
      // Save API key first, then fetch models
      await Storage.saveSettings({ apiKey: apiKeyInput.value });
      await loadModels();
    }, 500);
  });

  // Language change handler - update UI immediately
  languageSelect.addEventListener('change', () => {
    const newLang = languageSelect.value;
    if (newLang === 'auto') {
      setLanguage(getBrowserLanguage());
    } else {
      setLanguage(newLang);
    }
    applyTranslations();
    // Repopulate model select with current models
    if (currentModels.length > 0) {
      populateModelSelect(modelSelect, currentModels, modelSelect.value);
    }
  });

  // Save settings
  saveBtn.addEventListener('click', async () => {
    try {
      await Storage.saveSettings({
        apiKey: apiKeyInput.value,
        model: modelSelect.value,
        maxTokens: parseInt(maxTokensInput.value),
        temperature: parseFloat(temperatureInput.value),
        shortcut: shortcutInput.value.trim() || 'Alt+C',
        language: languageSelect.value as Settings['language'],
      });

      statusDiv.textContent = t('settings.saved');
      statusDiv.className = 'status success';

      setTimeout(() => {
        statusDiv.className = 'status';
      }, 3000);
    } catch (error) {
      statusDiv.textContent = t('settings.saveError');
      statusDiv.className = 'status error';
    }
  });
});
