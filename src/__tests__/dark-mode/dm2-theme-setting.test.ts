import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings, DEFAULT_SETTINGS } from '../../shared/types';
import { Theme } from '../../shared/styles';

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
};
vi.stubGlobal('chrome', mockChrome);

describe('DM-2: Add theme setting to storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  describe('Settings type', () => {
    it('includes theme field', () => {
      const settings: Settings = DEFAULT_SETTINGS;
      expect(settings).toHaveProperty('theme');
    });

    it('theme accepts "light" value', () => {
      const settings: Settings = { ...DEFAULT_SETTINGS, theme: 'light' };
      expect(settings.theme).toBe('light');
    });

    it('theme accepts "dark" value', () => {
      const settings: Settings = { ...DEFAULT_SETTINGS, theme: 'dark' };
      expect(settings.theme).toBe('dark');
    });

    it('theme accepts "auto" value', () => {
      const settings: Settings = { ...DEFAULT_SETTINGS, theme: 'auto' };
      expect(settings.theme).toBe('auto');
    });

    it('theme type matches Theme from styles.ts', () => {
      // Verify the types are compatible
      const themeFromSettings: Settings['theme'] = 'auto';
      const themeFromStyles: Theme = themeFromSettings;
      expect(themeFromStyles).toBe('auto');
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('defaults theme to "auto"', () => {
      expect(DEFAULT_SETTINGS.theme).toBe('auto');
    });

    it('auto means system preference detection', () => {
      // Auto should match CSS prefers-color-scheme behavior
      expect(DEFAULT_SETTINGS.theme).not.toBe('light');
      expect(DEFAULT_SETTINGS.theme).not.toBe('dark');
    });
  });

  describe('Storage wrapper', () => {
    it('getSettings returns theme from storage', async () => {
      const { Storage } = await import('../../shared/storage');

      mockStorage['hootly_settings'] = { theme: 'dark' };
      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('dark');
    });

    it('getSettings defaults to "auto" when no theme saved', async () => {
      const { Storage } = await import('../../shared/storage');

      mockStorage['hootly_settings'] = {};
      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('auto');
    });

    it('saveSettings persists theme value', async () => {
      const { Storage } = await import('../../shared/storage');

      await Storage.saveSettings({ theme: 'dark' });
      expect(mockChrome.storage.local.set).toHaveBeenCalled();

      const savedSettings = mockStorage['hootly_settings'] as Settings;
      expect(savedSettings.theme).toBe('dark');
    });

    it('saveSettings preserves theme when updating other settings', async () => {
      const { Storage } = await import('../../shared/storage');

      mockStorage['hootly_settings'] = { theme: 'light' };
      await Storage.saveSettings({ language: 'de' });

      const savedSettings = mockStorage['hootly_settings'] as Settings;
      expect(savedSettings.theme).toBe('light');
      expect(savedSettings.language).toBe('de');
    });

    it('theme persists across getSettings/saveSettings cycles', async () => {
      const { Storage } = await import('../../shared/storage');

      // Save dark theme
      await Storage.saveSettings({ theme: 'dark' });

      // Get settings and verify theme
      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('dark');

      // Save another setting
      await Storage.saveSettings({ fontSize: 16 });

      // Theme should still be dark
      const finalSettings = await Storage.getSettings();
      expect(finalSettings.theme).toBe('dark');
    });
  });

  describe('Theme values validation', () => {
    it('all three theme values are distinct', () => {
      const themes: Theme[] = ['light', 'dark', 'auto'];
      const uniqueThemes = new Set(themes);
      expect(uniqueThemes.size).toBe(3);
    });

    it('theme values are lowercase strings', () => {
      const themes: Theme[] = ['light', 'dark', 'auto'];
      themes.forEach((theme) => {
        expect(theme).toBe(theme.toLowerCase());
        expect(typeof theme).toBe('string');
      });
    });

    it('light and dark are explicit choices', () => {
      expect('light').not.toBe('auto');
      expect('dark').not.toBe('auto');
    });

    it('auto is the system preference option', () => {
      // Auto indicates "follow system preference"
      const systemPreferenceOption: Theme = 'auto';
      expect(systemPreferenceOption).toBe('auto');
    });
  });

  describe('Integration with existing settings', () => {
    it('theme coexists with other appearance settings', () => {
      const settings: Settings = DEFAULT_SETTINGS;
      expect(settings).toHaveProperty('theme');
      expect(settings).toHaveProperty('fontSize');
    });

    it('theme is independent of language setting', () => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        theme: 'dark',
        language: 'de',
      };
      expect(settings.theme).toBe('dark');
      expect(settings.language).toBe('de');
    });

    it('changing theme does not affect other settings', async () => {
      const { Storage } = await import('../../shared/storage');

      mockStorage['hootly_settings'] = {
        ...DEFAULT_SETTINGS,
        fontSize: 16,
        language: 'nl',
      };

      await Storage.saveSettings({ theme: 'light' });

      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('light');
      expect(settings.fontSize).toBe(16);
      expect(settings.language).toBe('nl');
    });
  });

  describe('Migration from old settings', () => {
    it('handles missing theme field gracefully', async () => {
      const { Storage } = await import('../../shared/storage');

      // Simulate old settings without theme
      mockStorage['hootly_settings'] = {
        provider: 'claude',
        claudeApiKey: 'test-key',
      };

      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('auto');
    });

    it('preserves existing theme when present', async () => {
      const { Storage } = await import('../../shared/storage');

      mockStorage['hootly_settings'] = {
        theme: 'dark',
        provider: 'claude',
      };

      const settings = await Storage.getSettings();
      expect(settings.theme).toBe('dark');
    });
  });
});
