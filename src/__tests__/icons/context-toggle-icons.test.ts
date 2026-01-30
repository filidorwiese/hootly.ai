/**
 * ICON-6: Context toggle icons updated
 *
 * Verifies context toggle component uses colorful SVG icons
 * for selection/full-page/disabled states.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ICON-6: Context toggle icons updated', () => {
  const contextTogglePath = path.resolve(
    __dirname,
    '../../content/components/ContextToggle.tsx'
  );
  const contextToggleContent = fs.readFileSync(contextTogglePath, 'utf-8');

  const iconsPath = path.resolve(__dirname, '../../shared/icons.tsx');
  const iconsContent = fs.readFileSync(iconsPath, 'utf-8');

  describe('ContextToggle imports colorful icons', () => {
    it('should import SelectionIcon from icons module', () => {
      expect(contextToggleContent).toContain('SelectionIcon');
      expect(contextToggleContent).toMatch(
        /import.*SelectionIcon.*from.*icons/
      );
    });

    it('should import FullPageIcon from icons module', () => {
      expect(contextToggleContent).toContain('FullPageIcon');
      expect(contextToggleContent).toMatch(/import.*FullPageIcon.*from.*icons/);
    });

    it('should import NoContextIcon from icons module', () => {
      expect(contextToggleContent).toContain('NoContextIcon');
      expect(contextToggleContent).toMatch(
        /import.*NoContextIcon.*from.*icons/
      );
    });
  });

  describe('ContextToggle uses icons for different modes', () => {
    it('should set SelectionIcon for selection mode', () => {
      expect(contextToggleContent).toContain('IconComponent = SelectionIcon');
    });

    it('should set FullPageIcon for fullpage mode', () => {
      expect(contextToggleContent).toContain('IconComponent = FullPageIcon');
    });

    it('should set NoContextIcon for disabled mode', () => {
      expect(contextToggleContent).toContain('IconComponent = NoContextIcon');
    });

    it('should render IconComponent in button', () => {
      expect(contextToggleContent).toMatch(/<IconComponent.*size=.*\/>/);
    });
  });

  describe('SelectionIcon is colorful (not monochrome)', () => {
    it('should have multiple colors', () => {
      // Extract SelectionIcon definition
      const selectionIconMatch = iconsContent.match(
        /export const SelectionIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(selectionIconMatch).not.toBeNull();

      const selectionIcon = selectionIconMatch![0];

      // Check for multiple color values
      const colors = selectionIcon.match(/#[A-Fa-f0-9]{6}/g) || [];
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors.length).toBeGreaterThan(1);
    });

    it('should use green family colors', () => {
      const selectionIconMatch = iconsContent.match(
        /export const SelectionIcon[\s\S]*?<\/svg>\s*\);/
      );
      const selectionIcon = selectionIconMatch![0];

      expect(selectionIcon).toContain('#4A7C54'); // Green
      expect(selectionIcon).toContain('#E8F0EA'); // Light green background
    });

    it('should have a highlight/selection indicator', () => {
      const selectionIconMatch = iconsContent.match(
        /export const SelectionIcon[\s\S]*?<\/svg>\s*\);/
      );
      const selectionIcon = selectionIconMatch![0];

      expect(selectionIcon).toContain('#A3C4AC'); // Selection highlight color
    });
  });

  describe('FullPageIcon is colorful (not monochrome)', () => {
    it('should have multiple colors', () => {
      const fullPageIconMatch = iconsContent.match(
        /export const FullPageIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(fullPageIconMatch).not.toBeNull();

      const fullPageIcon = fullPageIconMatch![0];

      const colors = fullPageIcon.match(/#[A-Fa-f0-9]{6}/g) || [];
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors.length).toBeGreaterThan(1);
    });

    it('should use green family colors for page representation', () => {
      const fullPageIconMatch = iconsContent.match(
        /export const FullPageIcon[\s\S]*?<\/svg>\s*\);/
      );
      const fullPageIcon = fullPageIconMatch![0];

      expect(fullPageIcon).toContain('#4A7C54');
      expect(fullPageIcon).toContain('#E8F0EA');
    });
  });

  describe('NoContextIcon is appropriately styled for disabled state', () => {
    it('should have muted/gray colors for disabled appearance', () => {
      const noContextIconMatch = iconsContent.match(
        /export const NoContextIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(noContextIconMatch).not.toBeNull();

      const noContextIcon = noContextIconMatch![0];

      expect(noContextIcon).toContain('#F0F2EF'); // Light gray
      expect(noContextIcon).toContain('#B8C4BC'); // Medium gray
    });

    it('should still have multiple colors (not pure monochrome)', () => {
      const noContextIconMatch = iconsContent.match(
        /export const NoContextIcon[\s\S]*?<\/svg>\s*\);/
      );
      const noContextIcon = noContextIconMatch![0];

      const colors = noContextIcon.match(/#[A-Fa-f0-9]{6}/g) || [];
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors.length).toBeGreaterThan(1);
    });

    it('should use colors with slight green tint to match theme', () => {
      const noContextIconMatch = iconsContent.match(
        /export const NoContextIcon[\s\S]*?<\/svg>\s*\);/
      );
      const noContextIcon = noContextIconMatch![0];

      // #8A9A8C has green tint (9A > 8A and 9A > 8C)
      expect(noContextIcon).toContain('#8A9A8C');
    });
  });

  describe('Icons are SVG elements (not emoji)', () => {
    it('should not use emoji in ContextToggle', () => {
      // Common context-related emojis
      const emojiPatterns = [
        '📋',
        '📄',
        '📝',
        '✅',
        '❌',
        '🔘',
        '⚪',
        '🟢',
        '🔵',
      ];
      for (const emoji of emojiPatterns) {
        expect(contextToggleContent).not.toContain(emoji);
      }
    });

    it('SelectionIcon should be an SVG element', () => {
      const selectionIconMatch = iconsContent.match(
        /export const SelectionIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(selectionIconMatch).not.toBeNull();
      expect(selectionIconMatch![0]).toContain('<svg');
      expect(selectionIconMatch![0]).toContain('viewBox');
    });

    it('FullPageIcon should be an SVG element', () => {
      const fullPageIconMatch = iconsContent.match(
        /export const FullPageIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(fullPageIconMatch).not.toBeNull();
      expect(fullPageIconMatch![0]).toContain('<svg');
      expect(fullPageIconMatch![0]).toContain('viewBox');
    });

    it('NoContextIcon should be an SVG element', () => {
      const noContextIconMatch = iconsContent.match(
        /export const NoContextIcon[\s\S]*?<\/svg>\s*\);/
      );
      expect(noContextIconMatch).not.toBeNull();
      expect(noContextIconMatch![0]).toContain('<svg');
      expect(noContextIconMatch![0]).toContain('viewBox');
    });
  });

  describe('Icons support size prop for flexibility', () => {
    it('SelectionIcon should accept size prop', () => {
      expect(iconsContent).toMatch(
        /SelectionIcon.*\{.*size.*=.*\d+/s
      );
    });

    it('FullPageIcon should accept size prop', () => {
      expect(iconsContent).toMatch(
        /FullPageIcon.*\{.*size.*=.*\d+/s
      );
    });

    it('NoContextIcon should accept size prop', () => {
      expect(iconsContent).toMatch(
        /NoContextIcon.*\{.*size.*=.*\d+/s
      );
    });

    it('ContextToggle should pass size to IconComponent', () => {
      expect(contextToggleContent).toMatch(/<IconComponent size=\{.*\}/);
    });
  });
});
