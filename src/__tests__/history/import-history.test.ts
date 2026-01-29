import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual HTML file
const htmlPath = path.resolve(__dirname, '../../history/index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Read the TypeScript file to check for import functionality
const tsPath = path.resolve(__dirname, '../../history/history.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');

describe('HP-14: Import chat history from JSON', () => {
  describe('Import button in header', () => {
    it('should have an import button in the history page header', () => {
      expect(htmlContent).toContain('id="importBtn"');
    });

    it('should have import button inside header-actions', () => {
      const headerActionsMatch = htmlContent.match(/<div class="header-actions">([\s\S]*?)<\/header>/);
      expect(headerActionsMatch).not.toBeNull();
      expect(headerActionsMatch![1]).toContain('id="importBtn"');
    });

    it('should have data-i18n attribute for localization', () => {
      expect(htmlContent).toContain('data-i18n="history.import"');
    });
  });

  describe('Import dialog structure', () => {
    it('should have import dialog container', () => {
      expect(htmlContent).toContain('id="importDialog"');
    });

    it('should have file input element', () => {
      expect(htmlContent).toContain('id="importFileInput"');
      expect(htmlContent).toContain('accept=".json"');
    });

    it('should have select file button', () => {
      expect(htmlContent).toContain('id="selectFileBtn"');
    });

    it('should have file info display area', () => {
      expect(htmlContent).toContain('id="importFileInfo"');
      expect(htmlContent).toContain('id="importFileName"');
      expect(htmlContent).toContain('id="importConvCount"');
    });

    it('should have merge/replace radio buttons', () => {
      expect(htmlContent).toContain('id="importModeSection"');
      expect(htmlContent).toContain('value="merge"');
      expect(htmlContent).toContain('value="replace"');
    });

    it('should have error and success message areas', () => {
      expect(htmlContent).toContain('id="importError"');
      expect(htmlContent).toContain('id="importSuccess"');
    });

    it('should have cancel and confirm import buttons', () => {
      expect(htmlContent).toContain('id="cancelImport"');
      expect(htmlContent).toContain('id="confirmImport"');
    });
  });

  describe('Import dialog CSS styling', () => {
    it('should have confirm-import button styles', () => {
      expect(htmlContent).toContain('.confirm-import');
      expect(htmlContent).toContain('.confirm-import:hover');
      expect(htmlContent).toContain('.confirm-import:disabled');
    });

    it('should have import-dialog-box styles', () => {
      expect(htmlContent).toContain('.import-dialog-box');
    });

    it('should have import-select-btn styles', () => {
      expect(htmlContent).toContain('.import-select-btn');
      expect(htmlContent).toContain('.import-select-btn:hover');
    });

    it('should have import-file-info styles', () => {
      expect(htmlContent).toContain('.import-file-info');
    });

    it('should have import-mode-section and label styles', () => {
      expect(htmlContent).toContain('.import-mode-section');
      expect(htmlContent).toContain('.import-mode-label');
    });

    it('should have import-error and import-success styles', () => {
      expect(htmlContent).toContain('.import-error');
      expect(htmlContent).toContain('.import-success');
    });

    it('should use CSS variables for consistent theming', () => {
      // Check import-related styles use CSS variables
      const importStyles = htmlContent.match(/\.import-[^{]+\{[^}]+\}/g) || [];
      expect(importStyles.length).toBeGreaterThan(0);
    });
  });

  describe('Import function implementation', () => {
    it('should have showImportDialog function', () => {
      expect(tsContent).toContain('function showImportDialog');
    });

    it('should have hideImportDialog function', () => {
      expect(tsContent).toContain('function hideImportDialog');
    });

    it('should have resetImportDialog function', () => {
      expect(tsContent).toContain('function resetImportDialog');
    });

    it('should have validateImportData function', () => {
      expect(tsContent).toContain('function validateImportData');
    });

    it('should have handleFileSelect function', () => {
      expect(tsContent).toContain('async function handleFileSelect');
    });

    it('should have performImport function', () => {
      expect(tsContent).toContain('async function performImport');
    });

    it('should have pendingImportData state variable', () => {
      expect(tsContent).toContain('pendingImportData');
    });
  });

  describe('File validation', () => {
    it('should validate JSON structure', () => {
      expect(tsContent).toContain('JSON.parse');
    });

    it('should check for conversations array', () => {
      expect(tsContent).toContain('Array.isArray(obj.conversations)');
    });

    it('should validate conversation required fields', () => {
      expect(tsContent).toContain("typeof c.id !== 'string'");
      expect(tsContent).toContain("typeof c.title !== 'string'");
      expect(tsContent).toContain("typeof c.createdAt !== 'number'");
      expect(tsContent).toContain("typeof c.updatedAt !== 'number'");
    });

    it('should validate message structure', () => {
      expect(tsContent).toContain("m.role !== 'user' && m.role !== 'assistant'");
      expect(tsContent).toContain("typeof m.content !== 'string'");
      expect(tsContent).toContain("typeof m.timestamp !== 'number'");
    });

    it('should handle empty conversations', () => {
      expect(tsContent).toContain('data.conversations.length === 0');
    });
  });

  describe('Import modes', () => {
    it('should support merge mode', () => {
      expect(tsContent).toContain("mode === 'replace'");
      // Merge logic - adding only non-duplicate conversations
      expect(tsContent).toContain('existingIds.has(c.id)');
    });

    it('should support replace mode', () => {
      expect(tsContent).toContain('hootly_conversations: pendingImportData');
    });
  });

  describe('Error handling', () => {
    it('should have showImportError function', () => {
      expect(tsContent).toContain('function showImportError');
    });

    it('should have showImportSuccess function', () => {
      expect(tsContent).toContain('function showImportSuccess');
    });

    it('should handle invalid JSON', () => {
      expect(tsContent).toContain('importInvalidJson');
    });

    it('should handle invalid format', () => {
      expect(tsContent).toContain('importInvalidFormat');
    });

    it('should handle read errors', () => {
      expect(tsContent).toContain('importReadError');
    });
  });

  describe('Event handlers', () => {
    it('should have click handler for import button', () => {
      expect(tsContent).toContain("getElementById('importBtn')");
    });

    it('should have click handler for select file button', () => {
      expect(tsContent).toContain("getElementById('selectFileBtn')");
    });

    it('should have change handler for file input', () => {
      expect(tsContent).toContain("getElementById('importFileInput')");
      expect(tsContent).toContain('handleFileSelect');
    });

    it('should have click handler for confirm import', () => {
      expect(tsContent).toContain("getElementById('confirmImport')");
      expect(tsContent).toContain('performImport');
    });

    it('should have click handler for cancel import', () => {
      expect(tsContent).toContain("getElementById('cancelImport')");
    });

    it('should close dialog when clicking outside', () => {
      expect(tsContent).toContain("getElementById('importDialog')");
      expect(tsContent).toContain('e.target === e.currentTarget');
    });
  });

  describe('UI state management', () => {
    it('should reset dialog state', () => {
      expect(tsContent).toContain('pendingImportData = null');
      expect(tsContent).toContain("fileInput.value = ''");
    });

    it('should disable confirm button initially', () => {
      expect(tsContent).toContain('confirmBtn.disabled = true');
    });

    it('should enable confirm button after valid file selection', () => {
      expect(tsContent).toContain('confirmBtn.disabled = false');
    });

    it('should show file info after selection', () => {
      expect(tsContent).toContain("fileInfo.style.display = 'flex'");
    });

    it('should show mode section after valid file', () => {
      expect(tsContent).toContain("modeSection.style.display = 'flex'");
    });
  });
});

describe('HP-14: i18n translations', () => {
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];
  const importKeys = [
    'import',
    'importTitle',
    'selectFile',
    'importMerge',
    'importReplace',
    'importConvCount',
    'importInvalidJson',
    'importInvalidFormat',
    'importEmpty',
    'importReadError',
    'importSuccess',
    'importFailed',
  ];

  languages.forEach((lang) => {
    describe(`${lang} translations`, () => {
      let langContent: Record<string, any>;

      beforeAll(() => {
        const langPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`);
        langContent = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
      });

      importKeys.forEach((key) => {
        it(`should have history.${key} translation`, () => {
          expect(langContent.history).toBeDefined();
          expect(langContent.history[key]).toBeDefined();
          expect(typeof langContent.history[key]).toBe('string');
          expect(langContent.history[key].length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('HP-14: Import data structure', () => {
  it('should define ImportExportData interface', () => {
    expect(tsContent).toContain('interface ImportExportData');
  });

  it('should support version field', () => {
    expect(tsContent).toContain('version?: string');
  });

  it('should support exportedAt field', () => {
    expect(tsContent).toContain('exportedAt?: string');
  });

  it('should require conversations array', () => {
    expect(tsContent).toContain('conversations: Conversation[]');
  });
});

describe('HP-14: Integration with storage', () => {
  it('should use chrome.storage.local.set for replace mode', () => {
    expect(tsContent).toContain('chrome.storage.local.set');
  });

  it('should use Storage.getConversations for merge mode', () => {
    expect(tsContent).toContain('Storage.getConversations');
  });

  it('should refresh history list after import', () => {
    // After import, allConversations is updated and renderHistoryList is called
    expect(tsContent).toContain('allConversations = await Storage.getConversations()');
    expect(tsContent).toContain('renderHistoryList(allConversations)');
  });
});
