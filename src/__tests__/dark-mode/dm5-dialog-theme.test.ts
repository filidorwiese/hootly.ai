/**
 * DM-5: Apply dark theme to dialog
 * Tests for verifying dark mode support in the Dialog component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('DM-5: Apply dark theme to dialog', () => {
  describe('iframe-app.tsx theme initialization', () => {
    const iframeAppPath = path.join(__dirname, '../../content/iframe-app.tsx');
    let iframeAppContent: string;

    beforeEach(() => {
      iframeAppContent = fs.readFileSync(iframeAppPath, 'utf-8');
    });

    it('should import initTheme from theme module', () => {
      expect(iframeAppContent).toContain("import { initTheme } from '../shared/theme'");
    });

    it('should import allCssVariables from styles module', () => {
      expect(iframeAppContent).toContain("import { allCssVariables } from '../shared/styles'");
    });

    it('should inject CSS variables style element', () => {
      expect(iframeAppContent).toContain("document.createElement('style')");
      expect(iframeAppContent).toContain("styleEl.id = 'hootly-theme-vars'");
      expect(iframeAppContent).toContain('styleEl.textContent = allCssVariables');
      expect(iframeAppContent).toContain('document.head.appendChild(styleEl)');
    });

    it('should call initTheme()', () => {
      expect(iframeAppContent).toContain('await initTheme()');
    });
  });

  describe('Dialog.tsx uses CSS variables', () => {
    const dialogPath = path.join(__dirname, '../../content/components/Dialog.tsx');
    let dialogContent: string;

    beforeEach(() => {
      dialogContent = fs.readFileSync(dialogPath, 'utf-8');
    });

    it('should use --color-bg-base for dialog background', () => {
      expect(dialogContent).toContain('var(--color-bg-base)');
    });

    it('should use --color-bg-muted for header/footer', () => {
      expect(dialogContent).toContain('var(--color-bg-muted)');
    });

    it('should use --color-border-default for dialog border', () => {
      expect(dialogContent).toContain('var(--color-border-default)');
    });

    it('should use --color-border-light for section borders', () => {
      expect(dialogContent).toContain('var(--color-border-light)');
    });

    it('should use --color-text-primary for main text', () => {
      expect(dialogContent).toContain('var(--color-text-primary)');
    });

    it('should use --color-text-secondary for secondary text', () => {
      expect(dialogContent).toContain('var(--color-text-secondary)');
    });

    it('should use --color-text-tertiary for muted text', () => {
      expect(dialogContent).toContain('var(--color-text-tertiary)');
    });

    it('should use --color-surface-hover for hover states', () => {
      expect(dialogContent).toContain('var(--color-surface-hover)');
    });

    it('should use --color-surface-active for active states', () => {
      expect(dialogContent).toContain('var(--color-surface-active)');
    });

    it('should use --color-primary-500 for accents', () => {
      expect(dialogContent).toContain('var(--color-primary-500)');
    });

    it('should use --color-bg-subtle for subtle backgrounds', () => {
      expect(dialogContent).toContain('var(--color-bg-subtle)');
    });
  });

  describe('InputArea.tsx uses CSS variables', () => {
    const inputAreaPath = path.join(__dirname, '../../content/components/InputArea.tsx');
    let inputAreaContent: string;

    beforeEach(() => {
      inputAreaContent = fs.readFileSync(inputAreaPath, 'utf-8');
    });

    it('should use --color-surface-default for textarea background', () => {
      expect(inputAreaContent).toContain('var(--color-surface-default)');
    });

    it('should use --color-border-default for textarea border', () => {
      expect(inputAreaContent).toContain('var(--color-border-default)');
    });

    it('should use --color-border-focus for focus border', () => {
      expect(inputAreaContent).toContain('var(--color-border-focus)');
    });

    it('should use --color-text-primary for input text', () => {
      expect(inputAreaContent).toContain('var(--color-text-primary)');
    });

    it('should use --color-text-tertiary for placeholder', () => {
      expect(inputAreaContent).toContain('var(--color-text-tertiary)');
    });

    it('should use --color-surface-disabled for disabled state', () => {
      expect(inputAreaContent).toContain('var(--color-surface-disabled)');
    });

    it('should use --color-text-secondary for disabled text', () => {
      expect(inputAreaContent).toContain('var(--color-text-secondary)');
    });
  });

  describe('Response.tsx uses CSS variables', () => {
    const responsePath = path.join(__dirname, '../../content/components/Response.tsx');
    let responseContent: string;

    beforeEach(() => {
      responseContent = fs.readFileSync(responsePath, 'utf-8');
    });

    it('should use --color-bg-base for container background', () => {
      expect(responseContent).toContain('var(--color-bg-base)');
    });

    it('should use --color-text-primary for main text', () => {
      expect(responseContent).toContain('var(--color-text-primary)');
    });

    it('should use --color-text-secondary for secondary text', () => {
      expect(responseContent).toContain('var(--color-text-secondary)');
    });

    it('should use --color-message-user-bg for user messages', () => {
      expect(responseContent).toContain('var(--color-message-user-bg)');
    });

    it('should use --color-message-assistant-bg for assistant messages', () => {
      expect(responseContent).toContain('var(--color-message-assistant-bg)');
    });

    it('should use --color-message-user-border for user message border', () => {
      expect(responseContent).toContain('var(--color-message-user-border)');
    });

    it('should use --color-message-assistant-border for assistant message border', () => {
      expect(responseContent).toContain('var(--color-message-assistant-border)');
    });

    it('should use --color-primary-500 for streaming indicator', () => {
      expect(responseContent).toContain('var(--color-primary-500)');
    });

    it('should use --color-status-error-bg for error background', () => {
      expect(responseContent).toContain('var(--color-status-error-bg)');
    });

    it('should use --color-accent-error for error accent', () => {
      expect(responseContent).toContain('var(--color-accent-error)');
    });

    it('should use --color-surface-default for copy button', () => {
      expect(responseContent).toContain('var(--color-surface-default)');
    });

    it('should use --color-surface-hover for hover states', () => {
      expect(responseContent).toContain('var(--color-surface-hover)');
    });

    it('should use --color-border-default for scrollbar thumb', () => {
      expect(responseContent).toContain('var(--color-border-default)');
    });

    it('should use --color-bg-subtle for inline code background', () => {
      expect(responseContent).toContain('var(--color-bg-subtle)');
    });

    it('should use --color-text-link for links', () => {
      expect(responseContent).toContain('var(--color-text-link)');
    });

    it('should use --color-text-link-hover for link hover', () => {
      expect(responseContent).toContain('var(--color-text-link-hover)');
    });

    it('should use --color-primary-800 for code block background', () => {
      expect(responseContent).toContain('var(--color-primary-800)');
    });

    it('should use --color-primary-50 for code text', () => {
      expect(responseContent).toContain('var(--color-primary-50)');
    });
  });

  describe('ContextToggle.tsx uses CSS variables', () => {
    const contextTogglePath = path.join(__dirname, '../../content/components/ContextToggle.tsx');
    let contextToggleContent: string;

    beforeEach(() => {
      contextToggleContent = fs.readFileSync(contextTogglePath, 'utf-8');
    });

    it('should use --color-border-focus for enabled border', () => {
      expect(contextToggleContent).toContain('var(--color-border-focus)');
    });

    it('should use --color-border-default for default border', () => {
      expect(contextToggleContent).toContain('var(--color-border-default)');
    });

    it('should use --color-primary-50 for enabled background', () => {
      expect(contextToggleContent).toContain('var(--color-primary-50)');
    });

    it('should use --color-surface-default for default background', () => {
      expect(contextToggleContent).toContain('var(--color-surface-default)');
    });

    it('should use --color-status-info-bg for selection badge', () => {
      expect(contextToggleContent).toContain('var(--color-status-info-bg)');
    });

    it('should use --color-status-success-bg for full page badge', () => {
      expect(contextToggleContent).toContain('var(--color-status-success-bg)');
    });

    it('should use --color-surface-disabled for disabled badge', () => {
      expect(contextToggleContent).toContain('var(--color-surface-disabled)');
    });
  });

  describe('PersonaSelector.tsx uses CSS variables', () => {
    const personaSelectorPath = path.join(__dirname, '../../content/components/PersonaSelector.tsx');
    let personaSelectorContent: string;

    beforeEach(() => {
      personaSelectorContent = fs.readFileSync(personaSelectorPath, 'utf-8');
    });

    it('should use --color-primary-500 for trigger text', () => {
      expect(personaSelectorContent).toContain('var(--color-primary-500)');
    });

    it('should use --color-bg-base for dropdown background', () => {
      expect(personaSelectorContent).toContain('var(--color-bg-base)');
    });

    it('should use --color-border-default for dropdown border', () => {
      expect(personaSelectorContent).toContain('var(--color-border-default)');
    });

    it('should use --color-surface-hover for hover states', () => {
      expect(personaSelectorContent).toContain('var(--color-surface-hover)');
    });

    it('should use --color-primary-50 for selected option', () => {
      expect(personaSelectorContent).toContain('var(--color-primary-50)');
    });

    it('should use --color-text-primary for option text', () => {
      expect(personaSelectorContent).toContain('var(--color-text-primary)');
    });

    it('should use --color-text-tertiary for muted text', () => {
      expect(personaSelectorContent).toContain('var(--color-text-tertiary)');
    });

    it('should use --color-bg-muted for custom group background', () => {
      expect(personaSelectorContent).toContain('var(--color-bg-muted)');
    });

    it('should use --color-border-light for divider', () => {
      expect(personaSelectorContent).toContain('var(--color-border-light)');
    });
  });

  describe('ModelSelector.tsx uses CSS variables', () => {
    const modelSelectorPath = path.join(__dirname, '../../content/components/ModelSelector.tsx');
    let modelSelectorContent: string;

    beforeEach(() => {
      modelSelectorContent = fs.readFileSync(modelSelectorPath, 'utf-8');
    });

    it('should use --color-text-secondary for trigger text', () => {
      expect(modelSelectorContent).toContain('var(--color-text-secondary)');
    });

    it('should use --color-bg-base for dropdown background', () => {
      expect(modelSelectorContent).toContain('var(--color-bg-base)');
    });

    it('should use --color-border-default for dropdown border', () => {
      expect(modelSelectorContent).toContain('var(--color-border-default)');
    });

    it('should use --color-surface-hover for hover states', () => {
      expect(modelSelectorContent).toContain('var(--color-surface-hover)');
    });

    it('should use --color-primary-50 for selected option', () => {
      expect(modelSelectorContent).toContain('var(--color-primary-50)');
    });

    it('should use --color-text-primary for option text', () => {
      expect(modelSelectorContent).toContain('var(--color-text-primary)');
    });

    it('should use --color-text-tertiary for ID text', () => {
      expect(modelSelectorContent).toContain('var(--color-text-tertiary)');
    });
  });

  describe('PRD step verification', () => {
    it('Step 1: Dialog.tsx uses CSS variables', () => {
      const dialogPath = path.join(__dirname, '../../content/components/Dialog.tsx');
      const dialogContent = fs.readFileSync(dialogPath, 'utf-8');
      // Verify Dialog uses at least 5 different CSS variables
      const cssVarMatches = dialogContent.match(/var\(--color-/g) || [];
      expect(cssVarMatches.length).toBeGreaterThanOrEqual(5);
    });

    it('Step 2: Dark theme styles applied conditionally via CSS variables', () => {
      const iframeAppPath = path.join(__dirname, '../../content/iframe-app.tsx');
      const iframeAppContent = fs.readFileSync(iframeAppPath, 'utf-8');
      // Verify allCssVariables is injected (contains both light and dark)
      expect(iframeAppContent).toContain('allCssVariables');
    });

    it('Step 3: Header, body, input area styled correctly', () => {
      const dialogPath = path.join(__dirname, '../../content/components/Dialog.tsx');
      const dialogContent = fs.readFileSync(dialogPath, 'utf-8');

      // Header uses CSS vars
      expect(dialogContent).toContain('var(--color-bg-muted)');

      // Input section uses CSS vars
      expect(dialogContent).toContain('var(--color-border-light)');

      // Text colors use CSS vars
      expect(dialogContent).toContain('var(--color-text-primary)');
    });

    it('Step 4: Components can work in both light and dark modes', () => {
      // This is verified by using CSS variables instead of hardcoded colors
      // When data-theme changes, the CSS variables automatically update
      const iframeAppPath = path.join(__dirname, '../../content/iframe-app.tsx');
      const iframeAppContent = fs.readFileSync(iframeAppPath, 'utf-8');

      // initTheme sets the data-theme attribute
      expect(iframeAppContent).toContain('initTheme');

      // CSS variables include dark mode variants
      expect(iframeAppContent).toContain('allCssVariables');
    });
  });
});
