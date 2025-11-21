import { Storage } from '../shared/storage';
import { MODELS } from '../shared/types';
import { t, initLanguage, setLanguage } from '../shared/i18n';

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

function populateModelSelect(modelSelect: HTMLSelectElement, currentValue?: string) {
  modelSelect.innerHTML = '';

  const recommendedModels = MODELS.filter(m => m.recommended && !m.legacy);
  if (recommendedModels.length > 0) {
    const recommendedGroup = document.createElement('optgroup');
    recommendedGroup.label = t('settings.modelRecommended');
    recommendedModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} - ${model.description}`;
      recommendedGroup.appendChild(option);
    });
    modelSelect.appendChild(recommendedGroup);
  }

  const currentModels = MODELS.filter(m => !m.recommended && !m.legacy);
  if (currentModels.length > 0) {
    const currentGroup = document.createElement('optgroup');
    currentGroup.label = t('settings.modelCurrent');
    currentModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} - ${model.description}`;
      currentGroup.appendChild(option);
    });
    modelSelect.appendChild(currentGroup);
  }

  const legacyModels = MODELS.filter(m => m.legacy);
  if (legacyModels.length > 0) {
    const legacyGroup = document.createElement('optgroup');
    legacyGroup.label = t('settings.modelLegacy');
    legacyModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} - ${model.description}`;
      legacyGroup.appendChild(option);
    });
    modelSelect.appendChild(legacyGroup);
  }

  if (currentValue) {
    modelSelect.value = currentValue;
  }
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

  // Populate model dropdown
  populateModelSelect(modelSelect, settings.model);

  // Language change handler - update UI immediately
  languageSelect.addEventListener('change', () => {
    const newLang = languageSelect.value;
    if (newLang === 'auto') {
      setLanguage(getBrowserLanguage());
    } else {
      setLanguage(newLang);
    }
    applyTranslations();
    populateModelSelect(modelSelect, modelSelect.value);
  });
  apiKeyInput.value = settings.apiKey;
  modelSelect.value = settings.model;
  maxTokensInput.value = settings.maxTokens.toString();
  temperatureInput.value = settings.temperature.toString();
  shortcutInput.value = settings.shortcut;
  languageSelect.value = settings.language;

  // Save settings
  saveBtn.addEventListener('click', async () => {
    try {
      await Storage.saveSettings({
        apiKey: apiKeyInput.value,
        model: modelSelect.value as any,
        maxTokens: parseInt(maxTokensInput.value),
        temperature: parseFloat(temperatureInput.value),
        shortcut: shortcutInput.value.trim() || 'Alt+C',
        language: languageSelect.value as 'auto' | 'en' | 'nl',
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
