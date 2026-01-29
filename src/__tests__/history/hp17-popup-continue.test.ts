/**
 * HP-17: Continue conversation opens in new window
 *
 * Tests that the Continue button on history page opens a popup window
 * instead of showing inline input area.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read source files for analysis
const historyTsPath = resolve(__dirname, '../../history/history.ts');
const historyHtmlPath = resolve(__dirname, '../../history/index.html');
const popupTsPath = resolve(__dirname, '../../popup/popup.ts');
const popupHtmlPath = resolve(__dirname, '../../popup/index.html');
const serviceWorkerPath = resolve(__dirname, '../../background/service-worker.ts');
const typesPath = resolve(__dirname, '../../shared/types.ts');

let historyTsContent: string;
let historyHtmlContent: string;
let popupTsContent: string;
let popupHtmlContent: string;
let serviceWorkerContent: string;
let typesContent: string;

beforeEach(() => {
  historyTsContent = readFileSync(historyTsPath, 'utf-8');
  historyHtmlContent = readFileSync(historyHtmlPath, 'utf-8');
  popupTsContent = readFileSync(popupTsPath, 'utf-8');
  popupHtmlContent = readFileSync(popupHtmlPath, 'utf-8');
  serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');
  typesContent = readFileSync(typesPath, 'utf-8');
});

describe('HP-17: Continue conversation opens in new window', () => {
  describe('Background Message Type', () => {
    it('should have continueConversation message type defined', () => {
      expect(typesContent).toContain("type: 'continueConversation'");
      expect(typesContent).toContain('conversationId: string');
    });

    it('should handle continueConversation in service worker', () => {
      expect(serviceWorkerContent).toContain("message.type === 'continueConversation'");
      expect(serviceWorkerContent).toContain('chrome.windows.create');
      expect(serviceWorkerContent).toContain('popup.html');
      expect(serviceWorkerContent).toContain('conversationId');
    });

    it('should open popup window with correct options', () => {
      expect(serviceWorkerContent).toContain("type: 'popup'");
      expect(serviceWorkerContent).toContain('width: 800');
      expect(serviceWorkerContent).toContain('height: 700');
    });
  });

  describe('History Page - Continue Button', () => {
    it('should have continue button in history list', () => {
      expect(historyTsContent).toContain("class=\"action-btn continue\"");
      expect(historyTsContent).toContain('continueLabel');
    });

    it('should call openContinuePopup when continue is clicked', () => {
      expect(historyTsContent).toContain('openContinuePopup');
      expect(historyTsContent).toContain("type: 'continueConversation'");
    });

    it('should send message with conversationId', () => {
      expect(historyTsContent).toContain('payload: { conversationId }');
    });
  });

  describe('History Page - Removed Inline Input', () => {
    it('should NOT have streaming indicator code', () => {
      expect(historyTsContent).not.toContain('streaming-indicator');
      expect(historyTsContent).not.toContain('streamingContent');
      expect(historyTsContent).not.toContain('handleStreamChunk');
      expect(historyTsContent).not.toContain('handleStreamEnd');
    });

    it('should NOT have input area code', () => {
      expect(historyTsContent).not.toContain('input-textarea');
      expect(historyTsContent).not.toContain('send-btn');
      expect(historyTsContent).not.toContain('handleSendMessage');
    });

    it('should NOT have context toggle code', () => {
      expect(historyTsContent).not.toContain('context-toggle-btn');
      expect(historyTsContent).not.toContain('contextEnabledMap');
      expect(historyTsContent).not.toContain('handleContextToggle');
    });

    it('should NOT have streaming state variables', () => {
      expect(historyTsContent).not.toContain('let isStreaming');
      expect(historyTsContent).not.toContain('let streamingContent');
      expect(historyTsContent).not.toContain('let activeConversationId');
    });

    it('should NOT have inline input CSS in history HTML', () => {
      expect(historyHtmlContent).not.toContain('.input-area');
      expect(historyHtmlContent).not.toContain('.input-textarea');
      expect(historyHtmlContent).not.toContain('.send-btn');
      expect(historyHtmlContent).not.toContain('.streaming-indicator');
      expect(historyHtmlContent).not.toContain('.context-toggle');
    });

    it('should NOT import getApiKey in history.ts', () => {
      expect(historyTsContent).not.toContain("import { getApiKey }");
    });

    it('should NOT import Message type in history.ts', () => {
      expect(historyTsContent).not.toContain('Message,');
    });
  });

  describe('Popup Page Structure', () => {
    it('should have popup HTML file', () => {
      expect(popupHtmlContent).toBeTruthy();
    });

    it('should have popup TS file', () => {
      expect(popupTsContent).toBeTruthy();
    });

    it('should read conversationId from URL params', () => {
      expect(popupTsContent).toContain('URLSearchParams');
      expect(popupTsContent).toContain("get('conversationId')");
    });

    it('should load conversation from storage', () => {
      expect(popupTsContent).toContain('Storage.getConversations');
      expect(popupTsContent).toContain('currentConversation');
    });

    it('should render messages', () => {
      expect(popupTsContent).toContain('renderMessages');
      expect(popupTsContent).toContain('messagesContainer');
    });

    it('should have input area for sending messages', () => {
      expect(popupTsContent).toContain('handleSendMessage');
      expect(popupTsContent).toContain('inputTextarea');
      expect(popupTsContent).toContain('sendBtn');
    });

    it('should have context toggle', () => {
      expect(popupTsContent).toContain('renderContextToggle');
      expect(popupTsContent).toContain('contextEnabled');
    });

    it('should have persona selector', () => {
      expect(popupTsContent).toContain('renderPersonaSelector');
      expect(popupTsContent).toContain('personaSelect');
    });

    it('should handle streaming responses', () => {
      expect(popupTsContent).toContain('handleStreamChunk');
      expect(popupTsContent).toContain('handleStreamEnd');
      expect(popupTsContent).toContain('streamingContent');
    });

    it('should save conversation after response', () => {
      expect(popupTsContent).toContain('Storage.saveConversation');
    });

    it('should show error state for invalid conversation', () => {
      expect(popupTsContent).toContain('showError');
      expect(popupTsContent).toContain('errorState');
    });

    it('should have close button', () => {
      expect(popupTsContent).toContain('closeBtn');
      expect(popupTsContent).toContain('window.close');
    });

    it('should have settings button', () => {
      expect(popupTsContent).toContain('settingsBtn');
      expect(popupTsContent).toContain("type: 'openSettings'");
    });

    it('should have burn button for clearing conversation', () => {
      expect(popupTsContent).toContain('burnBtn');
      expect(popupTsContent).toContain('Storage.deleteConversation');
    });
  });

  describe('Popup HTML Structure', () => {
    it('should have header with logo and title', () => {
      expect(popupHtmlContent).toContain('Hootly');
      expect(popupHtmlContent).toContain('id="logo"');
    });

    it('should have loading state', () => {
      expect(popupHtmlContent).toContain('id="loadingState"');
      expect(popupHtmlContent).toContain('data-i18n="popup.loading"');
    });

    it('should have error state', () => {
      expect(popupHtmlContent).toContain('id="errorState"');
      expect(popupHtmlContent).toContain('data-i18n="popup.notFound"');
    });

    it('should have messages container', () => {
      expect(popupHtmlContent).toContain('id="messagesContainer"');
    });

    it('should have input section', () => {
      expect(popupHtmlContent).toContain('input-section');
      expect(popupHtmlContent).toContain('id="inputTextarea"');
      expect(popupHtmlContent).toContain('id="sendBtn"');
    });

    it('should have context toggle container', () => {
      expect(popupHtmlContent).toContain('id="contextToggle"');
    });

    it('should have persona selector container', () => {
      expect(popupHtmlContent).toContain('id="personaSelector"');
    });

    it('should have streaming indicator', () => {
      expect(popupHtmlContent).toContain('id="streamingIndicator"');
      expect(popupHtmlContent).toContain('id="streamingContent"');
    });

    it('should have cancel hint', () => {
      expect(popupHtmlContent).toContain('id="cancelHint"');
    });

    it('should use flat design CSS variables', () => {
      expect(popupHtmlContent).toContain('--color-primary-500');
      expect(popupHtmlContent).toContain('--color-bg-base');
      expect(popupHtmlContent).toContain('--color-border-focus');
    });
  });

  describe('Popup i18n Translations', () => {
    it('should have popup section in en.json', () => {
      const enJsonPath = resolve(__dirname, '../../shared/i18n/en.json');
      const enJson = readFileSync(enJsonPath, 'utf-8');
      expect(enJson).toContain('"popup"');
      expect(enJson).toContain('"loading"');
      expect(enJson).toContain('"notFound"');
    });
  });

  describe('Build Configuration', () => {
    it('should have popup entry point in vite config', () => {
      const viteConfigPath = resolve(__dirname, '../../../vite.config.ts');
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');
      expect(viteConfig).toContain("popup: resolve(__dirname, 'src/popup/index.html')");
      expect(viteConfig).toContain('popup.html');
    });

    it('should have popup.html in Firefox manifest', () => {
      const manifestPath = resolve(__dirname, '../../../manifest.firefox.json');
      const manifest = readFileSync(manifestPath, 'utf-8');
      expect(manifest).toContain('popup.html');
    });

    it('should have popup.html in Chrome manifest', () => {
      const manifestPath = resolve(__dirname, '../../../manifest.chrome.json');
      const manifest = readFileSync(manifestPath, 'utf-8');
      expect(manifest).toContain('popup.html');
    });
  });

  describe('Popup Window Configuration', () => {
    it('should pass conversationId as URL parameter', () => {
      expect(serviceWorkerContent).toContain('encodeURIComponent(convId)');
      expect(serviceWorkerContent).toContain('conversationId=');
    });

    it('should use popup window type', () => {
      expect(serviceWorkerContent).toContain("type: 'popup'");
    });
  });
});
