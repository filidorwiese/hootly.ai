import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-5: Add privacy selling point section', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeEach(() => {
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    const cssPath = path.join(process.cwd(), 'website', 'styles.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('HTML Structure', () => {
    it('should have privacy feature section with id="privacy"', () => {
      expect(htmlContent).toContain('id="privacy"');
    });

    it('should have feature class on privacy section', () => {
      expect(htmlContent).toMatch(/class="feature"[^>]*id="privacy"/);
    });

    it('should be inside features section', () => {
      const featuresMatch = htmlContent.match(/<section class="features">([\s\S]*?)<\/section>/);
      expect(featuresMatch).not.toBeNull();
      expect(featuresMatch![1]).toContain('id="privacy"');
    });
  });

  describe('Privacy heading', () => {
    it('should have h2 heading with "Privacy" text', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toMatch(/<h2>[^<]*Privacy[^<]*<\/h2>/i);
    });

    it('should mention privacy-friendly concept', () => {
      expect(htmlContent).toMatch(/Privacy\s*Friendly|Private|Your Privacy/i);
    });
  });

  describe('Privacy explanation', () => {
    it('should have paragraph explaining data storage', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toContain('<p>');
    });

    it('should mention local storage', () => {
      expect(htmlContent).toMatch(/local(ly)?|device|browser/i);
    });

    it('should mention no telemetry or tracking', () => {
      expect(htmlContent).toMatch(/no\s*(telemetry|tracking|analytics)|telemetry|tracking/i);
    });
  });

  describe('Privacy icon', () => {
    it('should have feature-icon container', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toContain('class="feature-icon"');
    });

    it('should have SVG icon', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toContain('<svg');
    });

    it('should have aria-hidden on decorative icon', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toContain('aria-hidden="true"');
    });
  });

  describe('Icon colors (colorful, not monochrome)', () => {
    it('should use multiple colors in icon (not grayscale)', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();

      const svgMatch = privacySection![1].match(/<svg[\s\S]*?<\/svg>/);
      expect(svgMatch).not.toBeNull();

      const fillMatches = svgMatch![0].match(/fill="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})"/g);
      expect(fillMatches).not.toBeNull();
      expect(fillMatches!.length).toBeGreaterThanOrEqual(2);
    });

    it('should use forest theme colors', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();

      const svgMatch = privacySection![1].match(/<svg[\s\S]*?<\/svg>/);
      expect(svgMatch).not.toBeNull();

      const forestColors = ['#3A5A40', '#4A7C54', '#E8F0EA', '#588157', '#A3C4AC', '#C1D7C5'];
      const hasForestColor = forestColors.some(color => svgMatch![0].includes(color));
      expect(hasForestColor).toBe(true);
    });
  });

  describe('CSS styling', () => {
    it('should use flat design (no box-shadow)', () => {
      expect(cssContent).not.toMatch(/\.feature[^{]*\{[^}]*box-shadow/);
    });

    it('should use solid border for features', () => {
      expect(cssContent).toMatch(/\.feature[^{]*\{[^}]*border:/);
    });
  });

  describe('Order of features', () => {
    it('should have privacy section after BYOK section', () => {
      const byokIndex = htmlContent.indexOf('id="byok"');
      const privacyIndex = htmlContent.indexOf('id="privacy"');
      expect(byokIndex).toBeGreaterThan(-1);
      expect(privacyIndex).toBeGreaterThan(-1);
      expect(privacyIndex).toBeGreaterThan(byokIndex);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      const privacySection = htmlContent.match(/<div[^>]*id="privacy"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="feature"|<\/section>)/);
      expect(privacySection).not.toBeNull();
      expect(privacySection![1]).toContain('<h2>');
    });
  });
});
