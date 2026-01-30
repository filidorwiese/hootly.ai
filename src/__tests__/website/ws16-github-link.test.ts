/**
 * WS-16: Add GitHub logo to header
 *
 * Requirements:
 * - Add GitHub logo icon to top-right of header
 * - Link to https://github.com/filidorwiese/hootly.ai
 * - Open link in new tab
 * - Style consistent with header design
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-16: GitHub Logo in Header', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeAll(() => {
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    const cssPath = path.join(process.cwd(), 'website', 'styles.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('HTML Structure', () => {
    it('has GitHub link in header nav-container', () => {
      expect(htmlContent).toMatch(/<nav class="nav-container">[^]*github-link[^]*<\/nav>/i);
    });

    it('links to correct GitHub repository', () => {
      expect(htmlContent).toContain('href="https://github.com/filidorwiese/hootly.ai"');
    });

    it('opens in new tab', () => {
      expect(htmlContent).toMatch(/class="github-link"[^>]*target="_blank"/);
    });

    it('has noopener noreferrer for security', () => {
      expect(htmlContent).toMatch(/class="github-link"[^>]*rel="noopener noreferrer"/);
    });

    it('has accessible title attribute', () => {
      expect(htmlContent).toMatch(/class="github-link"[^>]*title="[^"]+"/);
    });

    it('contains SVG GitHub icon', () => {
      expect(htmlContent).toMatch(/class="github-link"[^>]*>[^]*<svg[^>]*class="github-icon"/);
    });
  });

  describe('CSS Styling', () => {
    it('has github-link styles defined', () => {
      expect(cssContent).toMatch(/\.github-link\s*\{/);
    });

    it('has github-icon styles defined', () => {
      expect(cssContent).toMatch(/\.github-icon\s*\{/);
    });

    it('has hover state for github-link', () => {
      expect(cssContent).toMatch(/\.github-link:hover/);
    });
  });
});
