/**
 * ICON-5: Icons are colorful not monochrome
 *
 * Verifies all SVG icons use multiple colors (not grayscale)
 * and colors complement the forest theme.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ICON-5: Icons are colorful not monochrome', () => {
  const iconsPath = path.resolve(__dirname, '../../shared/icons.tsx');
  const iconsContent = fs.readFileSync(iconsPath, 'utf-8');

  // Extract all fill and stroke color values
  const fillColors = iconsContent.match(/fill="(#[A-Fa-f0-9]{6})"/g) || [];
  const strokeColors = iconsContent.match(/stroke="(#[A-Fa-f0-9]{6})"/g) || [];

  const extractColor = (match: string) => {
    const colorMatch = match.match(/#[A-Fa-f0-9]{6}/);
    return colorMatch ? colorMatch[0] : null;
  };

  const allColorValues = [
    ...fillColors.map(extractColor),
    ...strokeColors.map(extractColor),
  ].filter(Boolean) as string[];

  const uniqueColors = [...new Set(allColorValues)];

  describe('Icons use multiple colors', () => {
    it('should have more than 5 unique colors across all icons', () => {
      expect(uniqueColors.length).toBeGreaterThan(5);
    });

    it('should not use only grayscale colors', () => {
      const isGrayscale = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return r === g && g === b;
      };

      const nonGrayscaleColors = uniqueColors.filter(c => !isGrayscale(c));
      expect(nonGrayscaleColors.length).toBeGreaterThan(0);
    });

    it('should have significantly more non-grayscale colors than grayscale', () => {
      const isGrayscale = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return r === g && g === b;
      };

      const nonGrayscaleColors = uniqueColors.filter(c => !isGrayscale(c));
      const grayscaleColors = uniqueColors.filter(c => isGrayscale(c));

      // Most colors should be non-grayscale
      expect(nonGrayscaleColors.length).toBeGreaterThan(grayscaleColors.length);
    });
  });

  describe('Icons include forest theme colors', () => {
    // Forest theme primary colors
    const forestThemeColors = [
      '#3A5A40', // Primary dark green
      '#4A7C54', // Primary green
      '#588157', // Primary medium green
      '#A3C4AC', // Primary light green
      '#DAD7CD', // Primary background
      '#3A7B89', // Teal accent
      '#5BA3B0', // Light teal
    ];

    it('should include at least some forest theme green colors', () => {
      const hasForestGreen = uniqueColors.some(c => {
        // Check if color is in the green family (higher G than R and B)
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return g > r && g > b * 0.8;
      });
      expect(hasForestGreen).toBe(true);
    });

    it('should include teal accent colors', () => {
      const tealColors = ['#3A7B89', '#5BA3B0', '#E8F3F5'];
      const hasTeal = uniqueColors.some(c => tealColors.includes(c));
      expect(hasTeal).toBe(true);
    });

    it('should include warm accent colors (orange/red)', () => {
      const hasWarmColors = uniqueColors.some(c => {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return r > g && r > b;
      });
      expect(hasWarmColors).toBe(true);
    });
  });

  describe('Individual icon color verification', () => {
    it('FireIcon should use warm colors (orange/yellow/red)', () => {
      expect(iconsContent).toContain('#FF6B35'); // Orange
      expect(iconsContent).toContain('#FFB800'); // Yellow-orange
      expect(iconsContent).toContain('#FFDD00'); // Yellow
    });

    it('HistoryIcon should use brown/tan document colors', () => {
      expect(iconsContent).toContain('#8B7355'); // Brown
      expect(iconsContent).toContain('#D4B896'); // Tan
    });

    it('SettingsIcon should use teal colors', () => {
      expect(iconsContent).toContain('#3A7B89'); // Dark teal
      expect(iconsContent).toContain('#5BA3B0'); // Light teal
    });

    it('SendIcon should use green for positive action', () => {
      expect(iconsContent).toContain('#4A7C54'); // Forest green
    });

    it('TrashIcon should use red for destructive action', () => {
      expect(iconsContent).toContain('#C45A5A'); // Muted red
      expect(iconsContent).toContain('#FFEAEA'); // Light red background
    });

    it('SelectionIcon should use green/teal for selection mode', () => {
      expect(iconsContent).toContain('#E8F0EA'); // Light green background
      expect(iconsContent).toContain('#4A7C54'); // Green stroke
      expect(iconsContent).toContain('#A3C4AC'); // Light green fill
    });

    it('FullPageIcon should use green for full page mode', () => {
      expect(iconsContent).toContain('#E8F0EA');
      expect(iconsContent).toContain('#4A7C54');
    });

    it('NoContextIcon should use muted/gray for disabled state', () => {
      expect(iconsContent).toContain('#F0F2EF'); // Light gray
      expect(iconsContent).toContain('#B8C4BC'); // Medium gray with green tint
      expect(iconsContent).toContain('#8A9A8C'); // Dark gray with green tint
    });
  });

  describe('Icons export all required components', () => {
    it('should export FireIcon', () => {
      expect(iconsContent).toContain('export const FireIcon');
    });

    it('should export HistoryIcon', () => {
      expect(iconsContent).toContain('export const HistoryIcon');
    });

    it('should export SettingsIcon', () => {
      expect(iconsContent).toContain('export const SettingsIcon');
    });

    it('should export CloseIcon', () => {
      expect(iconsContent).toContain('export const CloseIcon');
    });

    it('should export SendIcon', () => {
      expect(iconsContent).toContain('export const SendIcon');
    });

    it('should export ClearIcon', () => {
      expect(iconsContent).toContain('export const ClearIcon');
    });

    it('should export SelectionIcon', () => {
      expect(iconsContent).toContain('export const SelectionIcon');
    });

    it('should export FullPageIcon', () => {
      expect(iconsContent).toContain('export const FullPageIcon');
    });

    it('should export NoContextIcon', () => {
      expect(iconsContent).toContain('export const NoContextIcon');
    });

    it('should export ExportIcon', () => {
      expect(iconsContent).toContain('export const ExportIcon');
    });

    it('should export ImportIcon', () => {
      expect(iconsContent).toContain('export const ImportIcon');
    });

    it('should export TrashIcon', () => {
      expect(iconsContent).toContain('export const TrashIcon');
    });

    it('should export AddIcon', () => {
      expect(iconsContent).toContain('export const AddIcon');
    });

    it('should export EditIcon', () => {
      expect(iconsContent).toContain('export const EditIcon');
    });

    it('should export BackIcon', () => {
      expect(iconsContent).toContain('export const BackIcon');
    });

    it('should export ContinueIcon', () => {
      expect(iconsContent).toContain('export const ContinueIcon');
    });

    it('should export ViewIcon', () => {
      expect(iconsContent).toContain('export const ViewIcon');
    });

    it('should export SearchIcon', () => {
      expect(iconsContent).toContain('export const SearchIcon');
    });
  });
});
