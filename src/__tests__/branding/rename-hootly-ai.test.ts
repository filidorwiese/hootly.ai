/**
 * Tests for RENAME-1 through RENAME-7: Rename Hootly to Hootly.ai
 * Verifies all user-visible text shows "Hootly.ai" instead of just "Hootly"
 */

import * as fs from 'fs';
import * as path from 'path';

describe('RENAME-1: Extension manifest branding', () => {
  let firefoxManifest: any;
  let chromeManifest: any;

  beforeAll(() => {
    const firefoxPath = path.join(process.cwd(), 'manifest.firefox.json');
    const chromePath = path.join(process.cwd(), 'manifest.chrome.json');
    firefoxManifest = JSON.parse(fs.readFileSync(firefoxPath, 'utf-8'));
    chromeManifest = JSON.parse(fs.readFileSync(chromePath, 'utf-8'));
  });

  it('Firefox manifest name is Hootly.ai', () => {
    expect(firefoxManifest.name).toBe('Hootly.ai');
  });

  it('Chrome manifest name is Hootly.ai', () => {
    expect(chromeManifest.name).toBe('Hootly.ai');
  });

  it('Firefox action title includes Hootly.ai', () => {
    expect(firefoxManifest.action.default_title).toContain('Hootly.ai');
  });

  it('Chrome action title includes Hootly.ai', () => {
    expect(chromeManifest.action.default_title).toContain('Hootly.ai');
  });

  it('Firefox command description includes Hootly.ai', () => {
    expect(firefoxManifest.commands['toggle-dialog'].description).toContain('Hootly.ai');
  });

  it('Chrome command description includes Hootly.ai', () => {
    expect(chromeManifest.commands['toggle-dialog'].description).toContain('Hootly.ai');
  });
});

describe('RENAME-2: Settings page branding', () => {
  let settingsHtml: string;

  beforeAll(() => {
    const settingsPath = path.join(process.cwd(), 'src/settings/index.html');
    settingsHtml = fs.readFileSync(settingsPath, 'utf-8');
  });

  it('page title contains Hootly.ai', () => {
    expect(settingsHtml).toMatch(/<title>.*Hootly\.ai.*<\/title>/);
  });

  it('does not contain standalone "Hootly" in title', () => {
    const titleMatch = settingsHtml.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).toBeTruthy();
    if (titleMatch) {
      // Should not have "Hootly" without ".ai" following it
      expect(titleMatch[1]).not.toMatch(/Hootly(?!\.ai)/);
    }
  });
});

describe('RENAME-3: Personas page branding', () => {
  let personasHtml: string;

  beforeAll(() => {
    const personasPath = path.join(process.cwd(), 'src/personas/index.html');
    personasHtml = fs.readFileSync(personasPath, 'utf-8');
  });

  it('page title contains Hootly.ai', () => {
    expect(personasHtml).toMatch(/<title>.*Hootly\.ai.*<\/title>/);
  });

  it('does not contain standalone "Hootly" in title', () => {
    const titleMatch = personasHtml.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).toBeTruthy();
    if (titleMatch) {
      expect(titleMatch[1]).not.toMatch(/Hootly(?!\.ai)/);
    }
  });
});

describe('RENAME-4: History page branding', () => {
  let historyHtml: string;

  beforeAll(() => {
    const historyPath = path.join(process.cwd(), 'src/history/index.html');
    historyHtml = fs.readFileSync(historyPath, 'utf-8');
  });

  it('page title contains Hootly.ai', () => {
    expect(historyHtml).toMatch(/<title>.*Hootly\.ai.*<\/title>/);
  });

  it('does not contain standalone "Hootly" in title', () => {
    const titleMatch = historyHtml.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).toBeTruthy();
    if (titleMatch) {
      expect(titleMatch[1]).not.toMatch(/Hootly(?!\.ai)/);
    }
  });
});

