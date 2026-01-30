import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-3: Add download buttons for browsers', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeAll(() => {
    const websitePath = path.join(process.cwd(), 'website');
    htmlContent = fs.readFileSync(path.join(websitePath, 'index.html'), 'utf-8');
    cssContent = fs.readFileSync(path.join(websitePath, 'styles.css'), 'utf-8');
  });

  describe('HTML structure', () => {
    it('should have download-buttons container in hero section', () => {
      expect(htmlContent).toContain('class="download-buttons"');
      expect(htmlContent).toContain('<section class="hero"');
    });

    it('should have Firefox download button', () => {
      expect(htmlContent).toContain('class="download-btn download-btn-firefox"');
    });

    it('should have Chrome download button', () => {
      expect(htmlContent).toContain('class="download-btn download-btn-chrome"');
    });

    it('should link Firefox button to Mozilla addon store', () => {
      expect(htmlContent).toMatch(/href="https:\/\/addons\.mozilla\.org\/.*hootly/);
    });

    it('should link Chrome button to Chrome Web Store', () => {
      expect(htmlContent).toMatch(/href="https:\/\/chrome\.google\.com\/webstore\/.*hootly/);
    });

    it('should have target="_blank" for external links', () => {
      const firefoxMatch = htmlContent.match(/download-btn-firefox[^>]*target="_blank"/);
      const chromeMatch = htmlContent.match(/download-btn-chrome[^>]*target="_blank"/);
      expect(firefoxMatch || htmlContent.includes('download-btn-firefox" target="_blank"')).toBeTruthy();
      expect(chromeMatch || htmlContent.includes('download-btn-chrome" target="_blank"')).toBeTruthy();
    });

    it('should have rel="noopener noreferrer" for security', () => {
      expect(htmlContent).toMatch(/download-btn.*rel="noopener noreferrer"/);
    });
  });

  describe('Browser icons', () => {
    it('should have browser icon SVG for Firefox', () => {
      const firefoxSection = htmlContent.match(/download-btn-firefox[\s\S]*?<\/a>/);
      expect(firefoxSection?.[0]).toContain('<svg');
      expect(firefoxSection?.[0]).toContain('class="browser-icon"');
    });

    it('should have browser icon SVG for Chrome', () => {
      const chromeSection = htmlContent.match(/download-btn-chrome[\s\S]*?<\/a>/);
      expect(chromeSection?.[0]).toContain('<svg');
      expect(chromeSection?.[0]).toContain('class="browser-icon"');
    });

    it('should have aria-hidden on SVG icons for accessibility', () => {
      expect(htmlContent).toMatch(/browser-icon.*aria-hidden="true"/);
    });
  });

  describe('Button text', () => {
    it('should have "Download for" label', () => {
      expect(htmlContent).toContain('class="download-label"');
      expect(htmlContent).toContain('Download for');
    });

    it('should have browser name text', () => {
      expect(htmlContent).toContain('class="download-browser"');
      expect(htmlContent).toContain('>Firefox<');
      expect(htmlContent).toContain('>Chrome<');
    });

    it('should have download-text container for text layout', () => {
      expect(htmlContent).toContain('class="download-text"');
    });
  });

  describe('CSS styling', () => {
    it('should have download-buttons flex container', () => {
      expect(cssContent).toContain('.download-buttons');
      expect(cssContent).toMatch(/\.download-buttons[\s\S]*?display:\s*flex/);
    });

    it('should have gap between buttons', () => {
      expect(cssContent).toMatch(/\.download-buttons[\s\S]*?gap:/);
    });

    it('should have justify-content center for buttons', () => {
      expect(cssContent).toMatch(/\.download-buttons[\s\S]*?justify-content:\s*center/);
    });

    it('should have flex-wrap for responsive layout', () => {
      expect(cssContent).toMatch(/\.download-buttons[\s\S]*?flex-wrap:\s*wrap/);
    });

    it('should have base download-btn styles', () => {
      expect(cssContent).toContain('.download-btn {');
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?display:\s*inline-flex/);
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?align-items:\s*center/);
    });

    it('should have padding on buttons', () => {
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?padding:/);
    });

    it('should have border-radius on buttons', () => {
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?border-radius:/);
    });

    it('should have Firefox button primary color', () => {
      expect(cssContent).toContain('.download-btn-firefox');
      expect(cssContent).toMatch(/\.download-btn-firefox[\s\S]*?background-color:/);
    });

    it('should have Chrome button secondary styling', () => {
      expect(cssContent).toContain('.download-btn-chrome');
      expect(cssContent).toMatch(/\.download-btn-chrome[\s\S]*?background-color:/);
      expect(cssContent).toMatch(/\.download-btn-chrome[\s\S]*?border-color:/);
    });

    it('should have hover states for Firefox button', () => {
      expect(cssContent).toContain('.download-btn-firefox:hover');
    });

    it('should have hover states for Chrome button', () => {
      expect(cssContent).toContain('.download-btn-chrome:hover');
    });

    it('should have browser-icon sizing', () => {
      expect(cssContent).toContain('.browser-icon');
      expect(cssContent).toMatch(/\.browser-icon[\s\S]*?width:/);
      expect(cssContent).toMatch(/\.browser-icon[\s\S]*?height:/);
    });

    it('should have download-text flex layout', () => {
      expect(cssContent).toContain('.download-text');
      expect(cssContent).toMatch(/\.download-text[\s\S]*?display:\s*flex/);
      expect(cssContent).toMatch(/\.download-text[\s\S]*?flex-direction:\s*column/);
    });

    it('should have download-label smaller font', () => {
      expect(cssContent).toContain('.download-label');
      expect(cssContent).toMatch(/\.download-label[\s\S]*?font-size:/);
    });

    it('should have download-browser larger/bold font', () => {
      expect(cssContent).toContain('.download-browser');
      expect(cssContent).toMatch(/\.download-browser[\s\S]*?font-weight:/);
    });

    it('should have transition for smooth hover effects', () => {
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?transition:/);
    });
  });

  describe('Flat design compliance', () => {
    it('should not have box-shadow on download buttons', () => {
      const downloadBtnCSS = cssContent.match(/\.download-btn[\s\S]*?\}/)?.[0] || '';
      expect(downloadBtnCSS).not.toMatch(/box-shadow/);
    });

    it('should not have gradients on download buttons', () => {
      const firefoxCSS = cssContent.match(/\.download-btn-firefox[\s\S]*?\}/)?.[0] || '';
      const chromeCSS = cssContent.match(/\.download-btn-chrome[\s\S]*?\}/)?.[0] || '';
      expect(firefoxCSS).not.toMatch(/linear-gradient|radial-gradient/);
      expect(chromeCSS).not.toMatch(/linear-gradient|radial-gradient/);
    });

    it('should use solid border colors', () => {
      expect(cssContent).toMatch(/\.download-btn[\s\S]*?border:/);
    });
  });

  describe('Accessibility', () => {
    it('should have distinct visual styling for each browser', () => {
      expect(cssContent).toContain('.download-btn-firefox');
      expect(cssContent).toContain('.download-btn-chrome');
      const firefoxBg = cssContent.match(/\.download-btn-firefox[\s\S]*?background-color:\s*([^;]+)/)?.[1];
      const chromeBg = cssContent.match(/\.download-btn-chrome[\s\S]*?background-color:\s*([^;]+)/)?.[1];
      expect(firefoxBg).not.toEqual(chromeBg);
    });

    it('should have visible text labels for buttons', () => {
      expect(htmlContent).toContain('Firefox');
      expect(htmlContent).toContain('Chrome');
    });
  });

  describe('Button prominence', () => {
    it('should position buttons between tagline and screenshot', () => {
      const taglineIndex = htmlContent.indexOf('hero-tagline');
      const buttonsIndex = htmlContent.indexOf('download-buttons');
      const screenshotIndex = htmlContent.indexOf('hero-screenshot-placeholder');

      expect(taglineIndex).toBeLessThan(buttonsIndex);
      expect(buttonsIndex).toBeLessThan(screenshotIndex);
    });

    it('should have margin-bottom on buttons container', () => {
      expect(cssContent).toMatch(/\.download-buttons[\s\S]*?margin-bottom:/);
    });
  });
});
