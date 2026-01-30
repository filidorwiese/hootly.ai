/**
 * WS-7: Add history and personas section to website
 * Tests verify:
 * - Feature section for history and personas exists
 * - Highlights conversation history feature
 * - Highlights personas/roles feature
 * - Explains local storage benefits
 * - Relevant icons or illustrations
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-7: Add history and personas section', () => {
  const htmlPath = path.resolve(__dirname, '../../../website/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  describe('HTML structure', () => {
    it('should have a feature section with id="features-extended" or similar', () => {
      // Either id="history-personas" or the feature div has id
      expect(html).toMatch(/id=["']?(history-personas|features-extended|history|personas)["']?/i);
    });

    it('should have history feature content', () => {
      // Check for history-related heading
      expect(html).toMatch(/history/i);
    });

    it('should have personas feature content', () => {
      // Check for personas-related content
      expect(html).toMatch(/persona/i);
    });

    it('should use semantic HTML with feature div class', () => {
      expect(html).toMatch(/<div[^>]*class=["'][^"']*feature[^"']*["']/i);
    });

    it('should have heading element for the feature', () => {
      // Look for h2 with history or personas
      expect(html).toMatch(/<h2[^>]*>.*?(history|persona)/is);
    });

    it('should have descriptive paragraph', () => {
      // Look for p tag explaining local storage
      expect(html).toMatch(/<p[^>]*>.*?(local|browser|storage|conversation|role)/is);
    });
  });

  describe('History feature content', () => {
    it('should mention conversation history', () => {
      expect(html.toLowerCase()).toContain('history');
    });

    it('should explain history feature benefits', () => {
      // Should mention at least one of: browse, search, continue, export, save
      expect(html).toMatch(/(browse|search|continue|export|save|recall|previous|past)/i);
    });
  });

  describe('Personas feature content', () => {
    it('should mention personas or roles', () => {
      expect(html).toMatch(/(persona|role|assistant|character)/i);
    });

    it('should explain personas feature benefits', () => {
      // Should mention at least one of: customize, tailor, different, switch, context
      expect(html).toMatch(/(custom|tailor|different|switch|context|behavior|style|tone)/i);
    });
  });

  describe('Local storage benefits', () => {
    it('should explain local storage advantage', () => {
      // Should mention local, browser, device, or private storage
      expect(html).toMatch(/(local|browser|device|private|your\s+data)/i);
    });
  });

  describe('Icons/illustrations', () => {
    it('should have SVG icon for the feature', () => {
      // The history-personas feature section should have an SVG icon
      const featureSection = html.match(/id=["']?(history-personas|history|personas)["']?[^>]*>[\s\S]*?<\/div>\s*<\/div>/i);
      if (featureSection) {
        expect(featureSection[0]).toMatch(/<svg/i);
      } else {
        // Alternative: just check there's an SVG in a feature after the "free" section
        const afterFree = html.split(/id=["']free["']/i)[1];
        if (afterFree) {
          expect(afterFree).toMatch(/<svg/i);
        } else {
          // Fallback: just verify there are multiple feature SVGs
          const svgMatches = html.match(/<div[^>]*feature[^>]*>[\s\S]*?<svg/gi);
          expect(svgMatches && svgMatches.length >= 4).toBe(true);
        }
      }
    });

    it('should have colorful SVG icon (not monochrome)', () => {
      // Extract the history-personas or similar feature section
      const sectionsAfterFree = html.split(/id=["']free["']/i)[1] || '';
      const nextFeature = sectionsAfterFree.match(/<div[^>]*class=["'][^"']*feature[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/i);

      if (nextFeature) {
        const svgMatch = nextFeature[0].match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          // Should have multiple fill colors
          const fills = svgMatch[0].match(/fill=["']#[A-Fa-f0-9]{6}["']/g) || [];
          const uniqueFills = new Set(fills.map(f => f.toLowerCase()));
          expect(uniqueFills.size).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('should use forest theme colors', () => {
      // Check the SVG uses colors from forest theme palette
      const forestColors = ['3A5A40', '4A7C54', '588157', 'E8F0EA', 'A3C4AC', '3A7B89'];
      const sectionsAfterFree = html.split(/id=["']free["']/i)[1] || '';

      if (sectionsAfterFree) {
        const hasForestColor = forestColors.some(color =>
          sectionsAfterFree.toLowerCase().includes(color.toLowerCase())
        );
        expect(hasForestColor).toBe(true);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative SVG', () => {
      // Icons in feature sections should be decorative
      const svgIcons = html.match(/<div[^>]*feature-icon[^>]*>[\s\S]*?<svg[\s\S]*?>/gi);
      if (svgIcons && svgIcons.length > 0) {
        // At least one should have aria-hidden
        const hasAriaHidden = svgIcons.some(icon => icon.includes('aria-hidden'));
        expect(hasAriaHidden).toBe(true);
      }
    });

    it('should have proper heading hierarchy', () => {
      // h2 should be used for feature headings
      const h2Count = (html.match(/<h2/gi) || []).length;
      expect(h2Count).toBeGreaterThanOrEqual(4); // BYOK, Privacy, Free, History/Personas
    });
  });

  describe('Position in page', () => {
    it('should appear after existing features (BYOK, privacy, free)', () => {
      const byokPos = html.indexOf('id="byok"');
      const privacyPos = html.indexOf('id="privacy"');
      const freePos = html.indexOf('id="free"');

      // Check for history-personas feature
      const historyPersonasPos = html.match(/id=["']?(history-personas|history|personas)["']?/i);

      if (historyPersonasPos) {
        const pos = html.indexOf(historyPersonasPos[0]);
        expect(pos).toBeGreaterThan(byokPos);
        expect(pos).toBeGreaterThan(privacyPos);
        expect(pos).toBeGreaterThan(freePos);
      }
    });

    it('should be inside the features section', () => {
      const featuresSection = html.match(/<section[^>]*class=["'][^"']*features[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
      expect(featuresSection).toBeTruthy();

      if (featuresSection) {
        // The new feature should be inside this section
        expect(featuresSection[1]).toMatch(/(history|persona)/i);
      }
    });
  });
});
