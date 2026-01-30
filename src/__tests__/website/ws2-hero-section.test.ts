import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-2: Create HTML structure with hero section', () => {
  const websitePath = path.join(process.cwd(), 'website');
  const htmlPath = path.join(websitePath, 'index.html');
  const cssPath = path.join(websitePath, 'styles.css');

  let htmlContent: string;
  let cssContent: string;

  beforeAll(() => {
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('Semantic HTML5 structure', () => {
    it('has DOCTYPE declaration', () => {
      expect(htmlContent).toMatch(/^<!DOCTYPE html>/i);
    });

    it('has html element with lang attribute', () => {
      expect(htmlContent).toMatch(/<html\s+lang="en">/);
    });

    it('has header element', () => {
      expect(htmlContent).toMatch(/<header[^>]*class="site-header"[^>]*>/);
    });

    it('has nav element inside header', () => {
      expect(htmlContent).toMatch(/<nav[^>]*class="nav-container"[^>]*>/);
    });

    it('has main element', () => {
      expect(htmlContent).toMatch(/<main>/);
    });

    it('has section element for hero', () => {
      expect(htmlContent).toMatch(/<section[^>]*class="hero"[^>]*>/);
    });

    it('has footer element', () => {
      expect(htmlContent).toMatch(/<footer[^>]*class="site-footer"[^>]*>/);
    });
  });

  describe('Hero section content', () => {
    it('has h1 headline', () => {
      expect(htmlContent).toMatch(/<h1[^>]*>.*<\/h1>/s);
    });

    it('headline mentions AI and browser', () => {
      const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/s);
      expect(h1Match).not.toBeNull();
      const headlineText = h1Match![1].replace(/<br\s*\/?>/gi, ' ').toLowerCase();
      expect(headlineText).toMatch(/ai|assistant/);
      expect(headlineText).toMatch(/browser/);
    });

    it('has tagline paragraph', () => {
      expect(htmlContent).toMatch(/<p[^>]*class="hero-tagline"[^>]*>/);
    });

    it('tagline describes AI assistant functionality', () => {
      const taglineMatch = htmlContent.match(/<p[^>]*class="hero-tagline"[^>]*>(.*?)<\/p>/s);
      expect(taglineMatch).not.toBeNull();
      const taglineText = taglineMatch![1].toLowerCase();
      expect(taglineText).toMatch(/chat|ai|gpt|claude|gemini/);
    });

    it('has placeholder for screenshot hero image', () => {
      expect(htmlContent).toMatch(/<div[^>]*class="hero-screenshot-placeholder"[^>]*>/);
    });

    it('has img element for screenshot', () => {
      expect(htmlContent).toMatch(/<img[^>]*class="hero-screenshot"[^>]*>/);
    });

    it('img has alt text', () => {
      const imgMatch = htmlContent.match(/<img[^>]*class="hero-screenshot"[^>]*>/);
      expect(imgMatch).not.toBeNull();
      expect(imgMatch![0]).toMatch(/alt="[^"]+"/);
    });

    it('img src points to images folder', () => {
      const imgMatch = htmlContent.match(/<img[^>]*class="hero-screenshot"[^>]*>/);
      expect(imgMatch).not.toBeNull();
      expect(imgMatch![0]).toMatch(/src="images\/screenshot\.png"/);
    });

    it('has placeholder text for missing screenshot', () => {
      expect(htmlContent).toMatch(/<span[^>]*class="screenshot-placeholder-text"[^>]*>/);
    });
  });

  describe('Responsive viewport meta tag', () => {
    it('has viewport meta tag', () => {
      expect(htmlContent).toMatch(/<meta[^>]*name="viewport"[^>]*>/);
    });

    it('viewport includes width=device-width', () => {
      expect(htmlContent).toMatch(/content="[^"]*width=device-width[^"]*"/);
    });

    it('viewport includes initial-scale=1', () => {
      expect(htmlContent).toMatch(/content="[^"]*initial-scale=1[^"]*"/);
    });
  });

  describe('Accessibility', () => {
    it('hero section has aria-labelledby', () => {
      expect(htmlContent).toMatch(/<section[^>]*aria-labelledby="hero-heading"[^>]*>/);
    });

    it('h1 has matching id for aria-labelledby', () => {
      expect(htmlContent).toMatch(/<h1[^>]*id="hero-heading"[^>]*>/);
    });
  });

  describe('CSS hero styling', () => {
    it('has .hero class definition', () => {
      expect(cssContent).toMatch(/\.hero\s*\{/);
    });

    it('hero is centered (text-align: center)', () => {
      const heroMatch = cssContent.match(/\.hero\s*\{[^}]*\}/);
      expect(heroMatch).not.toBeNull();
      expect(heroMatch![0]).toMatch(/text-align:\s*center/);
    });

    it('has .hero-content class definition', () => {
      expect(cssContent).toMatch(/\.hero-content\s*\{/);
    });

    it('has .hero-tagline class definition', () => {
      expect(cssContent).toMatch(/\.hero-tagline\s*\{/);
    });

    it('has .hero-screenshot-placeholder class definition', () => {
      expect(cssContent).toMatch(/\.hero-screenshot-placeholder\s*\{/);
    });

    it('has .hero-screenshot class definition', () => {
      expect(cssContent).toMatch(/\.hero-screenshot\s*\{/);
    });
  });

  describe('Meta description', () => {
    it('has meta description tag', () => {
      expect(htmlContent).toMatch(/<meta[^>]*name="description"[^>]*>/);
    });

    it('meta description mentions AI assistant', () => {
      const metaMatch = htmlContent.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/);
      expect(metaMatch).not.toBeNull();
      const description = metaMatch![1].toLowerCase();
      expect(description).toMatch(/ai|assistant|browser/);
    });
  });
});
