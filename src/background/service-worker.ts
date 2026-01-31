import type { BackgroundMessage, ContentMessage } from '../shared/types';
import type { ModelConfig } from '../shared/models';
import { Storage } from '../shared/storage';
import { getProvider, getApiKey } from '../shared/providers';

// Track active streams for cancellation
const activeStreams = new Map<number, any>();

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
    handleFetchModels().then(sendResponse);
    return true; // Keep channel open for async response
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

// Open extension page or focus existing tab
function openOrFocusTab(page: string) {
  const targetUrl = chrome.runtime.getURL(page);
  chrome.tabs.query({}, (tabs) => {
    const existing = tabs.find((tab) => tab.url?.startsWith(targetUrl));
    if (existing?.id) {
      chrome.tabs.update(existing.id, { active: true });
      if (existing.windowId) {
        chrome.windows.update(existing.windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
  });
}

// Toggle dialog helper
function toggleDialogInActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleDialog' })
        .catch((err) => console.error('[Hootly Background] Error sending message:', err));
    }
  });
}

// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  toggleDialogInActiveTab();
});

// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dialog') {
    toggleDialogInActiveTab();
  }
});

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

// console.log('[Hootly Background] Service worker initialized');

// Test that commands API is available
// chrome.commands.getAll((commands) => {
//   console.log('[Hootly Background] Registered commands:', commands);
// });
