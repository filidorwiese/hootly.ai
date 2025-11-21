import { Storage } from '../shared/storage';
import { MODELS } from '../shared/types';
import { t, initLanguage } from '../shared/i18n';

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
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

  // Populate model dropdown from config
  modelSelect.innerHTML = '';

  // Add recommended models
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

  // Add current models
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

  // Add legacy models
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

  // Load current settings
  const settings = await Storage.getSettings();
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
