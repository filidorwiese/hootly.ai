/**
 * WS-19: Add multilingual USP section
 *
 * Requirements:
 * - Add feature section for multilingual support
 * - Highlight 10 languages supported
 * - List languages: EN, NL, DE, FR, ES, IT, PT, ZH, JA, KO
 * - Add relevant icon or illustration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WS-19: Multilingual USP Section', () => {
  let htmlContent: string;

  beforeAll(() => {
    const htmlPath = path.join(process.cwd(), 'website', 'index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  });

  describe('HTML Structure', () => {
    it('has multilingual feature section with id', () => {
      expect(htmlContent).toMatch(/<div[^>]*class="feature"[^>]*id="multilingual"/);
    });

    it('has feature-icon container with SVG', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?<div[^>]*class="feature-icon"[\s\S]*?<svg/);
    });

    it('has h2 heading mentioning languages', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?<h2>[^<]*[Ll]anguage/);
    });

    it('highlights 10 languages in heading', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?<h2>[^<]*10[^<]*[Ll]anguage/);
    });
  });

  describe('Language List', () => {
    it('mentions English', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?English/);
    });

    it('mentions Chinese', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?Chinese/);
    });

    it('mentions Japanese', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?Japanese/);
    });

    it('mentions Korean', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?Korean/);
    });
  });

  describe('Icon', () => {
    it('has SVG icon with globe-related elements', () => {
      // Icon should represent languages/globe
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?<svg[\s\S]*?<circle/);
    });

    it('uses forest theme colors in icon', () => {
      expect(htmlContent).toMatch(/id="multilingual"[\s\S]*?fill="#3A5A40"/);
    });
  });
});
