/**
 * DM-6: Apply dark theme to settings page
 * Tests for verifying dark mode support in the settings page
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('DM-6: Apply dark theme to settings page', () => {
  describe('settings.ts theme initialization', () => {
    const settingsPath = path.join(__dirname, '../../settings/settings.ts');
    let settingsContent: string;

    beforeEach(() => {
      settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    });

    it('should import initTheme from theme module', () => {
      expect(settingsContent).toContain("import { initTheme } from '../shared/theme'");
    });

    it('should call initTheme() on DOMContentLoaded', () => {
      expect(settingsContent).toContain('await initTheme()');
    });

    it('should call initTheme before other initializations', () => {
      const initThemeIndex = settingsContent.indexOf('await initTheme()');
      const initLanguageIndex = settingsContent.indexOf('await initLanguage()');
      expect(initThemeIndex).toBeLessThan(initLanguageIndex);
    });
  });

  describe('index.html dark mode CSS variables', () => {
    const htmlPath = path.join(__dirname, '../../settings/index.html');
    let htmlContent: string;

    beforeEach(() => {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    });

    it('should have [data-theme="dark"] selector', () => {
      expect(htmlContent).toContain('[data-theme="dark"]');
    });

    it('should have [data-theme="auto"] in @media prefers-color-scheme', () => {
      expect(htmlContent).toContain('@media (prefers-color-scheme: dark)');
      expect(htmlContent).toContain('[data-theme="auto"]');
    });

    // Dark mode primary colors
    it('should define dark mode primary colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-primary-50: #0A100D');
      expect(darkSection).toContain('--color-primary-500: #4A7C54');
    });

    // Dark mode backgrounds
    it('should define dark mode background colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-bg-base: #121812');
      expect(darkSection).toContain('--color-bg-elevated: #1A221A');
      expect(darkSection).toContain('--color-bg-muted: #1E261E');
      expect(darkSection).toContain('--color-bg-subtle: #242E24');
    });

    // Dark mode surfaces
    it('should define dark mode surface colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-surface-default: #1A221A');
      expect(darkSection).toContain('--color-surface-hover: #242E24');
      expect(darkSection).toContain('--color-surface-active: #2A352A');
    });

    // Dark mode borders
    it('should define dark mode border colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-border-light: #2A352A');
      expect(darkSection).toContain('--color-border-default: #3A4A3A');
      expect(darkSection).toContain('--color-border-strong: #4A5A4A');
      expect(darkSection).toContain('--color-border-focus: #75A683');
    });

    // Dark mode text colors
    it('should define dark mode text colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-text-primary: #E8F0EA');
      expect(darkSection).toContain('--color-text-secondary: #B8C4BC');
      expect(darkSection).toContain('--color-text-tertiary: #8A9A8C');
      expect(darkSection).toContain('--color-text-link: #75A683');
    });

    // Dark mode accent colors
    it('should define dark mode accent colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-accent-success: #75A683');
      expect(darkSection).toContain('--color-accent-error: #D87070');
    });

    // Dark mode status colors
    it('should define dark mode status colors', () => {
      const darkSection = htmlContent.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(darkSection).toContain('--color-status-success-bg: #1A2A1E');
      expect(darkSection).toContain('--color-status-error-bg: #2A1A1A');
    });
  });

  describe('index.html uses CSS variables for styling', () => {
    const htmlPath = path.join(__dirname, '../../settings/index.html');
    let htmlContent: string;

    beforeEach(() => {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    });

    it('should use --color-bg-base for body background', () => {
      expect(htmlContent).toContain('background: var(--color-bg-base)');
    });

    it('should use --color-text-primary for body text', () => {
      expect(htmlContent).toContain('color: var(--color-text-primary)');
    });

    it('should use --color-surface-default for form inputs', () => {
      expect(htmlContent).toContain('background: var(--color-surface-default)');
    });

    it('should use --color-border-default for input borders', () => {
      expect(htmlContent).toContain('border: 1px solid var(--color-border-default)');
    });

    it('should use --color-border-strong for hover states', () => {
      expect(htmlContent).toContain('border-color: var(--color-border-strong)');
    });

    it('should use --color-border-focus for focus states', () => {
      expect(htmlContent).toContain('border-color: var(--color-border-focus)');
    });

    it('should use --color-text-secondary for labels', () => {
      expect(htmlContent).toContain('color: var(--color-text-secondary)');
    });

    it('should use --color-text-tertiary for placeholders', () => {
      expect(htmlContent).toContain('color: var(--color-text-tertiary)');
    });

    it('should use --color-text-link for links', () => {
      expect(htmlContent).toContain('color: var(--color-text-link)');
    });

    it('should use --color-text-link-hover for link hover', () => {
      expect(htmlContent).toContain('color: var(--color-text-link-hover)');
    });

    it('should use --color-accent-success for primary button', () => {
      expect(htmlContent).toContain('background: var(--color-accent-success)');
    });

    it('should use --color-accent-success-hover for button hover', () => {
      expect(htmlContent).toContain('background: var(--color-accent-success-hover)');
    });

    it('should use --color-status-success-bg for success status', () => {
      expect(htmlContent).toContain('background: var(--color-status-success-bg)');
    });

    it('should use --color-status-error-bg for error status', () => {
      expect(htmlContent).toContain('background: var(--color-status-error-bg)');
    });

    it('should use --color-surface-hover for secondary button hover', () => {
      expect(htmlContent).toContain('background: var(--color-surface-hover)');
    });

    it('should use --color-accent-error for danger button', () => {
      expect(htmlContent).toContain('background: var(--color-accent-error)');
    });
  });

  describe('auto mode CSS variables', () => {
    const htmlPath = path.join(__dirname, '../../settings/index.html');
    let htmlContent: string;

    beforeEach(() => {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    });

    it('should define auto mode background colors in @media query', () => {
      // Extract the media query section
      const mediaMatch = htmlContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\[data-theme="auto"\]\s*\{[\s\S]*?\}\s*\}/);
      expect(mediaMatch).not.toBeNull();
      const autoSection = mediaMatch?.[0] || '';
      expect(autoSection).toContain('--color-bg-base: #121812');
      expect(autoSection).toContain('--color-bg-elevated: #1A221A');
    });

    it('should define auto mode text colors in @media query', () => {
      const mediaMatch = htmlContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\[data-theme="auto"\]\s*\{[\s\S]*?\}\s*\}/);
      const autoSection = mediaMatch?.[0] || '';
      expect(autoSection).toContain('--color-text-primary: #E8F0EA');
      expect(autoSection).toContain('--color-text-secondary: #B8C4BC');
    });

    it('should define auto mode surface colors in @media query', () => {
      const mediaMatch = htmlContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\[data-theme="auto"\]\s*\{[\s\S]*?\}\s*\}/);
      const autoSection = mediaMatch?.[0] || '';
      expect(autoSection).toContain('--color-surface-default: #1A221A');
      expect(autoSection).toContain('--color-surface-hover: #242E24');
    });

    it('should define auto mode border colors in @media query', () => {
      const mediaMatch = htmlContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\[data-theme="auto"\]\s*\{[\s\S]*?\}\s*\}/);
      const autoSection = mediaMatch?.[0] || '';
      expect(autoSection).toContain('--color-border-default: #3A4A3A');
      expect(autoSection).toContain('--color-border-focus: #75A683');
    });

    it('should define auto mode accent colors in @media query', () => {
      const mediaMatch = htmlContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\[data-theme="auto"\]\s*\{[\s\S]*?\}\s*\}/);
      const autoSection = mediaMatch?.[0] || '';
      expect(autoSection).toContain('--color-accent-success: #75A683');
      expect(autoSection).toContain('--color-accent-error: #D87070');
    });
  });

  describe('light mode CSS variables (default)', () => {
    const htmlPath = path.join(__dirname, '../../settings/index.html');
    let htmlContent: string;

    beforeEach(() => {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    });

    it('should define light mode as default in :root', () => {
      expect(htmlContent).toContain(':root {');
    });

    it('should define light mode background base as #FAFBF9', () => {
      // Check in :root section
      const rootMatch = htmlContent.match(/:root\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(rootMatch).toContain('--color-bg-base: #FAFBF9');
    });

    it('should define light mode text primary as #2D3A30', () => {
      const rootMatch = htmlContent.match(/:root\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(rootMatch).toContain('--color-text-primary: #2D3A30');
    });

    it('should define light mode primary-500 as #3A5A40', () => {
      const rootMatch = htmlContent.match(/:root\s*\{[\s\S]*?\}/)?.[0] || '';
      expect(rootMatch).toContain('--color-primary-500: #3A5A40');
    });
  });
});
