/**
 * HP-18: Create chat page for continued conversations
 * HP-23: Reuse Dialog component in chat page
 *
 * Tests that:
 * 1. chat.html entry point exists with minimal mount point
 * 2. chat.tsx uses React with Dialog component in standalone mode
 * 3. Vite build configuration includes chat entry
 * 4. Conversation ID loaded from URL parameter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Source file paths
const chatHtmlPath = resolve(__dirname, '../../chat/index.html');
const chatTsxPath = resolve(__dirname, '../../chat/chat.tsx');
const viteConfigPath = resolve(__dirname, '../../../vite.config.ts');
const manifestFirefoxPath = resolve(__dirname, '../../../manifest.firefox.json');
const manifestChromePath = resolve(__dirname, '../../../manifest.chrome.json');

let chatHtmlContent: string;
let chatTsxContent: string;
let viteConfigContent: string;
let manifestFirefoxContent: string;
let manifestChromeContent: string;

beforeEach(() => {
  chatHtmlContent = readFileSync(chatHtmlPath, 'utf-8');
  chatTsxContent = readFileSync(chatTsxPath, 'utf-8');
  viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  manifestFirefoxContent = readFileSync(manifestFirefoxPath, 'utf-8');
  manifestChromeContent = readFileSync(manifestChromePath, 'utf-8');
});

describe('HP-18/HP-23: Chat page with Dialog component', () => {
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

    it('should have chat-root mount point', () => {
      expect(chatHtmlContent).toContain('id="chat-root"');
    });

    it('should load chat.tsx module', () => {
      expect(chatHtmlContent).toContain('<script type="module" src="./chat.tsx"></script>');
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

    it('should have dark mode gradient', () => {
      expect(chatHtmlContent).toContain('[data-theme="dark"]');
      expect(chatHtmlContent).toContain('#0A100D');
      expect(chatHtmlContent).toContain('#142019');
    });
  });

  describe('Chat TypeScript/React Setup (HP-23)', () => {
    it('should have chat.tsx file', () => {
      expect(existsSync(chatTsxPath)).toBe(true);
    });

    it('should import createRoot from react-dom/client', () => {
      expect(chatTsxContent).toContain("import { createRoot } from 'react-dom/client'");
    });

    it('should import Dialog component', () => {
      expect(chatTsxContent).toContain("import Dialog from '../content/components/Dialog'");
    });

    it('should import initLanguage', () => {
      expect(chatTsxContent).toContain("import { initLanguage }");
    });

    it('should import initTheme', () => {
      expect(chatTsxContent).toContain("import { initTheme }");
    });

    it('should import allCssVariables for theming', () => {
      expect(chatTsxContent).toContain("import { allCssVariables }");
    });

    it('should import highlight.js styles', () => {
      expect(chatTsxContent).toContain("import 'highlight.js/styles/github.css'");
    });
  });

  describe('Dialog Component Usage (HP-23)', () => {
    it('should render Dialog in standalone mode', () => {
      expect(chatTsxContent).toContain('mode="standalone"');
    });

    it('should pass conversationId from URL to Dialog', () => {
      expect(chatTsxContent).toContain('URLSearchParams');
      expect(chatTsxContent).toContain("params.get('conversationId')");
      expect(chatTsxContent).toContain('initialConversationId={conversationId}');
    });

    it('should render Dialog with isOpen true', () => {
      expect(chatTsxContent).toContain('isOpen={true}');
    });

    it('should close window when onClose is called', () => {
      expect(chatTsxContent).toContain('window.close()');
      expect(chatTsxContent).toContain('onClose={handleClose}');
    });
  });

  describe('Initialization', () => {
    it('should have init function', () => {
      expect(chatTsxContent).toContain('async function init()');
    });

    it('should inject CSS variables', () => {
      expect(chatTsxContent).toContain('allCssVariables');
      expect(chatTsxContent).toContain("document.head.appendChild");
    });

    it('should initialize theme system', () => {
      expect(chatTsxContent).toContain('await initTheme()');
    });

    it('should initialize language', () => {
      expect(chatTsxContent).toContain('await initLanguage()');
    });

    it('should mount React app to chat-root', () => {
      expect(chatTsxContent).toContain("getElementById('chat-root')");
      expect(chatTsxContent).toContain('createRoot(container)');
      expect(chatTsxContent).toContain('root.render(<ChatApp />)');
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

  describe('Minimal HTML Structure', () => {
    it('should have minimal HTML without inline components', () => {
      // Should NOT have old inline structure
      expect(chatHtmlContent).not.toContain('id="messagesContainer"');
      expect(chatHtmlContent).not.toContain('id="inputTextarea"');
      expect(chatHtmlContent).not.toContain('id="sendBtn"');
      expect(chatHtmlContent).not.toContain('id="burnBtn"');
      expect(chatHtmlContent).not.toContain('id="streamingIndicator"');
    });

    it('should have just root mount point', () => {
      expect(chatHtmlContent).toContain('<div id="chat-root"></div>');
    });
  });
});
