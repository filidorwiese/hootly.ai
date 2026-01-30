import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-6: Add free/no subscription section', () => {
  let indexHtml: string;
  let stylesCss: string;

  beforeAll(() => {
    const websitePath = path.resolve(__dirname, '../../../website');
    indexHtml = fs.readFileSync(path.join(websitePath, 'index.html'), 'utf-8');
    stylesCss = fs.readFileSync(path.join(websitePath, 'styles.css'), 'utf-8');
  });

  describe('HTML structure', () => {
    it('should have a free feature section with id="free"', () => {
      expect(indexHtml).toMatch(/id=["']free["']/);
      expect(indexHtml).toContain('class="feature"');
    });

    it('should have heading "Free as in Beer"', () => {
      expect(indexHtml).toMatch(/<h2[^>]*>Free as in Beer<\/h2>/i);
    });

    it('should explain no subscription fees', () => {
      expect(indexHtml).toMatch(/no subscription/i);
    });

    it('should explain user pays only API usage', () => {
      expect(indexHtml).toMatch(/pay.*only.*API|API.*cost|API.*usage/i);
    });

    it('should have a feature-icon container', () => {
      // Find the free section and verify it has feature-icon
      const freeIdx = indexHtml.indexOf('id="free"');
      expect(freeIdx).toBeGreaterThan(-1);
      const sectionChunk = indexHtml.slice(freeIdx, freeIdx + 1500);
      expect(sectionChunk).toContain('feature-icon');
    });

    it('should appear in the features section', () => {
      const featuresSection = indexHtml.match(/<section[^>]*class=["'][^"']*features[^"']*["'][^>]*>[\s\S]*?<\/section>/);
      expect(featuresSection).toBeTruthy();
      expect(featuresSection![0]).toContain('id="free"');
    });

    it('should be positioned after privacy section', () => {
      const privacyIndex = indexHtml.indexOf('id="privacy"');
      const freeIndex = indexHtml.indexOf('id="free"');
      expect(privacyIndex).toBeLessThan(freeIndex);
    });
  });

  describe('Icon requirements', () => {
    it('should have an SVG icon in the feature', () => {
      // Extract the free section and check for SVG
      const freeIdx = indexHtml.indexOf('id="free"');
      expect(freeIdx).toBeGreaterThan(-1);
      const sectionChunk = indexHtml.slice(freeIdx, freeIdx + 1500);
      expect(sectionChunk).toMatch(/<svg[^>]*>/);
    });

    it('should have colorful icon (multiple colors, not monochrome)', () => {
      // Extract the free section SVG
      const freeIdx = indexHtml.indexOf('id="free"');
      const svgEndIdx = indexHtml.indexOf('</svg>', freeIdx);
      const sectionChunk = indexHtml.slice(freeIdx, svgEndIdx + 10);

      // Check for multiple fill colors
      const fills = sectionChunk.match(/fill=["']#[A-Fa-f0-9]{6}["']/g) || [];
      const uniqueColors = new Set(fills.map(f => f.toLowerCase()));
      expect(uniqueColors.size).toBeGreaterThanOrEqual(2);
    });

    it('should use forest theme colors in icon', () => {
      const freeIdx = indexHtml.indexOf('id="free"');
      const svgEndIdx = indexHtml.indexOf('</svg>', freeIdx);
      const sectionChunk = indexHtml.slice(freeIdx, svgEndIdx + 10);

      // Check for forest theme colors (greens)
      const hasForestColor = /#3A5A40|#4A7C54|#588157|#E8F0EA|#A3C4AC/i.test(sectionChunk);
      expect(hasForestColor).toBe(true);
    });
  });

  describe('Content requirements', () => {
    it('should explain cost benefits clearly', () => {
      // Check for cost-related keywords in free section
      const freeMatch = indexHtml.match(/id=["']free["'][\s\S]*?<\/p>/);
      expect(freeMatch).toBeTruthy();
      const hasCosetContent = /free|cost|pay|fee|subscription|charge/i.test(freeMatch![0]);
      expect(hasCosetContent).toBe(true);
    });

    it('should have a descriptive paragraph', () => {
      const freeIdx = indexHtml.indexOf('id="free"');
      expect(freeIdx).toBeGreaterThan(-1);
      const sectionChunk = indexHtml.slice(freeIdx, freeIdx + 1500);
      expect(sectionChunk).toMatch(/<p>[\s\S]{20,}<\/p>/);
    });
  });

  describe('CSS styling', () => {
    it('should use flat design (no box-shadow)', () => {
      // Verify no box-shadow in feature styles
      const featureStyles = stylesCss.match(/\.feature\s*\{[^}]*\}/g) || [];
      featureStyles.forEach(style => {
        expect(style).not.toMatch(/box-shadow/);
      });
    });

    it('should use solid background color', () => {
      // Features use surface color
      expect(stylesCss).toMatch(/\.feature[\s\S]*?background-color/);
    });

    it('should have border instead of shadow', () => {
      expect(stylesCss).toMatch(/\.feature[\s\S]*?border/);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icon', () => {
      const freeIdx = indexHtml.indexOf('id="free"');
      const svgEndIdx = indexHtml.indexOf('</svg>', freeIdx);
      const sectionChunk = indexHtml.slice(freeIdx, svgEndIdx + 10);
      expect(sectionChunk).toMatch(/aria-hidden=["']true["']/);
    });

    it('should have proper heading hierarchy', () => {
      // Feature sections should use h2
      const freeIdx = indexHtml.indexOf('id="free"');
      expect(freeIdx).toBeGreaterThan(-1);
      const sectionChunk = indexHtml.slice(freeIdx, freeIdx + 1500);
      expect(sectionChunk).toMatch(/<h2>/);
    });
  });

  describe('Theme consistency', () => {
    it('should use consistent spacing with other features', () => {
      // All features use same CSS class
      const featureCount = (indexHtml.match(/class=["']feature["']/g) || []).length;
      expect(featureCount).toBeGreaterThanOrEqual(3); // byok, privacy, free
    });

    it('should follow same structure as other feature cards', () => {
      // Count feature sections by counting 'class="feature"' with id attributes
      const byokExists = indexHtml.includes('id="byok"');
      const privacyExists = indexHtml.includes('id="privacy"');
      const freeExists = indexHtml.includes('id="free"');

      expect(byokExists).toBe(true);
      expect(privacyExists).toBe(true);
      expect(freeExists).toBe(true);

      // Each feature should have icon, h2, p - verify for free section
      const freeIdx = indexHtml.indexOf('id="free"');
      const sectionChunk = indexHtml.slice(freeIdx, freeIdx + 1500);
      expect(sectionChunk).toContain('feature-icon');
      expect(sectionChunk).toMatch(/<h2>/);
      expect(sectionChunk).toMatch(/<p>/);
    });
  });
});
