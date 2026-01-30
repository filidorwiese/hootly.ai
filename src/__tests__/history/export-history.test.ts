import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual HTML file
const htmlPath = path.resolve(__dirname, '../../history/index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Read the TypeScript file to check for export functionality
const tsPath = path.resolve(__dirname, '../../history/history.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');

describe('HP-13: Export chat history to JSON', () => {
  describe('Export button in header', () => {
    it('should have an export button in the history page header', () => {
      expect(htmlContent).toContain('id="exportBtn"');
    });

    it('should have action-buttons container for action buttons', () => {
      expect(htmlContent).toContain('class="action-buttons"');
    });

    it('should have export button inside action-buttons', () => {
      const actionButtonsMatch = htmlContent.match(/<div class="action-buttons">([\s\S]*?)<\/div>/);
      expect(actionButtonsMatch).not.toBeNull();
      expect(actionButtonsMatch![1]).toContain('id="exportBtn"');
    });

    it('should have proper CSS styling for action-btn-header class', () => {
      expect(htmlContent).toContain('.action-btn-header');
      expect(htmlContent).toContain('.action-btn-header:hover');
    });

    it('should have data-i18n attribute for localization', () => {
      expect(htmlContent).toContain('data-i18n="history.export"');
    });
  });

  describe('Export function implementation', () => {
    it('should have exportHistory function in history.ts', () => {
      expect(tsContent).toContain('async function exportHistory');
    });

    it('should call Storage.getConversations to get all conversations', () => {
      expect(tsContent).toContain('Storage.getConversations');
    });

    it('should use JSON.stringify for export', () => {
      expect(tsContent).toContain('JSON.stringify');
    });

    it('should create a downloadable blob', () => {
      expect(tsContent).toContain('new Blob');
    });

    it('should use application/json mime type', () => {
      expect(tsContent).toContain('application/json');
    });

    it('should create download link with proper filename prefix', () => {
      expect(tsContent).toContain('hootly-history');
    });

    it('should include .json file extension', () => {
      expect(tsContent).toContain('.json');
    });

    it('should create and revoke object URL for download', () => {
      expect(tsContent).toContain('URL.createObjectURL');
      expect(tsContent).toContain('URL.revokeObjectURL');
    });

    it('should set download attribute on link', () => {
      expect(tsContent).toContain('link.download');
    });
  });

  describe('Export data structure', () => {
    it('should include version in export data', () => {
      expect(tsContent).toContain("version: '1.0'");
    });

    it('should include exportedAt timestamp', () => {
      expect(tsContent).toContain('exportedAt');
    });

    it('should include conversations array', () => {
      expect(tsContent).toContain('conversations');
    });

    it('should format JSON with indentation', () => {
      // JSON.stringify with null, 2 for pretty printing
      expect(tsContent).toContain('JSON.stringify(exportData, null, 2)');
    });
  });

  describe('Export button event handling', () => {
    it('should have click handler for export button in init', () => {
      expect(tsContent).toContain("getElementById('exportBtn')");
    });

    it('should call exportHistory on click', () => {
      expect(tsContent).toContain('exportHistory()');
    });
  });

  describe('Filename format', () => {
    it('should include timestamp in filename', () => {
      expect(tsContent).toContain('toISOString');
    });

    it('should split date from ISO string for filename', () => {
      expect(tsContent).toContain("split('T')[0]");
    });
  });

  describe('Download mechanism', () => {
    it('should create anchor element for download', () => {
      expect(tsContent).toContain("document.createElement('a')");
    });

    it('should append link to body before click', () => {
      expect(tsContent).toContain('document.body.appendChild(link)');
    });

    it('should remove link after click', () => {
      expect(tsContent).toContain('document.body.removeChild(link)');
    });

    it('should trigger download via link click', () => {
      expect(tsContent).toContain('link.click()');
    });
  });
});

describe('HP-13: i18n translations', () => {
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

  languages.forEach((lang) => {
    it(`should have history.export translation for ${lang}`, () => {
      const langPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`);
      const langContent = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

      expect(langContent.history).toBeDefined();
      expect(langContent.history.export).toBeDefined();
      expect(typeof langContent.history.export).toBe('string');
      expect(langContent.history.export.length).toBeGreaterThan(0);
    });
  });
});

describe('HP-13: CSS Styling', () => {
  it('should have action-btn-header display flex for icon alignment', () => {
    expect(htmlContent).toMatch(/\.action-btn-header\s*\{[^}]*display:\s*flex/);
  });

  it('should have action-btn-header hover state with color change', () => {
    expect(htmlContent).toMatch(/\.action-btn-header:hover\s*\{[^}]*color:/);
  });

  it('should use CSS variables for consistent theming', () => {
    expect(htmlContent).toContain('var(--color-');
  });
});
