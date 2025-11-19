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
    });

    // Build messages array from conversation history
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: buildPromptWithContext(prompt, context),
      },
    ];

    // Stream response
    const stream = client.messages.stream({
      model: settings.model,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      system: settings.systemPrompt || undefined,
      messages,
    });

    stream.on('text', (text) => {
      sendToTab(tabId, {
        type: 'streamChunk',
        payload: { content: text },
      });
    });

    stream.on('end', () => {
      sendToTab(tabId, {
        type: 'streamEnd',
      });
    });

    stream.on('error', (error) => {
      sendToTab(tabId, {
        type: 'streamError',
        payload: { error: error.message },
      });
    });
  } catch (error) {
    sendToTab(tabId, {
      type: 'streamError',
      payload: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
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
