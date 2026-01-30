import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-1: Create website folder structure', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  const websiteDir = path.join(projectRoot, 'website');

  describe('Folder structure', () => {
    it('should have /website folder in project root', () => {
      expect(fs.existsSync(websiteDir)).toBe(true);
      expect(fs.statSync(websiteDir).isDirectory()).toBe(true);
    });

    it('should have index.html file', () => {
      const indexPath = path.join(websiteDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
      expect(fs.statSync(indexPath).isFile()).toBe(true);
    });

    it('should have styles.css file', () => {
      const stylesPath = path.join(websiteDir, 'styles.css');
      expect(fs.existsSync(stylesPath)).toBe(true);
      expect(fs.statSync(stylesPath).isFile()).toBe(true);
    });

    it('should have /website/images folder for assets', () => {
      const imagesDir = path.join(websiteDir, 'images');
      expect(fs.existsSync(imagesDir)).toBe(true);
      expect(fs.statSync(imagesDir).isDirectory()).toBe(true);
    });
  });

  describe('index.html structure', () => {
    let htmlContent: string;

    beforeAll(() => {
      htmlContent = fs.readFileSync(path.join(websiteDir, 'index.html'), 'utf-8');
    });

    it('should be valid HTML5 document', () => {
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
    });

    it('should have charset meta tag', () => {
      expect(htmlContent).toContain('charset="UTF-8"');
    });

    it('should have viewport meta tag for responsiveness', () => {
      expect(htmlContent).toContain('viewport');
      expect(htmlContent).toContain('width=device-width');
    });

    it('should link to styles.css', () => {
      expect(htmlContent).toContain('href="styles.css"');
    });

    it('should have a title', () => {
      expect(htmlContent).toMatch(/<title>.*Hootly.*<\/title>/);
    });
  });

  describe('styles.css structure', () => {
    let cssContent: string;

    beforeAll(() => {
      cssContent = fs.readFileSync(path.join(websiteDir, 'styles.css'), 'utf-8');
    });

    it('should contain CSS content', () => {
      expect(cssContent.length).toBeGreaterThan(0);
    });

    it('should define CSS custom properties (design system)', () => {
      expect(cssContent).toContain(':root');
      expect(cssContent).toContain('--color');
    });

    it('should use Inter font family', () => {
      expect(cssContent).toContain('Inter');
    });

    it('should have flat design (no actual shadows)', () => {
      // Allow box-shadow: none (reset) but not actual shadow values
      expect(cssContent).not.toMatch(/box-shadow:\s*\d+px/);
      expect(cssContent).not.toMatch(/box-shadow:\s*rgba/);
    });

    it('should have flat design (no gradient)', () => {
      expect(cssContent).not.toContain('linear-gradient');
      expect(cssContent).not.toContain('radial-gradient');
    });
  });
});
