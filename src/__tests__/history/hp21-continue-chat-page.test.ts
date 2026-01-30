/**
 * HP-21: Update Continue button to open chat page
 *
 * Tests that the Continue button in history page opens the chat.html page
 * in a new browser tab instead of the popup window.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read source files for analysis
const serviceWorkerPath = resolve(__dirname, '../../background/service-worker.ts');
const historyTsPath = resolve(__dirname, '../../history/history.ts');
const chatTsxPath = resolve(__dirname, '../../chat/chat.tsx');
const chatHtmlPath = resolve(__dirname, '../../chat/index.html');

let serviceWorkerContent: string;
let historyTsContent: string;
let chatTsxContent: string;
let chatHtmlContent: string;

beforeEach(() => {
  serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');
  historyTsContent = readFileSync(historyTsPath, 'utf-8');
  chatTsxContent = readFileSync(chatTsxPath, 'utf-8');
  chatHtmlContent = readFileSync(chatHtmlPath, 'utf-8');
});

describe('HP-21: Update Continue button to open chat page', () => {
  describe('Service Worker - Opens Chat Page in New Tab', () => {
    it('should open chat.html instead of popup.html', () => {
      expect(serviceWorkerContent).toContain('chat.html');
      expect(serviceWorkerContent).not.toMatch(/continueConversation.*popup\.html/s);
    });

    it('should use chrome.tabs.create instead of chrome.windows.create', () => {
      // Check that continueConversation uses tabs.create
      const continueConvMatch = serviceWorkerContent.match(
        /message\.type === 'continueConversation'[\s\S]*?sendResponse/
      );
      expect(continueConvMatch).toBeTruthy();
      const continueConvBlock = continueConvMatch![0];

      expect(continueConvBlock).toContain('chrome.tabs.create');
      expect(continueConvBlock).not.toContain('chrome.windows.create');
    });

    it('should NOT use popup window type for continueConversation', () => {
      const continueConvMatch = serviceWorkerContent.match(
        /message\.type === 'continueConversation'[\s\S]*?sendResponse/
      );
      expect(continueConvMatch).toBeTruthy();
      const continueConvBlock = continueConvMatch![0];

      expect(continueConvBlock).not.toContain("type: 'popup'");
      expect(continueConvBlock).not.toContain('width:');
      expect(continueConvBlock).not.toContain('height:');
    });

    it('should pass conversationId via URL query parameter', () => {
      expect(serviceWorkerContent).toContain('conversationId=');
      expect(serviceWorkerContent).toContain('encodeURIComponent(convId)');
    });

    it('should construct correct chat page URL', () => {
      expect(serviceWorkerContent).toContain("chrome.runtime.getURL(`chat.html?conversationId=");
    });
  });

  describe('History Page - Continue Button Behavior', () => {
    it('should have continue button with correct class', () => {
      expect(historyTsContent).toContain('class="action-btn continue"');
    });

    it('should send continueConversation message on click', () => {
      expect(historyTsContent).toContain("type: 'continueConversation'");
      expect(historyTsContent).toContain('payload: { conversationId }');
    });

    it('should have openContinuePopup function', () => {
      expect(historyTsContent).toContain('function openContinuePopup');
      expect(historyTsContent).toContain('chrome.runtime.sendMessage');
    });
  });

  describe('Chat Page - Receives Conversation ID (React)', () => {
    it('should read conversationId from URL params', () => {
      expect(chatTsxContent).toContain('URLSearchParams');
      expect(chatTsxContent).toContain("get('conversationId')");
    });

    it('should pass conversationId to Dialog component', () => {
      expect(chatTsxContent).toContain('initialConversationId={conversationId}');
    });

    it('should use Dialog in standalone mode', () => {
      expect(chatTsxContent).toContain('mode="standalone"');
    });

    it('should close window on onClose', () => {
      expect(chatTsxContent).toContain('window.close()');
    });
  });

  describe('Chat Page HTML - Full Page Experience', () => {
    it('should have chat.html file', () => {
      expect(chatHtmlContent).toBeTruthy();
      expect(chatHtmlContent.length).toBeGreaterThan(100);
    });

    it('should have gradient background', () => {
      // HP-19: gradient background on chat page
      expect(chatHtmlContent).toMatch(/background:.*gradient|linear-gradient/i);
    });

    it('should have chat-root mount point', () => {
      expect(chatHtmlContent).toContain('id="chat-root"');
    });

    it('should load chat.tsx module', () => {
      expect(chatHtmlContent).toContain('src="./chat.tsx"');
    });
  });

  describe('Manifest Configuration', () => {
    it('should have chat.html in Firefox manifest web_accessible_resources', () => {
      const manifestPath = resolve(__dirname, '../../../manifest.firefox.json');
      const manifest = readFileSync(manifestPath, 'utf-8');
      expect(manifest).toContain('chat.html');
    });

    it('should have chat.html in Chrome manifest web_accessible_resources', () => {
      const manifestPath = resolve(__dirname, '../../../manifest.chrome.json');
      const manifest = readFileSync(manifestPath, 'utf-8');
      expect(manifest).toContain('chat.html');
    });
  });

  describe('Vite Build Configuration', () => {
    it('should have chat entry point in vite config', () => {
      const viteConfigPath = resolve(__dirname, '../../../vite.config.ts');
      const viteConfig = readFileSync(viteConfigPath, 'utf-8');
      expect(viteConfig).toContain('chat:');
      expect(viteConfig).toContain("'src/chat/index.html'");
    });
  });

  describe('Migration from Popup Window', () => {
    it('should NOT open popup window for continueConversation anymore', () => {
      // The block handling continueConversation should use tabs, not windows
      const lines = serviceWorkerContent.split('\n');
      let inContinueBlock = false;
      let usesWindowsCreate = false;

      for (const line of lines) {
        if (line.includes("message.type === 'continueConversation'")) {
          inContinueBlock = true;
        }
        if (inContinueBlock) {
          if (line.includes('chrome.windows.create')) {
            usesWindowsCreate = true;
          }
          if (line.includes('sendResponse')) {
            break;
          }
        }
      }

      expect(usesWindowsCreate).toBe(false);
    });

    it('should NOT specify window dimensions for continueConversation', () => {
      const continueConvMatch = serviceWorkerContent.match(
        /continueConversation[\s\S]*?sendResponse\(\{ success: true \}\)/
      );
      expect(continueConvMatch).toBeTruthy();
      const block = continueConvMatch![0];

      expect(block).not.toContain('width:');
      expect(block).not.toContain('height:');
    });
  });
});
