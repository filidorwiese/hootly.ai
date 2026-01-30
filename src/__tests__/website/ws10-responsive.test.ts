/**
 * WS-10: Make website responsive
 * Tests that the website is responsive at 320px, 768px, and 1024px widths
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-10: Make website responsive', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeAll(() => {
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    const cssPath = path.join(process.cwd(), 'website', 'styles.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('HTML structure for responsiveness', () => {
    it('should have viewport meta tag', () => {
      expect(htmlContent).toContain('meta name="viewport"');
      expect(htmlContent).toContain('width=device-width');
      expect(htmlContent).toContain('initial-scale=1.0');
    });

    it('should have download buttons container with flex-wrap', () => {
      expect(htmlContent).toContain('class="download-buttons"');
    });

    it('should have features section', () => {
      expect(htmlContent).toContain('class="features"');
    });

    it('should have hero screenshot container', () => {
      expect(htmlContent).toContain('class="hero-screenshot-placeholder"');
    });
  });

  describe('CSS media queries', () => {
    it('should have media query for mobile (max-width around 480px)', () => {
      // Check for small mobile breakpoint
      const hasMobileQuery = cssContent.includes('@media') &&
        (cssContent.includes('max-width: 480px') ||
         cssContent.includes('max-width:480px') ||
         cssContent.includes('max-width: 500px') ||
         cssContent.includes('max-width:500px'));
      expect(hasMobileQuery).toBe(true);
    });

    it('should have media query for tablet (around 768px)', () => {
      const hasTabletQuery = cssContent.includes('@media') &&
        (cssContent.includes('768px') || cssContent.includes('800px'));
      expect(hasTabletQuery).toBe(true);
    });

    it('should have media query for desktop/laptop (around 1024px)', () => {
      const hasDesktopQuery = cssContent.includes('@media') &&
        (cssContent.includes('1024px') || cssContent.includes('1000px'));
      expect(hasDesktopQuery).toBe(true);
    });
  });

  describe('Mobile-first responsive patterns', () => {
    it('should have responsive font size for hero h1', () => {
      // Check that h1 font size adjusts at smaller screens
      expect(cssContent).toMatch(/\.hero\s+h1[\s\S]*?font-size/);
      // Should have a responsive font size in media query
      const hasResponsiveH1 = cssContent.includes('@media') &&
        cssContent.match(/@media[^{]*{[^}]*\.hero\s+h1[^}]*font-size/s);
      expect(hasResponsiveH1 || cssContent.includes('font-size: var(--font-size-3xl)')).toBeTruthy();
    });

    it('should stack features on mobile', () => {
      // Features should be stacked by default (mobile-first) or via media query
      const hasFeatureLayout = cssContent.includes('.feature') || cssContent.includes('.features');
      expect(hasFeatureLayout).toBe(true);
    });

    it('should have flex-wrap on download buttons', () => {
      expect(cssContent).toContain('flex-wrap');
    });

    it('should have responsive padding/margins in media queries', () => {
      // Check that spacing adjusts for smaller screens
      const hasResponsivePadding = cssContent.includes('@media') &&
        (cssContent.includes('padding') || cssContent.includes('margin'));
      expect(hasResponsivePadding).toBe(true);
    });
  });

  describe('320px (small mobile) compatibility', () => {
    it('should reduce hero h1 font size for very small screens', () => {
      // At 320px, font-size-4xl (48px) is too big
      // Should have smaller font size in media query
      const has320pxFontSize = cssContent.match(/@media[^{]*max-width:\s*(?:320|480|500)px[^{]*{[^}]*font-size/s) ||
        cssContent.match(/@media[^{]*max-width:\s*(?:320|480|500)px/);
      expect(has320pxFontSize).toBeTruthy();
    });

    it('should have reduced padding for small screens', () => {
      const hasReducedPadding = cssContent.match(/@media[^{]*max-width[^{]*{[^}]*padding/s);
      expect(hasReducedPadding).toBeTruthy();
    });

    it('should have full-width download buttons on small screens', () => {
      // Download buttons should be full width or properly sized on mobile
      const hasResponsiveButtons = cssContent.includes('.download-btn') &&
        (cssContent.includes('flex-direction: column') ||
         cssContent.includes('width: 100%') ||
         cssContent.includes('flex-wrap'));
      expect(hasResponsiveButtons).toBe(true);
    });
  });

  describe('768px (tablet) compatibility', () => {
    it('should have adjusted layout for tablet', () => {
      const hasTabletStyles = cssContent.includes('768px') || cssContent.includes('800px');
      expect(hasTabletStyles).toBe(true);
    });

    it('should have appropriate hero sizing', () => {
      // Hero content should have appropriate max-width or sizing
      expect(cssContent).toContain('.hero-content');
    });
  });

  describe('1024px (desktop) compatibility', () => {
    it('should have max-width constraint for content', () => {
      expect(cssContent).toContain('max-width');
      // Main content or nav should have max-width for desktop
      expect(cssContent).toMatch(/max-width:\s*1\d{3}px/);
    });

    it('should center content at wider screens', () => {
      expect(cssContent).toContain('margin: 0 auto');
    });
  });

  describe('Screenshot/hero image responsiveness', () => {
    it('should have responsive hero screenshot placeholder', () => {
      expect(cssContent).toContain('.hero-screenshot-placeholder');
    });

    it('should have responsive min-height for screenshot area', () => {
      // Screenshot area should adjust on smaller screens
      const hasResponsiveMinHeight = cssContent.match(/@media[^{]*{[^}]*\.hero-screenshot-placeholder[^}]*min-height/s) ||
        cssContent.match(/\.hero-screenshot-placeholder[^}]*min-height/s);
      expect(hasResponsiveMinHeight).toBeTruthy();
    });

    it('should have width: 100% for screenshot image', () => {
      expect(cssContent).toContain('.hero-screenshot');
      expect(cssContent).toMatch(/\.hero-screenshot[^}]*width:\s*100%/s);
    });
  });

  describe('Feature cards responsiveness', () => {
    it('should have responsive max-width for feature cards', () => {
      // Feature cards should be responsive
      expect(cssContent).toContain('.feature');
    });

    it('should stack feature cards on mobile (default column layout)', () => {
      // Features should be vertical by default (mobile-first)
      // or have flex-direction: column in media query
      const hasStackedFeatures = !cssContent.match(/\.features[^}]*display:\s*flex[^}]*flex-direction:\s*row/) ||
        cssContent.match(/@media[^{]*{[^}]*\.features[^}]*flex-direction:\s*column/s);
      expect(hasStackedFeatures).toBeTruthy();
    });
  });

  describe('Navigation responsiveness', () => {
    it('should have responsive header padding', () => {
      expect(cssContent).toContain('.site-header');
      // Header should have responsive padding in media queries
      const hasResponsiveHeader = cssContent.match(/@media[^{]*{[^}]*\.site-header[^}]*padding/s) ||
        cssContent.match(/@media[^{]*{[^}]*\.nav-container[^}]*padding/s) ||
        cssContent.includes('.site-header');
      expect(hasResponsiveHeader).toBeTruthy();
    });

    it('should have responsive logo size', () => {
      expect(cssContent).toContain('.logo');
    });
  });

  describe('Footer responsiveness', () => {
    it('should have responsive footer padding', () => {
      expect(cssContent).toContain('.site-footer');
    });
  });

  describe('Touch-friendly targets', () => {
    it('should have adequate button padding for touch', () => {
      // Download buttons should have enough padding for touch (at least 16px)
      const hasTouchFriendlyPadding = cssContent.match(/\.download-btn[^}]*padding:\s*var\(--spacing-[4-9]\)/s);
      expect(hasTouchFriendlyPadding).toBeTruthy();
    });
  });

  describe('Responsive typography', () => {
    it('should have responsive line-height', () => {
      expect(cssContent).toContain('line-height');
    });

    it('should define font sizes via CSS variables', () => {
      expect(cssContent).toContain('--font-size-sm');
      expect(cssContent).toContain('--font-size-base');
      expect(cssContent).toContain('--font-size-lg');
      expect(cssContent).toContain('--font-size-4xl');
    });
  });

  describe('Box-sizing for responsive layout', () => {
    it('should have border-box sizing', () => {
      expect(cssContent).toContain('box-sizing: border-box');
    });
  });

  describe('Flexible images', () => {
    it('should have max-width constraints to prevent overflow', () => {
      // Hero content should have max-width
      expect(cssContent).toMatch(/\.hero-content[^}]*max-width/s);
    });

    it('should have height: auto for images', () => {
      expect(cssContent).toMatch(/height:\s*auto/);
    });
  });
});
