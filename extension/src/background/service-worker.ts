import type { BackgroundMessage, ContentMessage } from '../shared/types';
import type { ModelConfig } from '../shared/models';
import { Storage } from '../shared/storage';
import { getProvider, getApiKey } from '../shared/providers';

declare const browser: typeof chrome | undefined;

// Track active streams for cancellation
const activeStreams = new Map<number, any>();

// Track extension tab ID (settings/personas/history pages)
let extensionTabId: number | null = null;

// Handle messages from content script
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === 'sendPrompt') {
    handleSendPrompt(message.payload, sender.tab?.id);
    sendResponse({ success: true });
  } else if (message.type === 'cancelStream') {
    const tabId = sender.tab?.id;
    if (tabId && activeStreams.has(tabId)) {
      const stream = activeStreams.get(tabId);
      stream.abort();
      activeStreams.delete(tabId);
      // console.log('[Hootly] Stream cancelled for tab:', tabId);
    }
    sendResponse({ success: true });
  } else if (message.type === 'getSettings') {
    // Settings are stored in chrome.storage, which content scripts can access directly
    sendResponse({ success: true });
  } else if (message.type === 'saveSettings') {
    // Settings are stored in chrome.storage, which content scripts can access directly
    sendResponse({ success: true });
  } else if (message.type === 'openSettings') {
    openOrFocusTab('settings.html');
    sendResponse({ success: true });
  } else if (message.type === 'openHistory') {
    openOrFocusTab('history.html');
    sendResponse({ success: true });
  } else if (message.type === 'continueConversation') {
    const convId = message.payload.conversationId;
    chrome.tabs.create({
      url: chrome.runtime.getURL(`chat.html?conversationId=${encodeURIComponent(convId)}`),
    });
    sendResponse({ success: true });
  } else if (message.type === 'fetchModels') {
    handleFetchModels()
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error?.message || 'Unknown error' }));
    return true; // Keep channel open for async response
  } else if (message.type === 'setExtensionTabId') {
    extensionTabId = message.payload.tabId;
    sendResponse({ success: true, tabId: extensionTabId });
  } else if (message.type === 'getExtensionTabId') {
    sendResponse({ success: true, tabId: extensionTabId });
  } else if (message.type === 'clearExtensionTabId') {
    extensionTabId = null;
    sendResponse({ success: true });
  } else if (message.type === 'toggleDialogFromTooltip') {
    // Selection tooltip clicked - inject main extension
    toggleDialogInActiveTab();
    sendResponse({ success: true });
  } else if (message.type === 'getShortcut') {
    // Return the actual keyboard shortcut from browser commands
    if (chrome.commands?.getAll) {
      const isFirefox = typeof browser !== 'undefined';
      const commandName = isFirefox ? 'toggle-dialog' : '_execute_action';
      chrome.commands.getAll().then((commands) => {
        const toggleCommand = commands.find(cmd => cmd.name === commandName);
        sendResponse({ success: true, shortcut: toggleCommand?.shortcut || null });
      });
      return true; // Keep channel open for async response
    } else {
      sendResponse({ success: true, shortcut: null });
    }
  }

  return true; // Keep message channel open for async response
});

async function handleFetchModels(): Promise<{ success: boolean; models?: ModelConfig[]; error?: string }> {
  try {
    const settings = await Storage.getSettings();
    const apiKey = getApiKey(settings);
    if (!apiKey) {
      return { success: false, error: 'No API key configured' };
    }
    const provider = getProvider(settings.provider);
    const models = await provider.fetchModels(apiKey);
    return { success: true, models };
  } catch (error: any) {
    console.error('[Hootly] Failed to fetch models:', error);
    return { success: false, error: error.message || 'Failed to fetch models' };
  }
}

// Open extension page or focus/navigate existing extension tab
function openOrFocusTab(page: string) {
  const targetUrl = chrome.runtime.getURL(page);

  // If we have a stored extension tab, try to use it
  if (extensionTabId !== null) {
    chrome.tabs.get(extensionTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        // Tab was closed externally, clear ID and create new
        extensionTabId = null;
        createExtensionTab(targetUrl);
      } else {
        // Navigate existing tab to target URL and focus it
        chrome.tabs.update(extensionTabId!, { url: targetUrl, active: true });
        if (tab.windowId) {
          chrome.windows.update(tab.windowId, { focused: true });
        }
      }
    });
  } else {
    // No stored tab, search for existing or create new
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find((t) => t.url?.includes(chrome.runtime.id));
      if (existing?.id) {
        extensionTabId = existing.id;
        chrome.tabs.update(existing.id, { url: targetUrl, active: true });
        if (existing.windowId) {
          chrome.windows.update(existing.windowId, { focused: true });
        }
      } else {
        createExtensionTab(targetUrl);
      }
    });
  }
}

// Helper to create new extension tab and store its ID
function createExtensionTab(url: string) {
  chrome.tabs.create({ url }, (tab) => {
    if (tab?.id) {
      extensionTabId = tab.id;
    }
  });
}

// Toggle dialog helper - injects content script on-demand if needed
async function toggleDialogInActiveTab() {
  console.log('[Hootly Background] toggleDialogInActiveTab called');
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  console.log('[Hootly Background] Active tab:', tab?.url);
  if (!tab?.id || !tab.url) return;

  // Skip non-injectable pages
  if (tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('about:') ||
      tab.url.startsWith('moz-extension://')) {
    console.log('[Hootly Background] Skipping non-injectable page');
    return;
  }

  const tabId = tab.id;

  try {
    // Try to send toggle message to existing content script
    console.log('[Hootly Background] Sending toggle message to tab', tabId);
    await chrome.tabs.sendMessage(tabId, { type: 'toggleDialog' });
    console.log('[Hootly Background] Message sent successfully');
  } catch (err) {
    // Content script not injected yet - inject it now
    console.log('[Hootly Background] Message failed, injecting content script:', err);
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      console.log('[Hootly Background] Content script injected');
      // Content script auto-shows on first injection via sendToggleToIframe()
      // No additional toggle needed here
    } catch (err) {
      console.error('[Hootly Background] Failed to inject content script:', err);
    }
  }
}


// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  console.log('[Hootly Background] Toolbar icon clicked');
  toggleDialogInActiveTab();
});

// Handle keyboard command (Firefox uses toggle-dialog command, Chrome uses _execute_action via onClicked)
if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    console.log('[Hootly Background] Command received:', command);
    if (command === 'toggle-dialog') {
      toggleDialogInActiveTab();
    }
  });
}

// Log registered commands on startup
if (chrome.commands?.getAll) {
  chrome.commands.getAll().then((commands) => {
    console.log('[Hootly Background] Registered commands:', commands);
  });
}

async function handleSendPrompt(
  payload: { prompt: string; context?: any; conversationHistory: any[]; settings: any },
  tabId?: number
) {
  if (!tabId) {
    console.error('No tab ID provided');
    return;
  }

  const { prompt, context, conversationHistory, settings } = payload;

  const apiKey = getApiKey(settings);
  if (!apiKey) {
    sendToTab(tabId, {
      type: 'streamError',
      payload: { error: 'API key not set. Please configure in settings.' },
    });
    return;
  }

  try {
    const provider = getProvider(settings.provider);

    const messages = [
      ...conversationHistory
        .filter((msg: any) => msg.content && msg.content.trim() !== '')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      {
        role: 'user' as const,
        content: buildPromptWithContext(prompt, context),
      },
    ];

    // console.log('[Hootly] Sending messages to API:', messages.length, 'messages');
    // console.log('[Hootly] Provider:', settings.provider, 'Model:', settings.model);

    const stream = provider.streamChat(
      apiKey,
      {
        model: settings.model,
        messages,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        systemPrompt: settings.systemPrompt || undefined,
      },
      {
        onText: (text) => {
          sendToTab(tabId, {
            type: 'streamChunk',
            payload: { content: text },
          });
        },
        onEnd: (fullContent) => {
          activeStreams.delete(tabId);
          sendToTab(tabId, {
            type: 'streamEnd',
            payload: { content: fullContent },
          });
        },
        onError: (error) => {
          activeStreams.delete(tabId);
          handleStreamError(tabId, error, settings.model);
        },
      }
    );

    activeStreams.set(tabId, stream);
  } catch (error) {
    handleStreamError(tabId, error, settings.model);
  }
}

function handleStreamError(tabId: number, error: any, modelId: string) {
  const errorMessage = extractErrorMessage(error);
  const isModelNotFound = isModelNotFoundError(error, errorMessage);

  if (isModelNotFound) {
    // Clear the model setting
    Storage.saveSettings({ model: '' });
    sendToTab(tabId, {
      type: 'modelNotFound',
      payload: { model: modelId },
    });
  } else {
    sendToTab(tabId, {
      type: 'streamError',
      payload: { error: errorMessage },
    });
  }
}

function isModelNotFoundError(error: any, errorMessage: string): boolean {
  // Check for 404 status
  if (error?.status === 404) return true;

  // Check error message for model not found indicators
  const lowerMessage = errorMessage.toLowerCase();
  if (lowerMessage.includes('model') && (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('does not exist') ||
    lowerMessage.includes('invalid model')
  )) {
    return true;
  }

  return false;
}

function extractErrorMessage(error: any): string {
  // console.log('[Hootly] Extracting error:', error);

  // Handle Anthropic SDK errors
  if (error?.error?.message) {
    return error.error.message;
  }

  // Handle error with message field
  if (error?.message) {
    const msg = error.message;

    // Try to parse JSON error message (format: "400 {json}")
    try {
      const match = msg.match(/\d{3}\s+(\{.*\})/);
      if (match) {
        const errorData = JSON.parse(match[1]);
        if (errorData?.error?.message) {
          return errorData.error.message;
        }
      }
    } catch (e) {
      // If parsing fails, return the original message
    }

    return msg;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle object errors - try to find any message
  if (typeof error === 'object') {
    if (error.error_message) return error.error_message;
    if (error.detail) return error.detail;

    // Last resort - stringify the error
    console.error('[Hootly] Unhandled error format:', error);
    return JSON.stringify(error);
  }

  return 'An unexpected error occurred';
}

function buildPromptWithContext(prompt: string, context?: any): string {
  if (!context) return prompt;

  let fullPrompt = '';

  if (context.selection) {
    fullPrompt += `# Selected Text\n\n${context.selection}\n\n---\n\n`;
  } else if (context.fullPage) {
    fullPrompt += `# Page Content\n\n${context.fullPage}\n\n---\n\n`;
  }

  if (context.url || context.title) {
    fullPrompt += `# Page Info\n`;
    if (context.title) fullPrompt += `Title: ${context.title}\n`;
    if (context.url) fullPrompt += `URL: ${context.url}\n`;
    fullPrompt += `\n---\n\n`;
  }

  fullPrompt += `# User Query\n\n${prompt}`;

  return fullPrompt;
}

function sendToTab(tabId: number, message: ContentMessage) {
  chrome.tabs.sendMessage(tabId, message).catch((error) => {
    console.error('Failed to send message to tab:', error);
  });
}

// Clear extension tab ID when the tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === extensionTabId) {
    extensionTabId = null;
  }
});

// console.log('[Hootly Background] Service worker initialized');

// Test that commands API is available
// chrome.commands.getAll((commands) => {
//   console.log('[Hootly Background] Registered commands:', commands);
// });
