import { Storage } from '../shared/storage';
import { Settings, ModelConfig, LLMProvider, DEFAULT_PERSONAS } from '../shared/types';
import { t, initLanguage, setLanguage } from '../shared/i18n';
import { selectDefaultModel } from '../shared/models';
import { injectTabHeader, registerExtensionTab } from '../shared/TabHeader';
import { initTheme } from '../shared/theme';

// Type declaration for Firefox browser API
declare const browser: typeof chrome & {
  permissions: typeof chrome.permissions & {
    onAdded?: chrome.events.Event<(permissions: chrome.permissions.Permissions) => void>;
    onRemoved?: chrome.events.Event<(permissions: chrome.permissions.Permissions) => void>;
    request(permissions: any): Promise<boolean>;
    remove(permissions: any): Promise<boolean>;
    getAll(): Promise<any>;
  };
};

// Firefox data collection permission helpers
const isFirefox = typeof browser !== 'undefined' && browser?.permissions !== undefined;

async function hasFirefoxDataCollectionPermission(): Promise<boolean> {
  if (!isFirefox) return false;
  try {
    const all = await browser.permissions.getAll();
    return (all as any).data_collection?.includes('technicalAndInteraction') ?? false;
  } catch {
    return false;
  }
}

async function requestFirefoxDataCollectionPermission(): Promise<boolean> {
  if (!isFirefox) return false;
  try {
    return await browser.permissions.request({ data_collection: ['technicalAndInteraction'] } as any);
  } catch {
    return false;
  }
}

async function removeFirefoxDataCollectionPermission(): Promise<boolean> {
  if (!isFirefox) return false;
  try {
    return await browser.permissions.remove({ data_collection: ['technicalAndInteraction'] } as any);
  } catch {
    return false;
  }
}

const API_KEY_SECTIONS: Record<LLMProvider, string> = {
  claude: 'claudeApiKeySection',
  openai: 'openaiApiKeySection',
  gemini: 'geminiApiKeySection',
  openrouter: 'openrouterApiKeySection',
};

