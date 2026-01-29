/**
 * Tests for ICON-2: Replace settings page icons with glyphs.fyi icons
 *
 * Verifies that:
 * - Settings page title uses SVG icon instead of emoji
 * - Manage Personas link uses SVG icon
 * - Icons are colorful (not monochrome)
 * - Icons match forest theme colors
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('ICON-2: Settings Page Icons', () => {
  let settingsHtml: string;

  beforeAll(() => {
    settingsHtml = readFileSync(
      resolve(__dirname, '../../settings/index.html'),
      'utf-8'
    );
  });

  describe('Title icon', () => {
    it('should have SVG icon in h1 title', () => {
      // Check for SVG inside h1
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      expect(h1Match![0]).toContain('<svg');
    });

    it('should NOT have emoji icon in title', () => {
      // Should not contain gear emoji
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      expect(h1Match![0]).not.toContain('⚙️');
    });

    it('should use settings gear icon with correct viewBox', () => {
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      expect(h1Match![0]).toContain('viewBox="0 0 24 24"');
    });

    it('should have appropriate size for title icon', () => {
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      // Title icon should be larger (28px matches heading size)
      expect(h1Match![0]).toContain('width="28"');
      expect(h1Match![0]).toContain('height="28"');
    });

    it('should use colorful fills (not monochrome)', () => {
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      // Should have multiple fill colors
      expect(h1Match![0]).toContain('fill="#3A7B89"'); // Teal center
      expect(h1Match![0]).toContain('fill="#5BA3B0"'); // Light teal body
    });

    it('should use forest theme colors', () => {
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      // Colors should be from forest theme (teal/blue family)
      const hasTealColors =
        h1Match![0].includes('#3A7B89') || h1Match![0].includes('#5BA3B0');
      expect(hasTealColors).toBe(true);
    });

    it('should have vertical alignment styling', () => {
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      expect(h1Match).toBeTruthy();
      expect(h1Match![0]).toContain('vertical-align: middle');
    });
  });

  describe('Manage Personas link icon', () => {
    it('should have SVG icon in manage personas link', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      expect(linkMatch![0]).toContain('<svg');
    });

    it('should have appropriate size for link icon', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      // Link icon should be smaller (14px for inline text)
      expect(linkMatch![0]).toContain('width="14"');
      expect(linkMatch![0]).toContain('height="14"');
    });

    it('should use colorful fills (not monochrome)', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      // Should have multiple fill colors for persona icon
      expect(linkMatch![0]).toContain('fill="#4A7C54"'); // Primary green
      expect(linkMatch![0]).toContain('fill="#A3C4AC"'); // Light green
    });

    it('should use forest theme colors', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      // Colors should be from forest theme (green family)
      const hasGreenColors =
        linkMatch![0].includes('#4A7C54') || linkMatch![0].includes('#A3C4AC');
      expect(hasGreenColors).toBe(true);
    });

    it('should have vertical alignment styling', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      expect(linkMatch![0]).toContain('vertical-align: middle');
    });

    it('should have margin between icon and text', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      expect(linkMatch![0]).toContain('margin-right');
    });

    it('should still have data-i18n attribute for translation', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      expect(linkMatch![0]).toContain('data-i18n="settings.managePersonas"');
    });
  });

  describe('Icon colors are not monochrome', () => {
    it('should not use only black/white/gray fills', () => {
      // Extract all fill colors from the HTML
      const fillMatches = settingsHtml.match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const colors = fillMatches.map((m) => m.match(/#[A-Fa-f0-9]{6}/)![0]);

      // Should have colorful fills, not just grayscale
      const grayscaleColors = [
        '#000000',
        '#FFFFFF',
        '#808080',
        '#C0C0C0',
        '#E0E0E0',
        '#F0F0F0',
      ];
      const hasColorfulFills = colors.some(
        (c) => !grayscaleColors.includes(c.toUpperCase())
      );
      expect(hasColorfulFills).toBe(true);
    });

    it('should use multiple distinct colors', () => {
      const fillMatches = settingsHtml.match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      const colors = new Set(
        fillMatches.map((m) => m.match(/#[A-Fa-f0-9]{6}/)![0].toUpperCase())
      );
      // Should have at least 3 distinct colors
      expect(colors.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Forest theme color palette', () => {
    it('should use green family colors (#4A7C54, #A3C4AC, etc)', () => {
      const greenColors = ['#4A7C54', '#A3C4AC', '#E8F0EA', '#3A5A40'];
      const hasGreenColors = greenColors.some((c) =>
        settingsHtml.includes(c)
      );
      expect(hasGreenColors).toBe(true);
    });

    it('should use teal/blue family colors (#3A7B89, #5BA3B0, etc)', () => {
      const tealColors = ['#3A7B89', '#5BA3B0', '#E8F3F5'];
      const hasTealColors = tealColors.some((c) =>
        settingsHtml.includes(c)
      );
      expect(hasTealColors).toBe(true);
    });
  });

  describe('SVG structure', () => {
    it('should have proper SVG elements', () => {
      expect(settingsHtml).toContain('<svg');
      expect(settingsHtml).toContain('</svg>');
      expect(settingsHtml).toContain('<path');
    });

    it('should use fill attribute for colorful icons', () => {
      expect(settingsHtml).toContain('fill=');
    });

    it('should have stroke attributes where needed', () => {
      // Persona icon uses strokes for the plus sign
      expect(settingsHtml).toContain('stroke=');
    });
  });
});
