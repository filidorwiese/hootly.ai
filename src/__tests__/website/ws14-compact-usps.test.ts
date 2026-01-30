/**
 * WS-14: Make USP sections compact and horizontal
 *
 * Requirements:
 * - Change USP layout from stacked to grid/flexbox
 * - Display USPs side-by-side (2-4 columns)
 * - Reduce padding/margins for compact look
 * - Ensure responsive: stack on mobile, columns on desktop
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-14: Compact Horizontal USP Sections', () => {
  let cssContent: string;
  let htmlContent: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'website', 'styles.css');
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  });

  describe('Grid Layout', () => {
    it('uses CSS grid for features section', () => {
      expect(cssContent).toMatch(/\.features\s*\{[^}]*display:\s*grid/);
    });

    it('defines grid columns with repeat()', () => {
      expect(cssContent).toMatch(/grid-template-columns:\s*repeat\(\d+,\s*1fr\)/);
    });

    it('has gap between grid items', () => {
      expect(cssContent).toMatch(/\.features\s*\{[^}]*gap:/);
    });
  });

  describe('Desktop Layout (4 columns)', () => {
    it('shows 4 columns on large screens', () => {
      // In the @media (min-width: 1024px) block
      expect(cssContent).toMatch(/@media\s*\(min-width:\s*1024px\)[^}]*\{[^]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);
    });
  });

  describe('Tablet Layout (2 columns)', () => {
    it('shows 2 columns on tablet', () => {
      // Main styles use 2 columns
      expect(cssContent).toMatch(/\.features\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/);
    });
  });

  describe('Mobile Layout (stacked)', () => {
    it('stacks to 1 column on mobile', () => {
      // @media (max-width: 480px) should have 1fr column
      expect(cssContent).toMatch(/@media\s*\(max-width:\s*480px\)[^}]*\{[^]*grid-template-columns:\s*1fr[^}]/);
    });
  });

  describe('Compact Styling', () => {
    it('has reduced icon size (48px or less)', () => {
      // Base icon size should be 48px or smaller
      expect(cssContent).toMatch(/\.feature-icon\s*\{[^}]*width:\s*(4[0-8]px|[1-3]?\d+px)/);
    });

    it('has reduced padding for features', () => {
      // Padding should be reduced from original var(--spacing-8) to var(--spacing-5) or less
      expect(cssContent).toMatch(/\.feature\s*\{[^}]*padding:\s*var\(--spacing-[1-5]\)/);
    });

    it('has smaller heading font size', () => {
      // Feature h2 should use smaller font size (lg instead of 2xl)
      expect(cssContent).toMatch(/\.feature\s+h2\s*\{[^}]*font-size:\s*var\(--font-size-lg\)/);
    });

    it('has smaller paragraph font size', () => {
      // Feature p should use smaller font (sm)
      expect(cssContent).toMatch(/\.feature\s+p\s*\{[^}]*font-size:\s*var\(--font-size-sm\)/);
    });
  });

  describe('HTML Structure', () => {
    it('has 4 feature cards in the features section', () => {
      const featureMatches = htmlContent.match(/<div class="feature"/g);
      expect(featureMatches).toBeTruthy();
      expect(featureMatches!.length).toBe(4);
    });

    it('all feature cards have unique IDs', () => {
      expect(htmlContent).toContain('id="byok"');
      expect(htmlContent).toContain('id="privacy"');
      expect(htmlContent).toContain('id="free"');
      expect(htmlContent).toContain('id="history-personas"');
    });
  });

  describe('Grid Constraints', () => {
    it('features section has max-width for containing layout', () => {
      expect(cssContent).toMatch(/\.features\s*\{[^}]*max-width:/);
    });

    it('features section is centered', () => {
      expect(cssContent).toMatch(/\.features\s*\{[^}]*margin:\s*0\s+auto/);
    });
  });

  describe('Responsive Breakpoints', () => {
    it('has mobile breakpoint at 480px', () => {
      expect(cssContent).toMatch(/@media\s*\(max-width:\s*480px\)/);
    });

    it('has tablet breakpoint', () => {
      expect(cssContent).toMatch(/@media\s*\(min-width:\s*481px\)\s*and\s*\(max-width:\s*768px\)/);
    });

    it('has desktop breakpoint at 1024px', () => {
      expect(cssContent).toMatch(/@media\s*\(min-width:\s*1024px\)/);
    });
  });
});