function showApiKeySection(provider: LLMProvider) {
  Object.entries(API_KEY_SECTIONS).forEach(([p, sectionId]) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = p === provider ? 'block' : 'none';
    }
  });
}

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
    option.textContent = `${model.name} - ${model.description}`;
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
  // Initialize theme system (sets data-theme attribute and listens for changes)
  await initTheme();

  // Initialize language first
  await initLanguage();

  // Inject TabHeader component
  injectTabHeader({ activeTab: 'settings' });

  // Register this tab as the extension tab (TAB-13)
  await registerExtensionTab();

  applyTranslations();

  const providerSelect = document.getElementById('provider') as HTMLSelectElement;
  const claudeApiKeyInput = document.getElementById('claudeApiKey') as HTMLInputElement;
  const openaiApiKeyInput = document.getElementById('openaiApiKey') as HTMLInputElement;
  const geminiApiKeyInput = document.getElementById('geminiApiKey') as HTMLInputElement;
  const openrouterApiKeyInput = document.getElementById('openrouterApiKey') as HTMLInputElement;
  const modelSelect = document.getElementById('model') as HTMLSelectElement;
  const maxTokensInput = document.getElementById('maxTokens') as HTMLInputElement;
  const temperatureInput = document.getElementById('temperature') as HTMLInputElement;
  const shortcutInput = document.getElementById('shortcut') as HTMLInputElement;
  const showSelectionTooltipInput = document.getElementById('showSelectionTooltip') as HTMLInputElement;
  const shareAnalyticsInput = document.getElementById('shareAnalytics') as HTMLInputElement;
  const languageSelect = document.getElementById('language') as HTMLSelectElement;
  const themeLightRadio = document.getElementById('themeLight') as HTMLInputElement;
  const themeDarkRadio = document.getElementById('themeDark') as HTMLInputElement;
  const themeAutoRadio = document.getElementById('themeAuto') as HTMLInputElement;
  const defaultPersonaSelect = document.getElementById('defaultPersona') as HTMLSelectElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  const apiKeyInputs: Record<LLMProvider, HTMLInputElement> = {
    claude: claudeApiKeyInput,
    openai: openaiApiKeyInput,
    gemini: geminiApiKeyInput,
    openrouter: openrouterApiKeyInput,
  };

  function getCurrentApiKey(): string {
    const provider = providerSelect.value as LLMProvider;
    return apiKeyInputs[provider]?.value || '';
  }

  // Load current settings
  const settings = await Storage.getSettings();

  // Populate form fields
  providerSelect.value = settings.provider;
  claudeApiKeyInput.value = settings.claudeApiKey;
  openaiApiKeyInput.value = settings.openaiApiKey;
  geminiApiKeyInput.value = settings.geminiApiKey;
  openrouterApiKeyInput.value = settings.openrouterApiKey;
  maxTokensInput.value = settings.maxTokens.toString();
  temperatureInput.value = settings.temperature.toString();
  shortcutInput.value = settings.shortcut;
  showSelectionTooltipInput.checked = settings.showSelectionTooltip !== false;
  languageSelect.value = settings.language;

  // Sync analytics checkbox with Firefox data collection permission
  if (isFirefox) {
    const hasPermission = await hasFirefoxDataCollectionPermission();
    shareAnalyticsInput.checked = hasPermission;
  } else {
    shareAnalyticsInput.checked = settings.shareAnalytics !== false;
  }

  // Set theme radio button
  const themeValue = settings.theme || 'auto';
  if (themeValue === 'light') themeLightRadio.checked = true;
  else if (themeValue === 'dark') themeDarkRadio.checked = true;
  else themeAutoRadio.checked = true;

  // Populate default persona select
  DEFAULT_PERSONAS.forEach(persona => {
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = `${persona.icon} ${persona.name}`;
    defaultPersonaSelect.appendChild(option);
  });
  defaultPersonaSelect.value = settings.defaultPersonaId || 'general';

  // Show correct API key section
  showApiKeySection(settings.provider);

  // Track current models for language updates
  let currentModels: ModelConfig[] = [];

  // Fetch and populate models
  async function loadModels() {
    const apiKey = getCurrentApiKey();
    if (!apiKey.trim()) {
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

  // Provider change handler
  providerSelect.addEventListener('change', async () => {
    const provider = providerSelect.value as LLMProvider;
    showApiKeySection(provider);
    await Storage.saveSettings({ provider, model: '' });
    settings.model = '';
    await loadModels();
  });

  // Refetch models when API key changes
  let apiKeyDebounce: number | null = null;
  function setupApiKeyListener(input: HTMLInputElement, keyName: keyof Settings) {
    input.addEventListener('input', () => {
      if (apiKeyDebounce) clearTimeout(apiKeyDebounce);
      apiKeyDebounce = window.setTimeout(async () => {
        await Storage.saveSettings({ [keyName]: input.value });
        await loadModels();
      }, 500);
    });
  }

  setupApiKeyListener(claudeApiKeyInput, 'claudeApiKey');
  setupApiKeyListener(openaiApiKeyInput, 'openaiApiKey');
  setupApiKeyListener(geminiApiKeyInput, 'geminiApiKey');
  setupApiKeyListener(openrouterApiKeyInput, 'openrouterApiKey');

  // Analytics checkbox handler - sync with Firefox data collection permission
  shareAnalyticsInput.addEventListener('change', async () => {
    if (isFirefox) {
      if (shareAnalyticsInput.checked) {
        const granted = await requestFirefoxDataCollectionPermission();
        shareAnalyticsInput.checked = granted;
      } else {
        await removeFirefoxDataCollectionPermission();
      }
    }
  });

  // Listen for Firefox permission changes from Add-ons Manager
  if (isFirefox && browser.permissions?.onAdded && browser.permissions?.onRemoved) {
    browser.permissions.onAdded.addListener(async () => {
      const hasPermission = await hasFirefoxDataCollectionPermission();
      shareAnalyticsInput.checked = hasPermission;
    });
    browser.permissions.onRemoved.addListener(async () => {
      const hasPermission = await hasFirefoxDataCollectionPermission();
      shareAnalyticsInput.checked = hasPermission;
    });
  }

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

  // Get selected theme value
  function getSelectedTheme(): Settings['theme'] {
    if (themeLightRadio.checked) return 'light';
    if (themeDarkRadio.checked) return 'dark';
    return 'auto';
  }

  // Save settings
  saveBtn.addEventListener('click', async () => {
    try {
      await Storage.saveSettings({
        provider: providerSelect.value as LLMProvider,
        claudeApiKey: claudeApiKeyInput.value,
        openaiApiKey: openaiApiKeyInput.value,
        geminiApiKey: geminiApiKeyInput.value,
        openrouterApiKey: openrouterApiKeyInput.value,
        model: modelSelect.value,
        maxTokens: parseInt(maxTokensInput.value),
        temperature: parseFloat(temperatureInput.value),
        shortcut: shortcutInput.value.trim() || 'Alt+C',
        showSelectionTooltip: showSelectionTooltipInput.checked,
        shareAnalytics: shareAnalyticsInput.checked,
        language: languageSelect.value as Settings['language'],
        theme: getSelectedTheme(),
        defaultPersonaId: defaultPersonaSelect.value,
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

  // Also populate custom personas in default persona select
  (settings.customPersonas || []).forEach(persona => {
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = `${persona.icon} ${persona.name}`;
    defaultPersonaSelect.appendChild(option);
  });
  // Re-set the value after adding custom options
  defaultPersonaSelect.value = settings.defaultPersonaId || 'general';

  // Display version number
  const versionInfo = document.getElementById('versionInfo');
  if (versionInfo) {
    versionInfo.textContent = `v${__APP_VERSION__}`;
  }

  // Keyboard shortcut display (both browsers)
  const shortcutValue = document.getElementById('shortcutValue');
  const openShortcutsBtn = document.getElementById('openShortcutsBtn');

  // Function to refresh shortcut display
  function refreshShortcutDisplay() {
    if (!shortcutValue) return;
    if (chrome.commands?.getAll) {
      const commandName = isFirefox ? 'toggle-dialog' : '_execute_action';
      chrome.commands.getAll().then((commands) => {
        const toggleCommand = commands.find(cmd => cmd.name === commandName);
        shortcutValue.textContent = toggleCommand?.shortcut || 'Not set';
        shortcutValue.style.color = toggleCommand?.shortcut ? 'inherit' : 'var(--color-accent-error)';
      });
    } else {
      shortcutValue.textContent = 'Not set';
      shortcutValue.style.color = 'var(--color-accent-error)';
    }
  }

  if (shortcutValue && openShortcutsBtn) {
    // Initial load
    refreshShortcutDisplay();

    // Open browser shortcuts page
    if (isFirefox) {
      // Firefox doesn't allow opening about:addons programmatically
      // Replace button with instructions + copy button
      const hint = document.createElement('div');
      hint.style.cssText = 'margin-top: 8px; font-size: var(--font-size-sm); color: var(--color-text-secondary);';
      hint.innerHTML = `
        To change: type <code style="background: var(--color-bg-subtle); padding: 2px 6px; border-radius: 3px;">about:addons</code>
        in address bar, then ⚙️ → Manage Extension Shortcuts
      `;
      openShortcutsBtn.style.display = 'none';
      openShortcutsBtn.parentNode?.appendChild(hint);
    } else {
      openShortcutsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
      });
    }
  }

  // Reload settings from storage and update form fields
  async function reloadSettings(): Promise<void> {
    const freshSettings = await Storage.getSettings();

    providerSelect.value = freshSettings.provider;
    claudeApiKeyInput.value = freshSettings.claudeApiKey;
    openaiApiKeyInput.value = freshSettings.openaiApiKey;
    geminiApiKeyInput.value = freshSettings.geminiApiKey;
    openrouterApiKeyInput.value = freshSettings.openrouterApiKey;
    maxTokensInput.value = freshSettings.maxTokens.toString();
    temperatureInput.value = freshSettings.temperature.toString();
    shortcutInput.value = freshSettings.shortcut;
    showSelectionTooltipInput.checked = freshSettings.showSelectionTooltip !== false;
    languageSelect.value = freshSettings.language;

    // Sync analytics checkbox with Firefox permission
    if (isFirefox) {
      const hasPermission = await hasFirefoxDataCollectionPermission();
      shareAnalyticsInput.checked = hasPermission;
    } else {
      shareAnalyticsInput.checked = freshSettings.shareAnalytics !== false;
    }

    const themeValue = freshSettings.theme || 'auto';
    if (themeValue === 'light') themeLightRadio.checked = true;
    else if (themeValue === 'dark') themeDarkRadio.checked = true;
    else themeAutoRadio.checked = true;

    showApiKeySection(freshSettings.provider);

    // Repopulate default persona select
    defaultPersonaSelect.innerHTML = '';
    DEFAULT_PERSONAS.forEach(persona => {
      const option = document.createElement('option');
      option.value = persona.id;
      option.textContent = `${persona.icon} ${persona.name}`;
      defaultPersonaSelect.appendChild(option);
    });
    (freshSettings.customPersonas || []).forEach(persona => {
      const option = document.createElement('option');
      option.value = persona.id;
      option.textContent = `${persona.icon} ${persona.name}`;
      defaultPersonaSelect.appendChild(option);
    });
    defaultPersonaSelect.value = freshSettings.defaultPersonaId || 'general';

    await loadModels();
  }

  // Refresh data when tab gains focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reloadSettings();
      refreshShortcutDisplay();
    }
  });
});
