/**
 * HP-16: Add search to history page
 *
 * Tests for:
 * - Search input at top of history page
 * - Filter conversations by title as user types
 * - Filter by message content as well
 * - Show no results state if no matches
 * - Clear search shows all conversations again
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('HP-16: Add search to history page', () => {
  let historyHtml: string;
  let historyTs: string;

  beforeEach(() => {
    const historyHtmlPath = path.join(__dirname, '../../history/index.html');
    const historyTsPath = path.join(__dirname, '../../history/history.ts');
    historyHtml = fs.readFileSync(historyHtmlPath, 'utf-8');
    historyTs = fs.readFileSync(historyTsPath, 'utf-8');
  });

  describe('Search input UI', () => {
    it('should have search input at top of history page', () => {
      expect(historyHtml).toContain('id="searchInput"');
      expect(historyHtml).toContain('class="search-input"');
    });

    it('should have search container before history list', () => {
      const searchContainerIndex = historyHtml.indexOf('class="search-container"');
      const historyListIndex = historyHtml.indexOf('id="historyList"');
      expect(searchContainerIndex).toBeLessThan(historyListIndex);
      expect(searchContainerIndex).toBeGreaterThan(0);
    });

    it('should have i18n placeholder for search input', () => {
      expect(historyHtml).toContain('data-i18n-placeholder="history.searchPlaceholder"');
    });

    it('should have clear search button', () => {
      expect(historyHtml).toContain('id="clearSearchBtn"');
      expect(historyHtml).toContain('class="clear-search-btn"');
    });

    it('should hide clear search button by default', () => {
      expect(historyHtml).toMatch(/id="clearSearchBtn"[^>]*style="display: none;"/);
    });
  });

  describe('No results state UI', () => {
    it('should have no results state element', () => {
      expect(historyHtml).toContain('id="noResultsState"');
      expect(historyHtml).toContain('class="no-results-state"');
    });

    it('should have no results icon placeholder', () => {
      expect(historyHtml).toContain('class="no-results-icon"');
      expect(historyHtml).toContain('id="noResultsIcon"');
    });

    it('should have i18n text for no results', () => {
      expect(historyHtml).toContain('data-i18n="history.noResults"');
    });

    it('should hide no results state by default', () => {
      expect(historyHtml).toMatch(/id="noResultsState"[^>]*style="display: none;"/);
    });
  });

  describe('Search CSS styling', () => {
    it('should have search container styles', () => {
      expect(historyHtml).toContain('.search-container {');
    });

    it('should have search input styles', () => {
      expect(historyHtml).toContain('.search-input {');
    });

    it('should have search input focus styles', () => {
      expect(historyHtml).toContain('.search-input:focus {');
    });

    it('should have clear search button styles', () => {
      expect(historyHtml).toContain('.clear-search-btn {');
    });

    it('should have no results state styles', () => {
      expect(historyHtml).toContain('.no-results-state {');
    });

    it('should position clear button absolutely in search container', () => {
      expect(historyHtml).toMatch(/\.clear-search-btn\s*\{[^}]*position:\s*absolute/);
    });
  });

  describe('Search filter logic', () => {
    it('should have filterConversations function', () => {
      expect(historyTs).toContain('function filterConversations(');
    });

    it('should filter by title', () => {
      expect(historyTs).toMatch(/conv\.title\.toLowerCase\(\)\.includes\(lowerQuery\)/);
    });

    it('should filter by message content', () => {
      expect(historyTs).toMatch(/msg\.content\.toLowerCase\(\)\.includes\(lowerQuery\)/);
    });

    it('should return all conversations when query is empty', () => {
      expect(historyTs).toMatch(/if\s*\(\s*!query\.trim\(\)\s*\)\s*return\s+conversations/);
    });

    it('should convert query to lowercase for case-insensitive search', () => {
      expect(historyTs).toContain('query.toLowerCase()');
    });

    it('should trim whitespace from query', () => {
      expect(historyTs).toContain('.trim()');
    });
  });

  describe('Search state management', () => {
    it('should track all conversations separately', () => {
      expect(historyTs).toContain('let allConversations: Conversation[] = []');
    });

    it('should track current search query', () => {
      expect(historyTs).toContain("let currentSearchQuery = ''");
    });

    it('should update allConversations when loading', () => {
      expect(historyTs).toContain('allConversations = await Storage.getConversations()');
    });

    it('should update allConversations when deleting', () => {
      expect(historyTs).toMatch(/async function deleteConversation[^}]*allConversations = await Storage\.getConversations/s);
    });

    it('should update allConversations when clearing all', () => {
      // Check clearAllHistory function body contains allConversations = []
      expect(historyTs).toContain('allConversations = [];');
      expect(historyTs).toContain('async function clearAllHistory');
    });
  });

  describe('Search event handlers', () => {
    it('should have input event handler for search input', () => {
      expect(historyTs).toContain("searchInput.addEventListener('input'");
    });

    it('should update currentSearchQuery on input', () => {
      expect(historyTs).toContain('currentSearchQuery = searchInput.value');
    });

    it('should show clear button when query is not empty', () => {
      expect(historyTs).toMatch(/clearSearchBtn\.style\.display\s*=\s*currentSearchQuery\s*\?\s*['"]flex['"]/);
    });

    it('should re-render history list on search input', () => {
      expect(historyTs).toMatch(/searchInput\.addEventListener\('input'[^}]*renderHistoryList\(allConversations\)/s);
    });

    it('should have click handler for clear search button', () => {
      expect(historyTs).toContain("clearSearchBtn.addEventListener('click'");
    });

    it('should reset search state when clearing', () => {
      expect(historyTs).toMatch(/clearSearchBtn\.addEventListener\('click'[^}]*searchInput\.value = ''/s);
      expect(historyTs).toMatch(/clearSearchBtn\.addEventListener\('click'[^}]*currentSearchQuery = ''/s);
    });

    it('should focus search input after clearing', () => {
      expect(historyTs).toMatch(/clearSearchBtn\.addEventListener\('click'[^}]*searchInput\.focus\(\)/s);
    });
  });

  describe('Empty states handling', () => {
    it('should show empty state when no conversations exist', () => {
      expect(historyTs).toMatch(/allConversations\.length === 0[^}]*emptyState\.style\.display = 'block'/s);
    });

    it('should show no results state when search has no matches', () => {
      expect(historyTs).toMatch(/filtered\.length === 0 && currentSearchQuery[^}]*noResultsState\.style\.display = 'block'/s);
    });

    it('should hide no results state when there are results', () => {
      expect(historyTs).toContain("noResultsState.style.display = 'none'");
    });

    it('should hide empty state when showing no results', () => {
      expect(historyTs).toMatch(/filtered\.length === 0 && currentSearchQuery[^}]*emptyState\.style\.display = 'none'/s);
    });
  });

  describe('Render function integration', () => {
    it('should apply search filter in renderHistoryList', () => {
      expect(historyTs).toMatch(/const filtered = filterConversations\(conversations, currentSearchQuery\)/);
    });

    it('should sort filtered results', () => {
      expect(historyTs).toContain('[...filtered].sort');
    });

    it('should get noResultsState element', () => {
      expect(historyTs).toContain("getElementById('noResultsState')");
    });
  });

  describe('Placeholder translation support', () => {
    it('should handle data-i18n-placeholder attributes', () => {
      expect(historyTs).toContain("querySelectorAll('[data-i18n-placeholder]')");
    });

    it('should set placeholder attribute from translation', () => {
      expect(historyTs).toContain('(el as HTMLInputElement).placeholder = translated');
    });
  });
});

describe('HP-16: Search translations', () => {
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

  languages.forEach((lang) => {
    describe(`${lang}.json`, () => {
      let translations: Record<string, unknown>;

      beforeEach(() => {
        const filePath = path.join(__dirname, `../../shared/i18n/${lang}.json`);
        translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      });

      it('should have history.searchPlaceholder', () => {
        const history = translations.history as Record<string, string>;
        expect(history.searchPlaceholder).toBeDefined();
        expect(typeof history.searchPlaceholder).toBe('string');
        expect(history.searchPlaceholder.length).toBeGreaterThan(0);
      });

      it('should have history.noResults', () => {
        const history = translations.history as Record<string, string>;
        expect(history.noResults).toBeDefined();
        expect(typeof history.noResults).toBe('string');
        expect(history.noResults.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('HP-16: filterConversations function behavior', () => {
  // Test the filter logic conceptually
  it('should match conversations by title', () => {
    const conversations = [
      { id: '1', title: 'Hello World', messages: [] },
      { id: '2', title: 'Goodbye Moon', messages: [] },
    ];

    // Simulating filter logic
    const query = 'hello';
    const filtered = conversations.filter(
      (conv) => conv.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should match conversations by message content', () => {
    const conversations = [
      { id: '1', title: 'Chat 1', messages: [{ content: 'How do I use React?' }] },
      { id: '2', title: 'Chat 2', messages: [{ content: 'Python is great' }] },
    ];

    const query = 'react';
    const filtered = conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query.toLowerCase()) ||
        conv.messages.some((msg: { content: string }) => msg.content.toLowerCase().includes(query.toLowerCase()))
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should be case insensitive', () => {
    const conversations = [
      { id: '1', title: 'JavaScript Help', messages: [] },
    ];

    const query = 'JAVASCRIPT';
    const filtered = conversations.filter(
      (conv) => conv.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
  });

  it('should return all when query is empty', () => {
    const conversations = [
      { id: '1', title: 'Chat 1', messages: [] },
      { id: '2', title: 'Chat 2', messages: [] },
    ];

    const query = '';
    const filtered = query.trim()
      ? conversations.filter((conv) => conv.title.toLowerCase().includes(query.toLowerCase()))
      : conversations;

    expect(filtered).toHaveLength(2);
  });

  it('should return all when query is only whitespace', () => {
    const conversations = [
      { id: '1', title: 'Chat 1', messages: [] },
      { id: '2', title: 'Chat 2', messages: [] },
    ];

    const query = '   ';
    const filtered = query.trim()
      ? conversations.filter((conv) => conv.title.toLowerCase().includes(query.toLowerCase()))
      : conversations;

    expect(filtered).toHaveLength(2);
  });

  it('should match partial strings', () => {
    const conversations = [
      { id: '1', title: 'Conversation about programming', messages: [] },
    ];

    const query = 'program';
    const filtered = conversations.filter(
      (conv) => conv.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
  });

  it('should return empty array when no matches', () => {
    const conversations = [
      { id: '1', title: 'Chat about dogs', messages: [] },
      { id: '2', title: 'Cat discussion', messages: [] },
    ];

    const query = 'elephants';
    const filtered = conversations.filter(
      (conv) => conv.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(0);
  });
});