describe('RENAME-5: Dialog component branding', () => {
  let dialogTsx: string;

  beforeAll(() => {
    const dialogPath = path.join(process.cwd(), 'src/content/components/Dialog.tsx');
    dialogTsx = fs.readFileSync(dialogPath, 'utf-8');
  });

  it('header shows Hootly.ai', () => {
    // Look for Hootly.ai in the component
    expect(dialogTsx).toContain('Hootly.ai');
  });

  it('does not show standalone Hootly in visible text', () => {
    // Find the header text line and verify it says Hootly.ai
    const headerLines = dialogTsx.split('\n').filter(line =>
      line.includes('Hootly') && !line.includes('//') && !line.includes('console.')
    );

    headerLines.forEach(line => {
      // Skip lines that are just imports or variable names
      if (!line.includes('import') && !line.includes('const ')) {
        // If it contains Hootly, it should be Hootly.ai
        if (line.match(/['"].*Hootly.*['"]/)) {
          expect(line).toMatch(/Hootly\.ai/);
        }
      }
    });
  });
});

describe('RENAME-6: i18n translations branding', () => {
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

  languages.forEach(lang => {
    it(`${lang}.json appName is Hootly.ai`, () => {
      const i18nPath = path.join(process.cwd(), `src/shared/i18n/${lang}.json`);
      const translations = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
      expect(translations.appName).toBe('Hootly.ai');
    });
  });
});

describe('RENAME-7: Website branding', () => {
  let websiteHtml: string;

  beforeAll(() => {
    const websitePath = path.join(process.cwd(), 'website/index.html');
    websiteHtml = fs.readFileSync(websitePath, 'utf-8');
  });

  it('page title contains Hootly.ai', () => {
    expect(websiteHtml).toMatch(/<title>.*Hootly\.ai.*<\/title>/);
  });

  it('logo text is Hootly.ai', () => {
    expect(websiteHtml).toMatch(/class="logo"[^>]*>Hootly\.ai</);
  });

  it('meta description contains Hootly.ai', () => {
    expect(websiteHtml).toMatch(/<meta name="description"[^>]*Hootly\.ai/);
  });

  it('image alt text contains Hootly.ai', () => {
    expect(websiteHtml).toMatch(/alt="[^"]*Hootly\.ai[^"]*"/);
  });

  it('does not contain standalone "Hootly" (without .ai)', () => {
    // Get all Hootly mentions, excluding comments
    const lines = websiteHtml.split('\n').filter(line =>
      line.includes('Hootly') && !line.includes('<!--')
    );

    lines.forEach(line => {
      // Each line containing Hootly should have Hootly.ai
      const hootlyMatches = line.match(/Hootly(?!\.ai)/g);
      expect(hootlyMatches).toBeNull();
    });
  });
});

describe('RENAME: Popup page branding', () => {
  let popupHtml: string;

  beforeAll(() => {
    const popupPath = path.join(process.cwd(), 'src/popup/index.html');
    popupHtml = fs.readFileSync(popupPath, 'utf-8');
  });

  it('page title contains Hootly.ai', () => {
    expect(popupHtml).toMatch(/<title>.*Hootly\.ai.*<\/title>/);
  });

  it('header shows Hootly.ai', () => {
    // Look for the header-title with Hootly.ai
    expect(popupHtml).toContain('Hootly.ai');
  });
});

describe('RENAME: Consistency checks', () => {
  it('all user-visible brand names are Hootly.ai', () => {
    const filesToCheck = [
      'manifest.firefox.json',
      'manifest.chrome.json',
      'src/settings/index.html',
      'src/personas/index.html',
      'src/history/index.html',
      'src/popup/index.html',
      'website/index.html',
    ];

    filesToCheck.forEach(file => {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip comments and console.log statements
        if (line.includes('//') || line.includes('console.') || line.includes('<!--')) {
          return;
        }

        // If line contains "Hootly" in a user-visible context, verify it's "Hootly.ai"
        if (line.match(/"[^"]*Hootly[^"]*"/) || line.match(/>Hootly</)) {
          const standaloneHootly = line.match(/Hootly(?!\.ai)/);
          if (standaloneHootly) {
            // Allow for cases like "hootly-" (IDs/classes)
            const isIdOrClass = line.match(/["'].*hootly-.*["']/i) || line.match(/id=.*hootly/i);
            if (!isIdOrClass) {
              expect(line).toContain('Hootly.ai');
            }
          }
        }
      });
    });
  });
});
