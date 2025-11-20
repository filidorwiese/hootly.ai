import Anthropic from '@anthropic-ai/sdk';
import type { BackgroundMessage, ContentMessage } from '../shared/types';

// Handle messages from content script
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.type === 'sendPrompt') {
    handleSendPrompt(message.payload, sender.tab?.id);
    sendResponse({ success: true });
  } else if (message.type === 'cancelStream') {
    // @TODO: Implement stream cancellation
    sendResponse({ success: true });
  } else if (message.type === 'getSettings') {
    // Settings are stored in chrome.storage, which content scripts can access directly
    sendResponse({ success: true });
  } else if (message.type === 'saveSettings') {
    // Settings are stored in chrome.storage, which content scripts can access directly
    sendResponse({ success: true });
  } else if (message.type === 'openSettings') {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  console.log('[FireClaude Background] Command received:', command);
  if (command === 'toggle-dialog') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('[FireClaude Background] Active tab:', tabs[0]);
      if (tabs[0]?.id) {
        console.log('[FireClaude Background] Sending message to tab:', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleDialog' })
          .then(() => console.log('[FireClaude Background] Message sent successfully'))
          .catch((err) => console.error('[FireClaude Background] Error sending message:', err));
      }
    });
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

  if (!settings.apiKey) {
    sendToTab(tabId, {
      type: 'streamError',
      payload: { error: 'API key not set. Please configure in settings.' },
    });
    return;
  }

  try {
    const client = new Anthropic({
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Build messages array from conversation history
    // Filter out any messages with empty content
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory
        .filter((msg) => msg.content && msg.content.trim() !== '')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      {
        role: 'user' as const,
        content: buildPromptWithContext(prompt, context),
      },
    ];

    console.log('[FireClaude] Sending messages to API:', messages.length, 'messages');
    console.log('[FireClaude] Message roles:', messages.map(m => m.role).join(', '));

    // Stream response
    const stream = client.messages.stream({
      model: settings.model,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      system: settings.systemPrompt || undefined,
      messages,
    });

    // Track complete response content
    let fullContent = '';

    stream.on('text', (text) => {
      fullContent += text;
      sendToTab(tabId, {
        type: 'streamChunk',
        payload: { content: text },
      });
    });

    stream.on('end', () => {
      sendToTab(tabId, {
        type: 'streamEnd',
        payload: { content: fullContent },
      });
    });

    stream.on('error', (error) => {
      sendToTab(tabId, {
        type: 'streamError',
        payload: { error: extractErrorMessage(error) },
      });
    });
  } catch (error) {
    sendToTab(tabId, {
      type: 'streamError',
      payload: { error: extractErrorMessage(error) },
    });
  }
}

function extractErrorMessage(error: any): string {
  console.log('[FireClaude] Extracting error:', error);

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
    console.error('[FireClaude] Unhandled error format:', error);
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

console.log('[FireClaude Background] Service worker initialized');

// Test that commands API is available
chrome.commands.getAll((commands) => {
  console.log('[FireClaude Background] Registered commands:', commands);
});
