import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual HTML file
const htmlPath = path.resolve(__dirname, '../../history/index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Read the TypeScript file to check for clear all functionality
const tsPath = path.resolve(__dirname, '../../history/history.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');

describe('HP-15: Add Clear All button to history page', () => {
  describe('Clear All button in header', () => {
    it('should have a Clear All button in the history page header', () => {
      expect(htmlContent).toContain('id="clearAllBtn"');
    });

    it('should have Clear All button inside action-buttons', () => {
      const actionButtonsMatch = htmlContent.match(/<div class="action-buttons">([\s\S]*?)<\/div>/);
      expect(actionButtonsMatch).not.toBeNull();
      expect(actionButtonsMatch![1]).toContain('id="clearAllBtn"');
    });

    it('should have data-i18n attribute for Clear All button', () => {
      expect(htmlContent).toContain('data-i18n="history.clearAll"');
    });

    it('should have danger styling class for Clear All button', () => {
      expect(htmlContent).toContain('action-btn-danger');
    });

    it('should have proper CSS for action-btn-danger class', () => {
      expect(htmlContent).toContain('.action-btn-danger');
    });

    it('should have danger hover state styling', () => {
      expect(htmlContent).toContain('.action-btn-danger:hover');
    });

    it('should use error color for danger button', () => {
      expect(htmlContent).toMatch(/\.action-btn-danger\s*\{[^}]*--color-accent-error/);
    });
  });

  describe('Clear All confirmation dialog', () => {
    it('should have a confirmation dialog for Clear All', () => {
      expect(htmlContent).toContain('id="clearAllDialog"');
    });

    it('should have confirm-dialog class for clear all dialog', () => {
      expect(htmlContent).toMatch(/id="clearAllDialog"\s+class="confirm-dialog"/);
    });

    it('should have cancel button in Clear All dialog', () => {
      expect(htmlContent).toContain('id="cancelClearAll"');
    });

    it('should have confirm button in Clear All dialog', () => {
      expect(htmlContent).toContain('id="confirmClearAll"');
    });

    it('should have confirm-delete class on confirm button for danger styling', () => {
      // The button has class="confirm-delete" id="confirmClearAll"
      const confirmBtnMatch = htmlContent.match(/class="([^"]*)"[^>]*id="confirmClearAll"/);
      expect(confirmBtnMatch).not.toBeNull();
      expect(confirmBtnMatch![1]).toContain('confirm-delete');
    });

    it('should have data-i18n for clearAllConfirm message', () => {
      expect(htmlContent).toContain('data-i18n="history.clearAllConfirm"');
    });
  });

  describe('Clear All function implementation', () => {
    it('should have clearAllHistory function in history.ts', () => {
      expect(tsContent).toContain('async function clearAllHistory');
    });

    it('should set conversations to empty array in storage', () => {
      expect(tsContent).toContain('hootly_conversations: []');
    });

    it('should call renderHistoryList after clearing', () => {
      // After clearing, allConversations is set to empty and renderHistoryList is called
      expect(tsContent).toContain('async function clearAllHistory');
      expect(tsContent).toContain('allConversations = [];');
      expect(tsContent).toContain('renderHistoryList(allConversations)');
    });

    it('should have showClearAllConfirm function', () => {
      expect(tsContent).toContain('function showClearAllConfirm');
    });

    it('should have hideClearAllConfirm function', () => {
      expect(tsContent).toContain('function hideClearAllConfirm');
    });

    it('should add visible class to show dialog', () => {
      expect(tsContent).toMatch(/clearAllDialog[\s\S]*?classList\.add\s*\(\s*['"]visible['"]\s*\)/);
    });

    it('should remove visible class to hide dialog', () => {
      expect(tsContent).toMatch(/clearAllDialog[\s\S]*?classList\.remove\s*\(\s*['"]visible['"]\s*\)/);
    });
  });

  describe('Clear All event handlers', () => {
    it('should have click handler for Clear All button', () => {
      expect(tsContent).toContain("getElementById('clearAllBtn')");
    });

    it('should call showClearAllConfirm on button click', () => {
      expect(tsContent).toContain('showClearAllConfirm()');
    });

    it('should have click handler for cancel button', () => {
      expect(tsContent).toContain("getElementById('cancelClearAll')");
    });

    it('should have click handler for confirm button', () => {
      expect(tsContent).toContain("getElementById('confirmClearAll')");
    });

    it('should call clearAllHistory on confirm', () => {
      expect(tsContent).toContain('await clearAllHistory()');
    });

    it('should call hideClearAllConfirm after clearing', () => {
      expect(tsContent).toContain('hideClearAllConfirm()');
    });

    it('should have click-outside-to-close handler for dialog', () => {
      expect(tsContent).toMatch(/clearAllDialog[\s\S]*?addEventListener\s*\(\s*['"]click['"]/);
    });

    it('should check if click target is the dialog itself for outside click', () => {
      expect(tsContent).toContain('e.target === e.currentTarget');
    });
  });
});

describe('HP-15: i18n translations', () => {
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

  languages.forEach((lang) => {
    describe(`${lang} translations`, () => {
      it(`should have history.clearAll translation`, () => {
        const langPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`);
        const langContent = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

        expect(langContent.history).toBeDefined();
        expect(langContent.history.clearAll).toBeDefined();
        expect(typeof langContent.history.clearAll).toBe('string');
        expect(langContent.history.clearAll.length).toBeGreaterThan(0);
      });

      it(`should have history.clearAllConfirm translation`, () => {
        const langPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`);
        const langContent = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

        expect(langContent.history).toBeDefined();
        expect(langContent.history.clearAllConfirm).toBeDefined();
        expect(typeof langContent.history.clearAllConfirm).toBe('string');
        expect(langContent.history.clearAllConfirm.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('HP-15: CSS Styling', () => {
  it('should have danger button using error accent color', () => {
    expect(htmlContent).toMatch(/\.action-btn-danger\s*\{[^}]*color:\s*var\(--color-accent-error\)/);
  });

  it('should have danger button border using error color', () => {
    expect(htmlContent).toMatch(/\.action-btn-danger\s*\{[^}]*border-color:\s*var\(--color-accent-error\)/);
  });

  it('should have danger hover with darker error color', () => {
    expect(htmlContent).toMatch(/\.action-btn-danger:hover\s*\{[^}]*--color-accent-error-hover/);
  });

  it('should have danger hover with background highlight', () => {
    expect(htmlContent).toMatch(/\.action-btn-danger:hover\s*\{[^}]*background:/);
  });

  it('should use confirm-delete styling for confirm button', () => {
    expect(htmlContent).toContain('.confirm-delete');
  });
});

describe('HP-15: Dialog behavior', () => {
  it('should have confirm-dialog hidden by default (display: none)', () => {
    expect(htmlContent).toMatch(/\.confirm-dialog\s*\{[^}]*display:\s*none/);
  });

  it('should have confirm-dialog.visible showing flex', () => {
    expect(htmlContent).toMatch(/\.confirm-dialog\.visible\s*\{[^}]*display:\s*flex/);
  });

  it('should have semi-transparent backdrop', () => {
    expect(htmlContent).toMatch(/\.confirm-dialog\s*\{[^}]*background:\s*rgba/);
  });

  it('should have confirm-box with border instead of shadow', () => {
    expect(htmlContent).toMatch(/\.confirm-box\s*\{[^}]*border:\s*1px/);
  });
});

describe('HP-15: Empty state after clearing', () => {
  it('should render empty list which triggers empty state display', () => {
    // After clearing, allConversations is set to [] and renderHistoryList is called
    expect(tsContent).toContain('allConversations = [];');
    expect(tsContent).toContain('renderHistoryList(allConversations)');
  });
});
