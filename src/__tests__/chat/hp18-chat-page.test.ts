/**
 * HP-18: Create chat page for continued conversations
 *
 * Tests that:
 * 1. chat.html entry point exists
 * 2. chat.ts has React app setup
 * 3. Vite build configuration includes chat entry
 * 4. Conversation ID loaded from URL parameter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Source file paths
const chatHtmlPath = resolve(__dirname, '../../chat/index.html');
const chatTsPath = resolve(__dirname, '../../chat/chat.ts');
const viteConfigPath = resolve(__dirname, '../../../vite.config.ts');
const manifestFirefoxPath = resolve(__dirname, '../../../manifest.firefox.json');
const manifestChromePath = resolve(__dirname, '../../../manifest.chrome.json');
const enJsonPath = resolve(__dirname, '../../shared/i18n/en.json');

let chatHtmlContent: string;
let chatTsContent: string;
let viteConfigContent: string;
let manifestFirefoxContent: string;
let manifestChromeContent: string;
let enJsonContent: string;

beforeEach(() => {
  chatHtmlContent = readFileSync(chatHtmlPath, 'utf-8');
  chatTsContent = readFileSync(chatTsPath, 'utf-8');
  viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  manifestFirefoxContent = readFileSync(manifestFirefoxPath, 'utf-8');
  manifestChromeContent = readFileSync(manifestChromePath, 'utf-8');
  enJsonContent = readFileSync(enJsonPath, 'utf-8');
});

describe('HP-18: Create chat page for continued conversations', () => {
  describe('Chat HTML Entry Point', () => {
    it('should have chat.html file', () => {
      expect(existsSync(chatHtmlPath)).toBe(true);
    });

    it('should have HTML5 doctype', () => {
      expect(chatHtmlContent).toContain('<!DOCTYPE html>');
    });

    it('should have proper page title', () => {
      expect(chatHtmlContent).toContain('<title>Hootly.ai Chat</title>');
    });

    it('should load Inter font', () => {
      expect(chatHtmlContent).toContain('fonts.googleapis.com');
      expect(chatHtmlContent).toContain('Inter');
    });

    it('should load highlight.js for code highlighting', () => {
      expect(chatHtmlContent).toContain('highlight.js');
    });

    it('should have script module loading chat.ts', () => {
      expect(chatHtmlContent).toContain('<script type="module" src="./chat.ts"></script>');
    });
  });

  describe('Chat HTML Structure', () => {
    it('should have chat container', () => {
      expect(chatHtmlContent).toContain('class="chat-container"');
    });

    it('should have header section', () => {
      expect(chatHtmlContent).toContain('class="header"');
      expect(chatHtmlContent).toContain('Hootly.ai');
    });

    it('should have logo element', () => {
      expect(chatHtmlContent).toContain('id="logo"');
    });

    it('should have settings button', () => {
      expect(chatHtmlContent).toContain('id="settingsBtn"');
    });

    it('should have history button', () => {
      expect(chatHtmlContent).toContain('id="historyBtn"');
    });

    it('should have burn/clear button', () => {
      expect(chatHtmlContent).toContain('id="burnBtn"');
    });

    it('should have loading state', () => {
      expect(chatHtmlContent).toContain('id="loadingState"');
      expect(chatHtmlContent).toContain('data-i18n="chat.loading"');
    });

    it('should have error state', () => {
      expect(chatHtmlContent).toContain('id="errorState"');
      expect(chatHtmlContent).toContain('data-i18n="chat.notFound"');
    });

    it('should have main content container', () => {
      expect(chatHtmlContent).toContain('id="mainContent"');
    });

    it('should have messages container', () => {
      expect(chatHtmlContent).toContain('id="messagesContainer"');
    });

    it('should have empty state', () => {
      expect(chatHtmlContent).toContain('id="emptyState"');
      expect(chatHtmlContent).toContain('data-i18n="chat.emptyTitle"');
      expect(chatHtmlContent).toContain('data-i18n="chat.emptyHint"');
    });

    it('should have streaming indicator', () => {
      expect(chatHtmlContent).toContain('id="streamingIndicator"');
      expect(chatHtmlContent).toContain('id="streamingContent"');
    });

    it('should have input section', () => {
      expect(chatHtmlContent).toContain('class="input-section"');
    });

    it('should have cancel hint', () => {
      expect(chatHtmlContent).toContain('id="cancelHint"');
    });

    it('should have context toggle', () => {
      expect(chatHtmlContent).toContain('id="contextToggle"');
    });

    it('should have persona selector', () => {
      expect(chatHtmlContent).toContain('id="personaSelector"');
    });

    it('should have input textarea', () => {
      expect(chatHtmlContent).toContain('id="inputTextarea"');
    });

    it('should have send button', () => {
      expect(chatHtmlContent).toContain('id="sendBtn"');
    });

    it('should have clear input button', () => {
      expect(chatHtmlContent).toContain('id="clearInputBtn"');
    });
  });

  describe('Chat Page Gradient Background', () => {
    it('should have gradient background on body', () => {
      expect(chatHtmlContent).toContain('background: linear-gradient');
    });

    it('should use forest theme colors in gradient', () => {
      expect(chatHtmlContent).toContain('#E8F0EA');
      expect(chatHtmlContent).toContain('#D1E1D6');
      expect(chatHtmlContent).toContain('#A3C4AC');
      expect(chatHtmlContent).toContain('#75A683');
      expect(chatHtmlContent).toContain('#4A7C54');
    });

    it('should center chat container', () => {
      expect(chatHtmlContent).toContain('display: flex');
      expect(chatHtmlContent).toContain('justify-content: center');
      expect(chatHtmlContent).toContain('align-items: center');
    });
  });

  describe('Chat TypeScript Setup', () => {
    it('should have chat.ts file', () => {
      expect(existsSync(chatTsPath)).toBe(true);
    });

    it('should import Storage', () => {
      expect(chatTsContent).toContain("import { Storage } from '../shared/storage'");
    });

    it('should import types', () => {
      expect(chatTsContent).toContain("import type { Conversation, Persona, Message, Settings }");
      expect(chatTsContent).toContain("import { DEFAULT_PERSONAS }");
    });

    it('should import i18n', () => {
      expect(chatTsContent).toContain("import { t, initLanguage }");
    });

    it('should import getApiKey', () => {
      expect(chatTsContent).toContain("import { getApiKey }");
    });

    it('should have init function', () => {
      expect(chatTsContent).toContain('async function init()');
    });

    it('should call init on DOMContentLoaded', () => {
      expect(chatTsContent).toContain("document.addEventListener('DOMContentLoaded', init)");
    });
  });

  describe('URL Parameter Handling', () => {
    it('should get conversationId from URL params', () => {
      expect(chatTsContent).toContain('URLSearchParams');
      expect(chatTsContent).toContain("params.get('conversationId')");
    });

    it('should load conversation from storage by ID', () => {
      expect(chatTsContent).toContain('Storage.getConversations()');
      expect(chatTsContent).toContain('conversations.find');
    });

    it('should show error state if conversation not found', () => {
      expect(chatTsContent).toContain('showError()');
    });

    it('should create new conversation if no ID provided', () => {
      expect(chatTsContent).toContain('createNewConversation');
    });

    it('should update URL with conversation ID for refresh support', () => {
      expect(chatTsContent).toContain("window.history.replaceState");
      expect(chatTsContent).toContain("newUrl.searchParams.set('conversationId'");
    });
  });

  describe('Chat Functionality', () => {
    it('should render messages', () => {
      expect(chatTsContent).toContain('function renderMessages()');
    });

    it('should render context toggle', () => {
      expect(chatTsContent).toContain('function renderContextToggle()');
    });

    it('should render persona selector', () => {
      expect(chatTsContent).toContain('function renderPersonaSelector()');
    });

    it('should handle send message', () => {
      expect(chatTsContent).toContain('async function handleSendMessage()');
    });

    it('should handle stream chunk', () => {
      expect(chatTsContent).toContain('async function handleStreamChunk');
    });

    it('should handle stream end', () => {
      expect(chatTsContent).toContain('async function handleStreamEnd');
    });

    it('should listen for streaming responses', () => {
      expect(chatTsContent).toContain('chrome.runtime.onMessage.addListener');
      expect(chatTsContent).toContain("message.type === 'streamChunk'");
      expect(chatTsContent).toContain("message.type === 'streamEnd'");
      expect(chatTsContent).toContain("message.type === 'streamError'");
    });

    it('should handle Escape key to cancel streaming', () => {
      expect(chatTsContent).toContain("e.key === 'Escape'");
      expect(chatTsContent).toContain("type: 'cancelStream'");
    });

    it('should handle Enter key to send', () => {
      expect(chatTsContent).toContain("e.key === 'Enter'");
      expect(chatTsContent).toContain('handleSendMessage()');
    });
  });

  describe('Header Buttons', () => {
    it('should handle settings button click', () => {
      expect(chatTsContent).toContain("getElementById('settingsBtn')");
      expect(chatTsContent).toContain("type: 'openSettings'");
    });

    it('should handle history button click', () => {
      expect(chatTsContent).toContain("getElementById('historyBtn')");
      expect(chatTsContent).toContain("type: 'openHistory'");
    });

    it('should handle burn button click', () => {
      expect(chatTsContent).toContain("getElementById('burnBtn')");
      expect(chatTsContent).toContain('Storage.deleteConversation');
    });
  });

  describe('Empty State Handling', () => {
    it('should show empty state when no messages', () => {
      expect(chatTsContent).toContain("emptyState.style.display = 'flex'");
    });

    it('should hide empty state when messages exist', () => {
      expect(chatTsContent).toContain("emptyState.style.display = 'none'");
    });

    it('should auto-generate title from first user message', () => {
      expect(chatTsContent).toContain('currentConversation.title = prompt.substring(0, 50)');
    });
  });

  describe('Vite Configuration', () => {
    it('should include chat in input entries', () => {
      expect(viteConfigContent).toContain("chat: resolve(__dirname, 'src/chat/index.html')");
    });

    it('should copy chat.html to output', () => {
      expect(viteConfigContent).toContain("const chatPath = `${outDir}/src/chat/index.html`");
      expect(viteConfigContent).toContain("const chatAltPath = `${outDir}/chat.html`");
      expect(viteConfigContent).toContain('copyFileSync(chatPath, chatAltPath)');
    });
  });

  describe('Manifest Configuration', () => {
    it('should include chat.html in Firefox manifest web_accessible_resources', () => {
      expect(manifestFirefoxContent).toContain('chat.html');
    });

    it('should include chat.html in Chrome manifest web_accessible_resources', () => {
      expect(manifestChromeContent).toContain('chat.html');
    });
  });

  describe('i18n Translations', () => {
    it('should have chat section in en.json', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat).toBeDefined();
    });

    it('should have loading translation', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat.loading).toBe('Loading...');
    });

    it('should have notFound translation', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat.notFound).toBe('Conversation not found');
    });

    it('should have emptyTitle translation', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat.emptyTitle).toBe('Start a conversation');
    });

    it('should have emptyHint translation', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat.emptyHint).toBe('Type a message below to begin chatting');
    });

    it('should have newConversation translation', () => {
      const translations = JSON.parse(enJsonContent);
      expect(translations.chat.newConversation).toBe('New conversation');
    });
  });

  describe('All Languages Have Chat Translations', () => {
    const languages = ['nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

    languages.forEach((lang) => {
      it(`should have chat translations in ${lang}.json`, () => {
        const langPath = resolve(__dirname, `../../shared/i18n/${lang}.json`);
        const content = readFileSync(langPath, 'utf-8');
        const translations = JSON.parse(content);
        expect(translations.chat).toBeDefined();
        expect(translations.chat.loading).toBeDefined();
        expect(translations.chat.notFound).toBeDefined();
        expect(translations.chat.emptyTitle).toBeDefined();
        expect(translations.chat.emptyHint).toBeDefined();
        expect(translations.chat.newConversation).toBeDefined();
      });
    });
  });

  describe('Flat Design CSS', () => {
    it('should have CSS custom properties', () => {
      expect(chatHtmlContent).toContain(':root {');
      expect(chatHtmlContent).toContain('--color-primary-500');
      expect(chatHtmlContent).toContain('--color-bg-base');
    });

    it('should use solid borders not shadows', () => {
      expect(chatHtmlContent).toContain('border: 1px solid');
      expect(chatHtmlContent).toContain('border-radius:');
    });

    it('should have transition properties', () => {
      expect(chatHtmlContent).toContain('--transition-default');
      expect(chatHtmlContent).toContain('transition:');
    });
  });
});
