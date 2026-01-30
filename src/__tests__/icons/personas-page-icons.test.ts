/**
 * Tests for ICON-3: Replace personas page icons with glyphs.fyi icons
 *
 * Requirements:
 * - Add persona button uses glyphs.fyi icon
 * - Edit button uses glyphs.fyi icon
 * - Delete button uses glyphs.fyi icon
 * - Back navigation uses glyphs.fyi icon
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ICON-3: Personas page icons', () => {
  let htmlContent: string;
  let tsContent: string;

  beforeAll(() => {
    htmlContent = readFileSync(
      join(__dirname, '../../personas/index.html'),
      'utf-8'
    );
    tsContent = readFileSync(
      join(__dirname, '../../personas/personas.ts'),
      'utf-8'
    );
  });

  describe('Add Persona button', () => {
    it('should have inline SVG icon', () => {
      expect(htmlContent).toContain('id="addPersonaBtn"');
      // Check for SVG in add button
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      expect(addBtnMatch).toBeTruthy();
      expect(addBtnMatch![0]).toContain('<svg');
      expect(addBtnMatch![0]).toContain('viewBox="0 0 24 24"');
    });

    it('should have plus/add icon shape (circle with cross)', () => {
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      expect(addBtnMatch![0]).toContain('<circle');
      expect(addBtnMatch![0]).toContain('M12 8v8'); // Vertical line
      expect(addBtnMatch![0]).toContain('M8 12h8'); // Horizontal line
    });

    it('should use colorful icon (white stroke on green background)', () => {
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      // Circle with green fill and white stroke for text
      expect(addBtnMatch![0]).toContain('fill="#E8F0EA"');
      expect(addBtnMatch![0]).toContain('stroke="#FFFFFF"');
    });

    it('should not use plain text + symbol', () => {
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      // Should not have standalone + text
      expect(addBtnMatch![0]).not.toMatch(/<span>\+<\/span>/);
    });

    it('should have btn-icon class for styling', () => {
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      expect(addBtnMatch![0]).toContain('class="btn-icon"');
    });
  });

  // TAB-3: Back navigation link removed - TabHeader now provides navigation
  describe('Back navigation link (removed in TAB-3)', () => {
    it('should not have back button - navigation via TabHeader', () => {
      // Back link was removed when TabHeader was integrated
      const backLinkMatch = htmlContent.match(
        /<a[^>]*id="backBtn"[^>]*>[\s\S]*?<\/a>/
      );
      expect(backLinkMatch).toBeNull();
    });
  });

  describe('Edit button (in personas.ts)', () => {
    it('should define EDIT_ICON constant with SVG', () => {
      expect(tsContent).toContain('const EDIT_ICON');
      expect(tsContent).toContain('<svg');
    });

    it('should have pencil/edit icon shape', () => {
      // Edit icon path - pencil shape
      expect(tsContent).toContain('M15.5 4.5l4 4L8 20H4v-4l11.5-11.5z');
    });

    it('should use teal/blue colors for edit icon', () => {
      // Teal colors from design system
      expect(tsContent).toContain('fill="#E8F3F5"');
      expect(tsContent).toContain('stroke="#3A7B89"');
    });

    it('should include EDIT_ICON in edit button template', () => {
      expect(tsContent).toContain('${EDIT_ICON}');
      expect(tsContent).toMatch(/class="action-btn edit"[\s\S]*?\$\{EDIT_ICON\}/);
    });
  });

  describe('Delete button (in personas.ts)', () => {
    it('should define DELETE_ICON constant with SVG', () => {
      expect(tsContent).toContain('const DELETE_ICON');
    });

    it('should have trash icon shape', () => {
      // Trash icon paths
      expect(tsContent).toContain('M3 6h18'); // Top bar
      expect(tsContent).toContain('M8 6V4'); // Handle
      expect(tsContent).toContain('M5 6l1 14'); // Body
    });

    it('should use red colors for delete icon', () => {
      // Red colors for destructive action
      expect(tsContent).toContain('stroke="#C45A5A"');
      expect(tsContent).toContain('fill="#FFEAEA"');
    });

    it('should include DELETE_ICON in delete button template', () => {
      expect(tsContent).toContain('${DELETE_ICON}');
      expect(tsContent).toMatch(
        /class="action-btn delete"[\s\S]*?\$\{DELETE_ICON\}/
      );
    });
  });

  describe('CSS styling for icons', () => {
    it('should have CSS for action-btn svg alignment', () => {
      expect(htmlContent).toContain('.action-btn svg');
      expect(htmlContent).toContain('vertical-align: middle');
    });

    it('should have CSS for btn-icon class', () => {
      expect(htmlContent).toContain('.btn-icon');
    });
  });

  describe('Icon dimensions', () => {
    it('should use 16x16 size for header buttons', () => {
      // Add button icon should be 16x16 (back link removed in TAB-3)
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      expect(addBtnMatch![0]).toContain('width="16"');
      expect(addBtnMatch![0]).toContain('height="16"');
    });

    it('should use 14x14 size for action buttons', () => {
      // Edit and delete icons should be 14x14
      expect(tsContent).toMatch(/EDIT_ICON[\s\S]*?width="14"/);
      expect(tsContent).toMatch(/EDIT_ICON[\s\S]*?height="14"/);
      expect(tsContent).toMatch(/DELETE_ICON[\s\S]*?width="14"/);
      expect(tsContent).toMatch(/DELETE_ICON[\s\S]*?height="14"/);
    });
  });

  describe('Icons are colorful (not monochrome)', () => {
    it('should have multiple colors in add icon', () => {
      const addBtnMatch = htmlContent.match(
        /<button[^>]*id="addPersonaBtn"[^>]*>[\s\S]*?<\/button>/
      );
      const svgContent = addBtnMatch![0];
      // Should have both fill and stroke colors
      const fillColors = svgContent.match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors = svgContent.match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in edit icon', () => {
      // Edit icon should have fill and stroke
      const editIconMatch = tsContent.match(
        /const EDIT_ICON[\s\S]*?`;/
      );
      expect(editIconMatch).toBeTruthy();
      const fillColors = editIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors =
        editIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });

    it('should have multiple colors in delete icon', () => {
      // Delete icon should have fill and stroke (red theme)
      const deleteIconMatch = tsContent.match(
        /const DELETE_ICON[\s\S]*?`;/
      );
      expect(deleteIconMatch).toBeTruthy();
      const fillColors =
        deleteIconMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const strokeColors =
        deleteIconMatch![0].match(/stroke="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillColors.length + strokeColors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Forest theme compliance', () => {
    it('should use design system colors', () => {
      // Forest theme greens: #3A5A40, #4A7C54, #E8F0EA
      // Teal: #3A7B89, #5BA3B0, #E8F3F5
      // Red: #C45A5A, #FFEAEA
      const validColors = [
        '#3A5A40',
        '#4A7C54',
        '#E8F0EA',
        '#A3C4AC',
        '#3A7B89',
        '#5BA3B0',
        '#E8F3F5',
        '#C45A5A',
        '#FFEAEA',
        '#FFFFFF',
        '#6B7A6E',
      ];

      // Extract colors from edit icon
      const editIconMatch = tsContent.match(/const EDIT_ICON[\s\S]*?`;/);
      const editColors =
        editIconMatch![0].match(/#[A-Fa-f0-9]{6}/g) || [];
      editColors.forEach((color: string) => {
        expect(validColors).toContain(color.toUpperCase());
      });

      // Extract colors from delete icon
      const deleteIconMatch = tsContent.match(/const DELETE_ICON[\s\S]*?`;/);
      const deleteColors =
        deleteIconMatch![0].match(/#[A-Fa-f0-9]{6}/g) || [];
      deleteColors.forEach((color: string) => {
        expect(validColors).toContain(color.toUpperCase());
      });
    });
  });
});
