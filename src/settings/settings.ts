import { Storage } from '../shared/storage';

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const modelSelect = document.getElementById('model') as HTMLSelectElement;
  const maxTokensInput = document.getElementById('maxTokens') as HTMLInputElement;
  const temperatureInput = document.getElementById('temperature') as HTMLInputElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  // Load current settings
  const settings = await Storage.getSettings();
  apiKeyInput.value = settings.apiKey;
  modelSelect.value = settings.model;
  maxTokensInput.value = settings.maxTokens.toString();
  temperatureInput.value = settings.temperature.toString();

  // Save settings
  saveBtn.addEventListener('click', async () => {
    try {
      await Storage.saveSettings({
        apiKey: apiKeyInput.value,
        model: modelSelect.value as any,
        maxTokens: parseInt(maxTokensInput.value),
        temperature: parseFloat(temperatureInput.value),
      });

      statusDiv.textContent = 'Settings saved successfully!';
      statusDiv.className = 'status success';

      setTimeout(() => {
        statusDiv.className = 'status';
      }, 3000);
    } catch (error) {
      statusDiv.textContent = 'Error saving settings';
      statusDiv.className = 'status error';
    }
  });
});
