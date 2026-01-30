import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-4: Add BYOK selling point section', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeAll(() => {
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    const cssPath = path.join(process.cwd(), 'website', 'styles.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('HTML Structure', () => {
    it('should have a features section', () => {
      expect(htmlContent).toContain('<section class="features">');
    });

    it('should have BYOK feature with id="byok"', () => {
      expect(htmlContent).toContain('id="byok"');
    });

    it('should have feature class on BYOK element', () => {
      expect(htmlContent).toContain('<div class="feature" id="byok">');
    });

    it('should have h2 heading with "Bring Your Own Key"', () => {
      expect(htmlContent).toContain('<h2>Bring Your Own Key</h2>');
    });

    it('should explain API key usage in paragraph', () => {
      expect(htmlContent).toContain('Use your own API key');
    });

    it('should mention API cost control', () => {
      expect(htmlContent).toContain('control your costs');
    });

    it('should mention no middleman markup', () => {
      expect(htmlContent).toContain('no middleman markup');
    });

    it('should mention no hidden fees', () => {
      expect(htmlContent).toContain('no hidden fees');
    });

    it('should have feature-icon container', () => {
      expect(htmlContent).toContain('<div class="feature-icon">');
    });

    it('should have SVG icon in feature', () => {
      // Check that there's an SVG within the BYOK feature section
      const byokMatch = htmlContent.match(/id="byok"[\s\S]*?<\/section>/);
      expect(byokMatch).not.toBeNull();
      expect(byokMatch![0]).toContain('<svg');
    });
  });

  describe('Icon Styling', () => {
    it('should have colorful SVG icon (not monochrome)', () => {
      const byokSection = htmlContent.match(/id="byok"[\s\S]*?<\/svg>/);
      expect(byokSection).not.toBeNull();
      const svgContent = byokSection![0];

      // Should have multiple fill colors
      const fillMatches = svgContent.match(/fill="[^"]+"/g);
      expect(fillMatches).not.toBeNull();
      expect(fillMatches!.length).toBeGreaterThanOrEqual(2);

      // Should have different fill values
      const uniqueFills = new Set(fillMatches);
      expect(uniqueFills.size).toBeGreaterThanOrEqual(2);
    });

    it('should use forest theme colors in icon', () => {
      const byokSection = htmlContent.match(/id="byok"[\s\S]*?<\/svg>/);
      expect(byokSection).not.toBeNull();
      const svgContent = byokSection![0];

      // Should contain green colors from forest theme
      const hasForestGreen = svgContent.includes('#3A5A40') ||
                             svgContent.includes('#4A7C54') ||
                             svgContent.includes('#E8F0EA');
      expect(hasForestGreen).toBe(true);
    });

    it('should have key/lock-related icon shape', () => {
      const byokSection = htmlContent.match(/id="byok"[\s\S]*?<\/svg>/);
      expect(byokSection).not.toBeNull();
      const svgContent = byokSection![0];

      // Icon should have lock-like elements (rect for body, path for shackle, circle for keyhole)
      expect(svgContent).toContain('<rect');
      expect(svgContent).toContain('<circle');
    });
  });

  describe('CSS Styling', () => {
    it('should have .features class defined', () => {
      expect(cssContent).toContain('.features');
    });

    it('should have .feature class defined', () => {
      expect(cssContent).toContain('.feature');
    });

    it('should have .feature-icon class defined', () => {
      expect(cssContent).toContain('.feature-icon');
    });

    it('should set max-width on feature cards', () => {
      const featureRule = cssContent.match(/\.feature\s*\{[^}]+\}/);
      expect(featureRule).not.toBeNull();
      expect(featureRule![0]).toContain('max-width');
    });

    it('should center feature cards', () => {
      const featureRule = cssContent.match(/\.feature\s*\{[^}]+\}/);
      expect(featureRule).not.toBeNull();
      expect(featureRule![0]).toContain('margin');
      expect(featureRule![0]).toContain('auto');
    });

    it('should have text-align center on feature', () => {
      const featureRule = cssContent.match(/\.feature\s*\{[^}]+\}/);
      expect(featureRule).not.toBeNull();
      expect(featureRule![0]).toContain('text-align: center');
    });

    it('should use flat design (no box-shadow on feature)', () => {
      const featureRule = cssContent.match(/\.feature\s*\{[^}]+\}/);
      expect(featureRule).not.toBeNull();
      expect(featureRule![0]).not.toContain('box-shadow');
    });

    it('should use solid border on feature card', () => {
      const featureRule = cssContent.match(/\.feature\s*\{[^}]+\}/);
      expect(featureRule).not.toBeNull();
      expect(featureRule![0]).toContain('border');
      expect(featureRule![0]).toContain('solid');
    });

    it('should set feature-icon size', () => {
      const iconRule = cssContent.match(/\.feature-icon\s*\{[^}]+\}/);
      expect(iconRule).not.toBeNull();
      expect(iconRule![0]).toContain('width');
      expect(iconRule![0]).toContain('height');
    });

    it('should style feature h2 heading', () => {
      expect(cssContent).toContain('.feature h2');
    });

    it('should style feature paragraph', () => {
      expect(cssContent).toContain('.feature p');
    });

    it('should use design system color variables', () => {
      const featureH2Rule = cssContent.match(/\.feature h2\s*\{[^}]+\}/);
      expect(featureH2Rule).not.toBeNull();
      expect(featureH2Rule![0]).toContain('var(--color-');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icon', () => {
      const byokSection = htmlContent.match(/id="byok"[\s\S]*?<\/svg>/);
      expect(byokSection).not.toBeNull();
      expect(byokSection![0]).toContain('aria-hidden="true"');
    });

    it('should have proper heading hierarchy (h2)', () => {
      // After h1 in hero, features should use h2
      const h1Index = htmlContent.indexOf('<h1');
      const h2Index = htmlContent.indexOf('<h2>Bring Your Own Key</h2>');
      expect(h1Index).toBeLessThan(h2Index);
    });
  });

  describe('Semantic HTML', () => {
    it('should be inside main element', () => {
      const mainMatch = htmlContent.match(/<main>[\s\S]*<\/main>/);
      expect(mainMatch).not.toBeNull();
      expect(mainMatch![0]).toContain('id="byok"');
    });

    it('should be in a section element', () => {
      expect(htmlContent).toContain('<section class="features">');
    });
  });
});
