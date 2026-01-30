/**
 * Tests for ICON-4: Replace history page icons with glyphs.fyi icons
 *
 * Requirements:
 * - View button uses glyphs.fyi icon
 * - Continue button uses glyphs.fyi icon
 * - Delete button uses glyphs.fyi icon
 * - Date group icons (if any) use glyphs.fyi icons
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ICON-4: History page icons', () => {
  let htmlContent: string;
  let tsContent: string;

  beforeAll(() => {
    htmlContent = readFileSync(
      join(__dirname, '../../history/index.html'),
      'utf-8'
    );
    tsContent = readFileSync(
      join(__dirname, '../../history/history.ts'),
      'utf-8'
    );
  });

  describe('SVG icon constants defined in history.ts', () => {
    it('should define VIEW_ICON constant with SVG', () => {
      expect(tsContent).toContain('const VIEW_ICON');
      expect(tsContent).toMatch(/VIEW_ICON[\s\S]*?<svg/);
    });

    it('should define CONTINUE_ICON constant with SVG', () => {
      expect(tsContent).toContain('const CONTINUE_ICON');
      expect(tsContent).toMatch(/CONTINUE_ICON[\s\S]*?<svg/);
    });

    it('should define DELETE_ICON constant with SVG', () => {
      expect(tsContent).toContain('const DELETE_ICON');
      expect(tsContent).toMatch(/DELETE_ICON[\s\S]*?<svg/);
    });

    it('should define EXPORT_ICON constant with SVG', () => {
      expect(tsContent).toContain('const EXPORT_ICON');
      expect(tsContent).toMatch(/EXPORT_ICON[\s\S]*?<svg/);
    });

    it('should define IMPORT_ICON constant with SVG', () => {
      expect(tsContent).toContain('const IMPORT_ICON');
      expect(tsContent).toMatch(/IMPORT_ICON[\s\S]*?<svg/);
    });

    it('should define CLEAR_ALL_ICON constant with SVG', () => {
      expect(tsContent).toContain('const CLEAR_ALL_ICON');
      expect(tsContent).toMatch(/CLEAR_ALL_ICON[\s\S]*?<svg/);
    });

    it('should define SEARCH_CLEAR_ICON constant with SVG', () => {
      expect(tsContent).toContain('const SEARCH_CLEAR_ICON');
      expect(tsContent).toMatch(/SEARCH_CLEAR_ICON[\s\S]*?<svg/);
    });

    it('should define HISTORY_TITLE_ICON constant with SVG', () => {
      expect(tsContent).toContain('const HISTORY_TITLE_ICON');
      expect(tsContent).toMatch(/HISTORY_TITLE_ICON[\s\S]*?<svg/);
    });

    it('should define EMPTY_STATE_ICON constant with SVG', () => {
      expect(tsContent).toContain('const EMPTY_STATE_ICON');
      expect(tsContent).toMatch(/EMPTY_STATE_ICON[\s\S]*?<svg/);
    });

    it('should define NO_RESULTS_ICON constant with SVG', () => {
      expect(tsContent).toContain('const NO_RESULTS_ICON');
      expect(tsContent).toMatch(/NO_RESULTS_ICON[\s\S]*?<svg/);
    });
  });

  describe('View button icon', () => {
    it('should have eye icon shape in VIEW_ICON', () => {
      const viewIconMatch = tsContent.match(/const VIEW_ICON[\s\S]*?`;/);
      expect(viewIconMatch).toBeTruthy();
      // Eye icon has ellipse for outer shape and circle for pupil
      expect(viewIconMatch![0]).toContain('<ellipse');
      expect(viewIconMatch![0]).toContain('<circle');
    });

    it('should use teal colors for view icon', () => {
      const viewIconMatch = tsContent.match(/const VIEW_ICON[\s\S]*?`;/);
      expect(viewIconMatch![0]).toContain('#3A7B89'); // Teal stroke
      expect(viewIconMatch![0]).toContain('#E8F3F5'); // Light teal fill
    });

    it('should include VIEW_ICON in view button template', () => {
      expect(tsContent).toContain('${VIEW_ICON}');
      expect(tsContent).toMatch(/view-btn[\s\S]*?\$\{VIEW_ICON\}/);
    });
  });

  describe('Continue button icon', () => {
    it('should have play icon shape in CONTINUE_ICON', () => {
      const continueIconMatch = tsContent.match(/const CONTINUE_ICON[\s\S]*?`;/);
      expect(continueIconMatch).toBeTruthy();
      // Play icon is a triangle pointing right
      expect(continueIconMatch![0]).toContain('<path');
      expect(continueIconMatch![0]).toContain('M5 4v16l14-8L5 4z');
    });

    it('should use green colors for continue icon', () => {
      const continueIconMatch = tsContent.match(/const CONTINUE_ICON[\s\S]*?`;/);
      expect(continueIconMatch![0]).toContain('#4A7C54'); // Forest green stroke
      expect(continueIconMatch![0]).toContain('#D1E1D6'); // Light green fill
    });

    it('should include CONTINUE_ICON in continue button template', () => {
      expect(tsContent).toContain('${CONTINUE_ICON}');
      expect(tsContent).toMatch(/action-btn continue[\s\S]*?\$\{CONTINUE_ICON\}/);
    });
  });

  describe('Delete button icon', () => {
    it('should have trash icon shape in DELETE_ICON', () => {
      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      expect(deleteIconMatch).toBeTruthy();
      // Trash icon paths
      expect(deleteIconMatch![0]).toContain('M3 6h18'); // Top bar
      expect(deleteIconMatch![0]).toContain('M5 6l1 14'); // Body
    });

    it('should use red colors for delete icon', () => {
      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      expect(deleteIconMatch![0]).toContain('#C45A5A'); // Red stroke
      expect(deleteIconMatch![0]).toContain('#FFEAEA'); // Light red fill
    });

    it('should include DELETE_ICON in delete button template', () => {
      expect(tsContent).toContain('${DELETE_ICON}');
      expect(tsContent).toMatch(/action-btn delete[\s\S]*?\$\{DELETE_ICON\}/);
    });
  });

  describe('Header buttons icons', () => {
    it('should have placeholder span for export icon', () => {
      expect(htmlContent).toContain('id="exportIcon"');
      expect(htmlContent).toContain('id="exportBtn"');
    });

    it('should have placeholder span for import icon', () => {
      expect(htmlContent).toContain('id="importIcon"');
      expect(htmlContent).toContain('id="importBtn"');
    });

    it('should have placeholder span for clear all icon', () => {
      expect(htmlContent).toContain('id="clearAllIcon"');
      expect(htmlContent).toContain('id="clearAllBtn"');
    });

    it('should have placeholder span for title icon', () => {
      expect(htmlContent).toContain('id="titleIcon"');
    });

    it('should inject icons in init function', () => {
      expect(tsContent).toContain("getElementById('titleIcon')!.innerHTML = HISTORY_TITLE_ICON");
      expect(tsContent).toContain("getElementById('importIcon')!.innerHTML = IMPORT_ICON");
      expect(tsContent).toContain("getElementById('exportIcon')!.innerHTML = EXPORT_ICON");
      expect(tsContent).toContain("getElementById('clearAllIcon')!.innerHTML = CLEAR_ALL_ICON");
    });
  });

  describe('Search clear button icon', () => {
    it('should have placeholder element for search clear icon', () => {
      expect(htmlContent).toContain('id="clearSearchBtn"');
    });

    it('should have X shape in SEARCH_CLEAR_ICON', () => {
      const searchClearMatch = tsContent.match(/const SEARCH_CLEAR_ICON[\s\S]*?`;/);
      expect(searchClearMatch).toBeTruthy();
      // X icon has crossed lines
      expect(searchClearMatch![0]).toContain('M8 8l8 8');
      expect(searchClearMatch![0]).toContain('M16 8l-8 8');
    });

    it('should inject search clear icon in init function', () => {
      expect(tsContent).toContain("getElementById('clearSearchBtn')!.innerHTML = SEARCH_CLEAR_ICON");
    });
  });

  describe('Empty state icon', () => {
    it('should have placeholder element for empty state icon', () => {
      expect(htmlContent).toContain('id="emptyStateIcon"');
    });

    it('should have clock/history shape in EMPTY_STATE_ICON', () => {
      const emptyStateMatch = tsContent.match(/const EMPTY_STATE_ICON[\s\S]*?`;/);
      expect(emptyStateMatch).toBeTruthy();
      // History icon has circle and clock hands
      expect(emptyStateMatch![0]).toContain('<circle');
      expect(emptyStateMatch![0]).toContain('M12 6v6l4 2'); // Clock hands
    });

    it('should use forest theme colors for empty state icon', () => {
      const emptyStateMatch = tsContent.match(/const EMPTY_STATE_ICON[\s\S]*?`;/);
      expect(emptyStateMatch![0]).toContain('#3A5A40'); // Forest green
      expect(emptyStateMatch![0]).toContain('#E8F0EA'); // Light green
    });

    it('should use 48x48 size for empty state icon', () => {
      const emptyStateMatch = tsContent.match(/const EMPTY_STATE_ICON[\s\S]*?`;/);
      expect(emptyStateMatch![0]).toContain('width="48"');
      expect(emptyStateMatch![0]).toContain('height="48"');
    });

    it('should inject empty state icon in init function', () => {
      expect(tsContent).toContain("getElementById('emptyStateIcon')!.innerHTML = EMPTY_STATE_ICON");
    });

    it('should not have emoji in empty state', () => {
      // Should not have scroll emoji
      expect(htmlContent).not.toMatch(/<div[^>]*id="emptyStateIcon"[^>]*>[^<]*[\u{1F4DC}]/u);
    });
  });

  describe('No results state icon', () => {
    it('should have placeholder element for no results icon', () => {
      expect(htmlContent).toContain('id="noResultsIcon"');
    });

    it('should have search shape in NO_RESULTS_ICON', () => {
      const noResultsMatch = tsContent.match(/const NO_RESULTS_ICON[\s\S]*?`;/);
      expect(noResultsMatch).toBeTruthy();
      // Search icon has circle and handle
      expect(noResultsMatch![0]).toContain('<circle');
      expect(noResultsMatch![0]).toContain('M14.5 14.5L20 20'); // Handle
    });

    it('should use teal colors for no results icon', () => {
      const noResultsMatch = tsContent.match(/const NO_RESULTS_ICON[\s\S]*?`;/);
      expect(noResultsMatch![0]).toContain('#3A7B89'); // Teal stroke
      expect(noResultsMatch![0]).toContain('#E8F3F5'); // Light teal fill
    });

    it('should use 48x48 size for no results icon', () => {
      const noResultsMatch = tsContent.match(/const NO_RESULTS_ICON[\s\S]*?`;/);
      expect(noResultsMatch![0]).toContain('width="48"');
      expect(noResultsMatch![0]).toContain('height="48"');
    });

    it('should inject no results icon in init function', () => {
      expect(tsContent).toContain("getElementById('noResultsIcon')!.innerHTML = NO_RESULTS_ICON");
    });

    it('should not have emoji in no results state', () => {
      // Should not have magnifying glass emoji
      expect(htmlContent).not.toMatch(/<div[^>]*id="noResultsIcon"[^>]*>[^<]*[\u{1F50D}]/u);
    });
  });

  describe('CSS styling for icons', () => {
    it('should have CSS for action-btn svg alignment', () => {
      expect(htmlContent).toContain('.action-btn svg');
      expect(htmlContent).toContain('vertical-align: middle');
    });

    it('should have CSS for action-btn-header svg alignment', () => {
      expect(htmlContent).toContain('.action-btn-header svg');
    });

    it('should have CSS for page-title svg alignment', () => {
      expect(htmlContent).toContain('.page-title svg');
    });

    it('should have CSS for clear-search-btn svg', () => {
      expect(htmlContent).toContain('.clear-search-btn svg');
    });
  });

  describe('Icon dimensions', () => {
    it('should use 14x14 size for action buttons', () => {
      const viewIconMatch = tsContent.match(/const VIEW_ICON[\s\S]*?`;/);
      expect(viewIconMatch![0]).toContain('width="14"');
      expect(viewIconMatch![0]).toContain('height="14"');

      const continueIconMatch = tsContent.match(/const CONTINUE_ICON[\s\S]*?`;/);
      expect(continueIconMatch![0]).toContain('width="14"');
      expect(continueIconMatch![0]).toContain('height="14"');

      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      expect(deleteIconMatch![0]).toContain('width="14"');
      expect(deleteIconMatch![0]).toContain('height="14"');
    });

    it('should use 14x14 size for header buttons', () => {
      const exportIconMatch = tsContent.match(/const EXPORT_ICON[\s\S]*?`;/);
      expect(exportIconMatch![0]).toContain('width="14"');
      expect(exportIconMatch![0]).toContain('height="14"');

      const importIconMatch = tsContent.match(/const IMPORT_ICON[\s\S]*?`;/);
      expect(importIconMatch![0]).toContain('width="14"');
      expect(importIconMatch![0]).toContain('height="14"');
    });

    it('should use 28x28 size for title icon', () => {
      const titleIconMatch = tsContent.match(/const HISTORY_TITLE_ICON[\s\S]*?`;/);
      expect(titleIconMatch![0]).toContain('width="28"');
      expect(titleIconMatch![0]).toContain('height="28"');
    });

    it('should use 12x12 size for search clear icon', () => {
      const searchClearMatch = tsContent.match(/const SEARCH_CLEAR_ICON[\s\S]*?`;/);
      expect(searchClearMatch![0]).toContain('width="12"');
      expect(searchClearMatch![0]).toContain('height="12"');
    });
  });

  describe('Icons are colorful (not monochrome)', () => {
    it('should have multiple colors in view icon', () => {
      const viewIconMatch = tsContent.match(/const VIEW_ICON[\s\S]*?`;/);
      const fillColors = viewIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = viewIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in continue icon', () => {
      const continueIconMatch = tsContent.match(/const CONTINUE_ICON[\s\S]*?`;/);
      const fillColors = continueIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = continueIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in delete icon', () => {
      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      const fillColors = deleteIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = deleteIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in export icon', () => {
      const exportIconMatch = tsContent.match(/const EXPORT_ICON[\s\S]*?`;/);
      const fillColors = exportIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = exportIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in import icon', () => {
      const importIconMatch = tsContent.match(/const IMPORT_ICON[\s\S]*?`;/);
      const fillColors = importIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = importIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in clear all icon', () => {
      const clearAllIconMatch = tsContent.match(/const CLEAR_ALL_ICON[\s\S]*?`;/);
      const fillColors = clearAllIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = clearAllIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in history title icon', () => {
      const titleIconMatch = tsContent.match(/const HISTORY_TITLE_ICON[\s\S]*?`;/);
      const fillColors = titleIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = titleIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Forest theme compliance', () => {
    it('should use design system colors', () => {
      const validColors = [
        '#3A5A40', // Forest green
        '#4A7C54', // Medium green
        '#E8F0EA', // Light green
        '#A3C4AC',
        '#D1E1D6',
        '#3A7B89', // Teal
        '#5BA3B0',
        '#E8F3F5', // Light teal
        '#C45A5A', // Red
        '#FFEAEA', // Light red
        '#FFFFFF',
        '#6B7A6E',
        '#EEF1EC',
      ];

      // Check view icon colors
      const viewIconMatch = tsContent.match(/const VIEW_ICON[\s\S]*?`;/);
      const viewColors = viewIconMatch![0].match(/#[A-Fa-f0-9]{6}/g) || [];
      viewColors.forEach((color: string) => {
        expect(validColors).toContain(color.toUpperCase());
      });

      // Check continue icon colors
      const continueIconMatch = tsContent.match(/const CONTINUE_ICON[\s\S]*?`;/);
      const continueColors = continueIconMatch![0].match(/#[A-Fa-f0-9]{6}/g) || [];
      continueColors.forEach((color: string) => {
        expect(validColors).toContain(color.toUpperCase());
      });

      // Check delete icon colors
      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      const deleteColors = deleteIconMatch![0].match(/#[A-Fa-f0-9]{6}/g) || [];
      deleteColors.forEach((color: string) => {
        expect(validColors).toContain(color.toUpperCase());
      });
    });
  });

  describe('No emoji icons remaining', () => {
    it('should not have text ✕ in clear search button', () => {
      // The button content should be empty (will be filled with SVG via JS)
      const clearSearchMatch = htmlContent.match(/id="clearSearchBtn"[^>]*>[^<]*</);
      if (clearSearchMatch) {
        expect(clearSearchMatch[0]).not.toContain('✕');
      }
    });

    it('should not have HTML arrow entity in back link', () => {
      expect(htmlContent).not.toContain('&larr;');
    });
  });
});
