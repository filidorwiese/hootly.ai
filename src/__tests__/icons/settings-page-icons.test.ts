/**
 * Tests for ICON-2: Replace settings page icons with glyphs.fyi icons
 *
 * Verifies that:
 * - Settings page uses TabHeader with owl logo for branding
 * - Manage Personas link uses SVG icon
 * - Icons are colorful (not monochrome)
 * - Icons match forest theme colors
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('ICON-2: Settings Page Icons', () => {
  let settingsHtml: string;
  let settingsTs: string;
  let tabHeaderTs: string;

  beforeAll(() => {
    settingsHtml = readFileSync(
      resolve(__dirname, '../../settings/index.html'),
      'utf-8'
    );
    settingsTs = readFileSync(
      resolve(__dirname, '../../settings/settings.ts'),
      'utf-8'
    );
    tabHeaderTs = readFileSync(
      resolve(__dirname, '../../shared/TabHeader.ts'),
      'utf-8'
    );
  });

  describe('Branding via TabHeader', () => {
    it('settings.ts imports TabHeader', () => {
      expect(settingsTs).toMatch(/import.*injectTabHeader.*from.*TabHeader/);
    });

    it('settings.ts calls injectTabHeader with settings as active', () => {
      expect(settingsTs).toMatch(/injectTabHeader.*activeTab.*settings/s);
    });

    it('TabHeader has owl logo SVG', () => {
      expect(tabHeaderTs).toMatch(/OWL_LOGO_SVG/);
      expect(tabHeaderTs).toContain('<svg');
    });

    it('TabHeader owl logo uses colorful fills', () => {
      // Owl logo should have forest theme colors
      expect(tabHeaderTs).toContain('#4A7C54'); // Green
      expect(tabHeaderTs).toContain('#E8F0EA'); // Light green
    });

    it('TabHeader has Hootly.ai branding text', () => {
      expect(tabHeaderTs).toContain('Hootly.ai');
    });

    it('old h1 with settings SVG icon is removed', () => {
      // The old h1 with 28x28 settings icon should be removed
      const hasOldSettingsIcon = settingsHtml.includes('<svg width="28" height="28"') &&
        settingsHtml.includes('fill="#3A7B89"') &&
        settingsHtml.includes('fill="#5BA3B0"');
      expect(hasOldSettingsIcon).toBe(false);
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
    it('should not use only black/white/gray fills in manage personas link', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();

      // Extract all fill colors from the link
      const fillMatches = linkMatch![0].match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
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

    it('settings page should have colorful SVG icons', () => {
      // The manage personas link has colorful SVG
      const fillMatches = settingsHtml.match(/fill="#[A-Fa-f0-9]{6}"/g) || [];
      expect(fillMatches.length).toBeGreaterThan(0);
    });
  });

  describe('Forest theme color palette', () => {
    it('should use green family colors (#4A7C54, #A3C4AC, etc) in icons', () => {
      const greenColors = ['#4A7C54', '#A3C4AC', '#E8F0EA', '#3A5A40'];
      const hasGreenColors = greenColors.some((c) =>
        settingsHtml.includes(c)
      );
      expect(hasGreenColors).toBe(true);
    });

    it('TabHeader should use forest theme colors', () => {
      const forestColors = ['#4A7C54', '#E8F0EA', '#2D3A30', '#A3C4AC', '#3A5A40'];
      const hasForestColors = forestColors.some((c) =>
        tabHeaderTs.includes(c)
      );
      expect(hasForestColors).toBe(true);
    });
  });

  describe('SVG structure', () => {
    it('should have proper SVG elements in manage personas link', () => {
      const linkMatch = settingsHtml.match(
        /<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/
      );
      expect(linkMatch).toBeTruthy();
      expect(linkMatch![0]).toContain('<svg');
      expect(linkMatch![0]).toContain('</svg>');
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
