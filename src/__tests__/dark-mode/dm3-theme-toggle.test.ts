import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings, DEFAULT_SETTINGS } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock chrome.storage.local
const mockStorage: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: mockStorage[key] })),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(() => Promise.resolve({ success: true, models: [] })),
  },
};
vi.stubGlobal('chrome', mockChrome);

describe('DM-3: Add theme toggle to settings page', () => {
  let settingsHtml: string;
  let settingsTs: string;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

    // Read the actual files
    settingsHtml = fs.readFileSync(
      path.join(__dirname, '../../settings/index.html'),
      'utf-8'
    );
    settingsTs = fs.readFileSync(
      path.join(__dirname, '../../settings/settings.ts'),
      'utf-8'
    );
  });

  describe('HTML structure', () => {
    it('has Theme section in settings page', () => {
      expect(settingsHtml).toContain('data-i18n="settings.theme"');
    });

    it('has three theme radio buttons', () => {
      expect(settingsHtml).toContain('id="themeLight"');
      expect(settingsHtml).toContain('id="themeDark"');
      expect(settingsHtml).toContain('id="themeAuto"');
    });

    it('radio buttons share same name attribute', () => {
      expect(settingsHtml).toContain('name="theme"');
      // All three should use the same name for mutual exclusivity
      const matches = settingsHtml.match(/name="theme"/g);
      expect(matches?.length).toBe(3);
    });

    it('has correct values for each radio button', () => {
      expect(settingsHtml).toContain('value="light"');
      expect(settingsHtml).toContain('value="dark"');
      expect(settingsHtml).toContain('value="auto"');
    });

    it('has Light option with i18n key', () => {
      expect(settingsHtml).toContain('data-i18n="settings.themeLight"');
    });

    it('has Dark option with i18n key', () => {
      expect(settingsHtml).toContain('data-i18n="settings.themeDark"');
    });

    it('has Auto option with i18n key', () => {
      expect(settingsHtml).toContain('data-i18n="settings.themeAuto"');
    });

    it('has hint text with i18n key', () => {
      expect(settingsHtml).toContain('data-i18n="settings.themeHint"');
    });

    it('theme-options container wraps radio buttons', () => {
      expect(settingsHtml).toContain('class="theme-options"');
    });

    it('radio-label class is used for styling', () => {
      expect(settingsHtml).toContain('class="radio-label"');
    });
  });

  describe('CSS styling', () => {
    it('has theme-options flex container', () => {
      expect(settingsHtml).toContain('.theme-options');
      expect(settingsHtml).toContain('display: flex');
    });

    it('theme options have proper gap', () => {
      expect(settingsHtml).toContain('gap: var(--spacing-4)');
    });

    it('radio-label has flex alignment', () => {
      expect(settingsHtml).toContain('.radio-label');
      expect(settingsHtml).toContain('align-items: center');
    });

    it('radio inputs use accent-color for theming', () => {
      expect(settingsHtml).toContain('accent-color: var(--color-accent-success)');
    });
  });

  describe('TypeScript implementation', () => {
    it('gets theme radio button references', () => {
      expect(settingsTs).toContain("getElementById('themeLight')");
      expect(settingsTs).toContain("getElementById('themeDark')");
      expect(settingsTs).toContain("getElementById('themeAuto')");
    });

    it('casts radio buttons as HTMLInputElement', () => {
      expect(settingsTs).toContain('as HTMLInputElement');
    });

    it('sets initial theme from settings', () => {
      expect(settingsTs).toContain('settings.theme');
      expect(settingsTs).toContain('themeLightRadio.checked');
      expect(settingsTs).toContain('themeDarkRadio.checked');
      expect(settingsTs).toContain('themeAutoRadio.checked');
    });

    it('has getSelectedTheme helper function', () => {
      expect(settingsTs).toContain('getSelectedTheme');
      expect(settingsTs).toContain("return 'light'");
      expect(settingsTs).toContain("return 'dark'");
      expect(settingsTs).toContain("return 'auto'");
    });

    it('includes theme in saveSettings call', () => {
      expect(settingsTs).toContain('theme: getSelectedTheme()');
    });
  });

  describe('i18n translations', () => {
    const i18nFiles = [
      'en.json', 'nl.json', 'de.json', 'fr.json', 'es.json',
      'it.json', 'pt.json', 'zh.json', 'ja.json', 'ko.json'
    ];

    i18nFiles.forEach((file) => {
      describe(`${file}`, () => {
        let translations: Record<string, Record<string, string>>;

        beforeEach(() => {
          const content = fs.readFileSync(
            path.join(__dirname, `../../shared/i18n/${file}`),
            'utf-8'
          );
          translations = JSON.parse(content);
        });

        it('has theme key', () => {
          expect(translations.settings.theme).toBeDefined();
          expect(translations.settings.theme.length).toBeGreaterThan(0);
        });

        it('has themeLight key', () => {
          expect(translations.settings.themeLight).toBeDefined();
          expect(translations.settings.themeLight.length).toBeGreaterThan(0);
        });

        it('has themeDark key', () => {
          expect(translations.settings.themeDark).toBeDefined();
          expect(translations.settings.themeDark.length).toBeGreaterThan(0);
        });

        it('has themeAuto key', () => {
          expect(translations.settings.themeAuto).toBeDefined();
          expect(translations.settings.themeAuto.length).toBeGreaterThan(0);
        });

        it('has themeHint key', () => {
          expect(translations.settings.themeHint).toBeDefined();
          expect(translations.settings.themeHint.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Theme selection behavior', () => {
    it('default theme is auto in DEFAULT_SETTINGS', () => {
      expect(DEFAULT_SETTINGS.theme).toBe('auto');
    });

    it('theme setting is properly typed', () => {
      const lightSettings: Settings = { ...DEFAULT_SETTINGS, theme: 'light' };
      const darkSettings: Settings = { ...DEFAULT_SETTINGS, theme: 'dark' };
      const autoSettings: Settings = { ...DEFAULT_SETTINGS, theme: 'auto' };

      expect(lightSettings.theme).toBe('light');
      expect(darkSettings.theme).toBe('dark');
      expect(autoSettings.theme).toBe('auto');
    });

    it('can save and retrieve theme from storage', async () => {
      const { Storage } = await import('../../shared/storage');

      await Storage.saveSettings({ theme: 'dark' });
      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('dark');
    });
  });

  describe('Radio button mutual exclusivity', () => {
    it('radio buttons with same name are mutually exclusive', () => {
      // Check that all three radio buttons share the same name
      const nameMatches = settingsHtml.match(/name="theme"/g);
      expect(nameMatches?.length).toBe(3);
    });

    it('only one theme can be selected at a time via HTML structure', () => {
      // Verify radio inputs are of type radio (not checkbox)
      expect(settingsHtml).toContain('type="radio"');
      const radioMatches = settingsHtml.match(/type="radio"/g);
      expect(radioMatches?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Settings page integration', () => {
    it('theme section positioned after language setting', () => {
      const languageIndex = settingsHtml.indexOf('id="language"');
      const themeIndex = settingsHtml.indexOf('id="themeLight"');
      expect(themeIndex).toBeGreaterThan(languageIndex);
    });

    it('theme section before default persona setting', () => {
      const themeIndex = settingsHtml.indexOf('id="themeLight"');
      const personaIndex = settingsHtml.indexOf('id="defaultPersona"');
      expect(themeIndex).toBeLessThan(personaIndex);
    });
  });
});
