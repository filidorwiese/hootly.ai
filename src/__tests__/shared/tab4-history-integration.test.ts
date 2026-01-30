/**
 * TAB-4: Integrate TabHeader into history page
 * Tests verify TabHeader component is properly integrated into history.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source files
const historyHtmlPath = path.join(__dirname, '../../history/index.html');
const historyTsPath = path.join(__dirname, '../../history/history.ts');
const tabHeaderPath = path.join(__dirname, '../../shared/TabHeader.ts');

let historyHtml: string;
let historyTs: string;
let tabHeaderTs: string;

beforeEach(() => {
  historyHtml = fs.readFileSync(historyHtmlPath, 'utf-8');
  historyTs = fs.readFileSync(historyTsPath, 'utf-8');
  tabHeaderTs = fs.readFileSync(tabHeaderPath, 'utf-8');
});

describe('TAB-4: Integrate TabHeader into history page', () => {
  describe('TabHeader import in history.ts', () => {
    it('imports injectTabHeader from TabHeader module', () => {
      expect(historyTs).toMatch(/import.*injectTabHeader.*from.*TabHeader/);
    });
  });

  describe('TabHeader injection in history.ts', () => {
    it('calls injectTabHeader with history as activeTab', () => {
      expect(historyTs).toMatch(/injectTabHeader\s*\(\s*\{[^}]*activeTab\s*:\s*['"]history['"]/);
    });

    it('calls injectTabHeader in init function', () => {
      expect(historyTs).toMatch(/async\s+function\s+init.*injectTabHeader/s);
    });
  });

  describe('HTML structure changes', () => {
    it('removes old container class', () => {
      expect(historyHtml).not.toMatch(/class="container"/);
    });

    it('removes old header element with h1', () => {
      // Old header structure should be removed
      expect(historyHtml).not.toMatch(/<header>\s*<h1>/);
    });

    it('removes close button/link', () => {
      expect(historyHtml).not.toMatch(/id="closeBtn"/);
      expect(historyHtml).not.toMatch(/class="back-link"/);
    });

    it('has history-content container', () => {
      expect(historyHtml).toMatch(/class="history-content"/);
    });

    it('has page-header with title and action buttons', () => {
      expect(historyHtml).toMatch(/class="page-header"/);
    });

    it('has page-title class on h1', () => {
      expect(historyHtml).toMatch(/class="page-title"/);
    });

    it('has body for TabHeader injection', () => {
      expect(historyHtml).toMatch(/<body/);
    });
  });

  describe('CSS changes', () => {
    it('removes header-btn CSS', () => {
      expect(historyHtml).not.toMatch(/\.header-btn\s*\{/);
    });

    it('removes back-link CSS', () => {
      expect(historyHtml).not.toMatch(/\.back-link\s*\{/);
    });

    it('has history-content CSS', () => {
      expect(historyHtml).toMatch(/\.history-content\s*\{/);
    });

    it('has page-header CSS', () => {
      expect(historyHtml).toMatch(/\.page-header\s*\{/);
    });

    it('has page-title CSS', () => {
      expect(historyHtml).toMatch(/\.page-title\s*\{/);
    });

    it('has action-btn-header CSS for header buttons', () => {
      expect(historyHtml).toMatch(/\.action-btn-header\s*\{/);
    });
  });

  describe('Tab navigation functionality', () => {
    it('injectTabHeader initializes navigation handlers', () => {
      expect(tabHeaderTs).toMatch(/initTabHeaderNav/);
    });

    it('clicking non-active tab navigates to that page', () => {
      expect(tabHeaderTs).toMatch(/window\.location\.href\s*=\s*getTabUrl/);
    });
  });

  describe('History tab active state', () => {
    it('passes history as activeTab value', () => {
      expect(historyTs).toMatch(/activeTab\s*:\s*['"]history['"]/);
    });
  });

  describe('Styling consistency', () => {
    it('history page has CSS variables for TabHeader styling', () => {
      const hasCssVars = historyHtml.includes('--color-') ||
        historyHtml.includes('--spacing-') ||
        historyHtml.includes(':root');
      expect(hasCssVars).toBe(true);
    });

    it('history page has Inter font loaded', () => {
      expect(historyHtml).toMatch(/Inter/);
    });
  });

  describe('Visual requirements', () => {
    it('page title is still displayed', () => {
      expect(historyHtml).toMatch(/data-i18n="history\.title"/);
    });

    it('import button still exists', () => {
      expect(historyHtml).toMatch(/id="importBtn"/);
    });

    it('export button still exists', () => {
      expect(historyHtml).toMatch(/id="exportBtn"/);
    });

    it('clear all button still exists', () => {
      expect(historyHtml).toMatch(/id="clearAllBtn"/);
    });
  });

  describe('No old header elements', () => {
    it('no closeBtn element', () => {
      expect(historyHtml).not.toMatch(/id="closeBtn"/);
    });

    it('no backIcon element', () => {
      expect(historyHtml).not.toMatch(/id="backIcon"/);
    });

    it('no closeBtn event listener in init', () => {
      expect(historyTs).not.toMatch(/getElementById\s*\(\s*['"]closeBtn['"]\s*\)/);
    });

    it('no BACK_ICON constant', () => {
      expect(historyTs).not.toMatch(/const\s+BACK_ICON\s*=/);
    });
  });

  describe('Intro text preserved', () => {
    it('intro text element still exists', () => {
      expect(historyHtml).toMatch(/intro-text/);
    });

    it('intro text has history.intro i18n key', () => {
      expect(historyHtml).toMatch(/data-i18n="history\.intro"/);
    });
  });

  describe('applyTranslations includes TabHeader', () => {
    it('applyTranslations is called after injectTabHeader', () => {
      const injectIndex = historyTs.indexOf('injectTabHeader');
      const translateIndex = historyTs.indexOf('applyTranslations');

      // Both exist and translations come after injection
      if (injectIndex > -1 && translateIndex > -1) {
        expect(translateIndex > injectIndex).toBe(true);
      }
    });
  });
});

describe('History page preserves existing functionality', () => {
  it('still has history list container', () => {
    expect(historyHtml).toMatch(/id="historyList"/);
  });

  it('still has empty state', () => {
    expect(historyHtml).toMatch(/id="emptyState"/);
  });

  it('still has no results state', () => {
    expect(historyHtml).toMatch(/id="noResultsState"/);
  });

  it('still has search input', () => {
    expect(historyHtml).toMatch(/id="searchInput"/);
  });

  it('still has clear search button', () => {
    expect(historyHtml).toMatch(/id="clearSearchBtn"/);
  });

  it('still has confirm dialog for delete', () => {
    expect(historyHtml).toMatch(/id="confirmDialog"/);
  });

  it('still has clear all dialog', () => {
    expect(historyHtml).toMatch(/id="clearAllDialog"/);
  });

  it('still has import dialog', () => {
    expect(historyHtml).toMatch(/id="importDialog"/);
  });

  it('still has title icon element', () => {
    expect(historyHtml).toMatch(/id="titleIcon"/);
  });

  it('still has import icon element', () => {
    expect(historyHtml).toMatch(/id="importIcon"/);
  });

  it('still has export icon element', () => {
    expect(historyHtml).toMatch(/id="exportIcon"/);
  });

  it('still has clear all icon element', () => {
    expect(historyHtml).toMatch(/id="clearAllIcon"/);
  });
});

describe('History.ts functionality preserved', () => {
  it('still imports Storage', () => {
    expect(historyTs).toMatch(/import.*Storage.*from.*storage/);
  });

  it('still imports DEFAULT_PERSONAS', () => {
    expect(historyTs).toMatch(/import.*DEFAULT_PERSONAS.*from.*types/);
  });

  it('still imports i18n', () => {
    expect(historyTs).toMatch(/import.*t.*initLanguage.*from.*i18n/);
  });

  it('still has renderHistoryList function', () => {
    expect(historyTs).toMatch(/function\s+renderHistoryList/);
  });

  it('still has groupByDate function', () => {
    expect(historyTs).toMatch(/function\s+groupByDate/);
  });

  it('still has filterConversations function', () => {
    expect(historyTs).toMatch(/function\s+filterConversations/);
  });

  it('still has exportHistory function', () => {
    expect(historyTs).toMatch(/async\s+function\s+exportHistory/);
  });

  it('still has performImport function', () => {
    expect(historyTs).toMatch(/async\s+function\s+performImport/);
  });

  it('still has clearAllHistory function', () => {
    expect(historyTs).toMatch(/async\s+function\s+clearAllHistory/);
  });

  it('still has deleteConversation function', () => {
    expect(historyTs).toMatch(/async\s+function\s+deleteConversation/);
  });

  it('still has openContinuePopup function', () => {
    expect(historyTs).toMatch(/function\s+openContinuePopup/);
  });

  it('still has showDeleteConfirm function', () => {
    expect(historyTs).toMatch(/function\s+showDeleteConfirm/);
  });

  it('still has showImportDialog function', () => {
    expect(historyTs).toMatch(/function\s+showImportDialog/);
  });

  it('still has validateImportData function', () => {
    expect(historyTs).toMatch(/function\s+validateImportData/);
  });
});

describe('Icon constants preserved', () => {
  it('still has VIEW_ICON', () => {
    expect(historyTs).toMatch(/const\s+VIEW_ICON\s*=/);
  });

  it('still has CONTINUE_ICON', () => {
    expect(historyTs).toMatch(/const\s+CONTINUE_ICON\s*=/);
  });

  it('still has DELETE_ICON', () => {
    expect(historyTs).toMatch(/const\s+DELETE_ICON\s*=/);
  });

  it('still has EXPORT_ICON', () => {
    expect(historyTs).toMatch(/const\s+EXPORT_ICON\s*=/);
  });

  it('still has IMPORT_ICON', () => {
    expect(historyTs).toMatch(/const\s+IMPORT_ICON\s*=/);
  });

  it('still has CLEAR_ALL_ICON', () => {
    expect(historyTs).toMatch(/const\s+CLEAR_ALL_ICON\s*=/);
  });

  it('still has SEARCH_CLEAR_ICON', () => {
    expect(historyTs).toMatch(/const\s+SEARCH_CLEAR_ICON\s*=/);
  });

  it('still has HISTORY_TITLE_ICON', () => {
    expect(historyTs).toMatch(/const\s+HISTORY_TITLE_ICON\s*=/);
  });

  it('still has EMPTY_STATE_ICON', () => {
    expect(historyTs).toMatch(/const\s+EMPTY_STATE_ICON\s*=/);
  });

  it('still has NO_RESULTS_ICON', () => {
    expect(historyTs).toMatch(/const\s+NO_RESULTS_ICON\s*=/);
  });
});
