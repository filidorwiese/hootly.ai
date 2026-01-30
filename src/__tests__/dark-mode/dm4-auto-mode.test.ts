/**
 * DM-4: Implement auto mode with system preference
 *
 * Tests for theme management module:
 * - Uses prefers-color-scheme media query
 * - Listens for system preference changes
 * - Applies appropriate theme when in auto mode
 * - Updates theme dynamically without reload
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getEffectiveTheme,
  applyTheme,
  initTheme,
  systemPrefersDark,
  getCurrentTheme,
  setTheme,
} from '../../shared/theme';
import { Storage } from '../../shared/storage';

// Mock Storage
vi.mock('../../shared/storage', () => ({
  Storage: {
    getSettings: vi.fn(),
    saveSettings: vi.fn(),
  },
}));

describe('DM-4: Auto mode with system preference', () => {
  let mockMediaQuery: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    addListener?: ReturnType<typeof vi.fn>;
    removeListener?: ReturnType<typeof vi.fn>;
  };
  let originalMatchMedia: typeof window.matchMedia;
  let storageChangeListeners: ((changes: Record<string, unknown>, areaName: string) => void)[];

  beforeEach(() => {
    // Reset document
    document.documentElement.removeAttribute('data-theme');

    // Mock matchMedia
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

    // Mock chrome.storage.onChanged
    storageChangeListeners = [];
    (globalThis as unknown as { chrome: typeof chrome }).chrome = {
      ...chrome,
      storage: {
        ...chrome.storage,
        onChanged: {
          addListener: vi.fn((fn) => storageChangeListeners.push(fn)),
          removeListener: vi.fn((fn) => {
            const idx = storageChangeListeners.indexOf(fn);
            if (idx > -1) storageChangeListeners.splice(idx, 1);
          }),
        },
      },
    } as typeof chrome;

    // Default storage mock
    (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'auto' });
    (Storage.saveSettings as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe('getEffectiveTheme', () => {
    it('should return "light" for light theme setting', () => {
      expect(getEffectiveTheme('light')).toBe('light');
    });

    it('should return "dark" for dark theme setting', () => {
      expect(getEffectiveTheme('dark')).toBe('dark');
    });

    it('should return "light" for auto when system prefers light', () => {
      mockMediaQuery.matches = false;
      expect(getEffectiveTheme('auto')).toBe('light');
    });

    it('should return "dark" for auto when system prefers dark', () => {
      mockMediaQuery.matches = true;
      expect(getEffectiveTheme('auto')).toBe('dark');
    });

    it('should use prefers-color-scheme media query', () => {
      getEffectiveTheme('auto');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute to light', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should set data-theme attribute to dark', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should set data-theme attribute to auto', () => {
      applyTheme('auto');
      expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
    });
  });

  describe('initTheme', () => {
    it('should load theme from storage on init', async () => {
      await initTheme();
      expect(Storage.getSettings).toHaveBeenCalled();
    });

    it('should apply theme from storage', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'dark' });
      await initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should default to auto if theme not in storage', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({});
      await initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
    });

    it('should listen for system preference changes', async () => {
      await initTheme();
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should listen for storage changes', async () => {
      await initTheme();
      expect(chrome.storage.onChanged.addListener).toHaveBeenCalled();
    });

    it('should return cleanup function', async () => {
      const cleanup = await initTheme();
      expect(typeof cleanup).toBe('function');
    });

    it('should remove listeners on cleanup', async () => {
      const cleanup = await initTheme();
      cleanup();
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
    });
  });

  describe('System preference changes', () => {
    it('should update theme when system preference changes', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'auto' });
      await initTheme();

      // Get the change handler
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      // Simulate system preference change
      mockMediaQuery.matches = true;
      changeHandler({ matches: true });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Theme should stay as 'auto' (CSS handles the actual color switch)
      expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
    });

    it('should not update when theme is not auto', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await initTheme();

      // Get the change handler
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      // Simulate system preference change
      changeHandler({ matches: true });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Theme should remain 'light'
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Storage changes (dynamic update without reload)', () => {
    it('should update theme when storage changes', async () => {
      await initTheme();

      // Simulate storage change
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { theme: 'dark' },
          },
        },
        'local'
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update theme from light to dark', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Simulate storage change
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { theme: 'dark' },
          },
        },
        'local'
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update theme from dark to light', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'dark' });
      await initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // Simulate storage change
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { theme: 'light' },
          },
        },
        'local'
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update theme from explicit to auto', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'dark' });
      await initTheme();

      // Simulate storage change
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { theme: 'auto' },
          },
        },
        'local'
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
    });

    it('should ignore non-local storage changes', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await initTheme();

      // Simulate sync storage change (should be ignored)
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { theme: 'dark' },
          },
        },
        'sync'
      );

      // Should still be light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should ignore changes without theme', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await initTheme();

      // Simulate storage change without theme
      const listener = storageChangeListeners[0];
      listener(
        {
          settings: {
            newValue: { apiKey: 'new-key' },
          },
        },
        'local'
      );

      // Should still be light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('systemPrefersDark', () => {
    it('should return false when system prefers light', () => {
      mockMediaQuery.matches = false;
      expect(systemPrefersDark()).toBe(false);
    });

    it('should return true when system prefers dark', () => {
      mockMediaQuery.matches = true;
      expect(systemPrefersDark()).toBe(true);
    });
  });

  describe('getCurrentTheme', () => {
    it('should return theme from storage', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'dark' });
      const theme = await getCurrentTheme();
      expect(theme).toBe('dark');
    });

    it('should default to auto if not set', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({});
      const theme = await getCurrentTheme();
      expect(theme).toBe('auto');
    });
  });

  describe('setTheme', () => {
    it('should save theme to storage', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await setTheme('dark');
      expect(Storage.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    });

    it('should apply theme immediately', async () => {
      (Storage.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue({ theme: 'light' });
      await setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('CSS integration', () => {
    it('should work with data-theme="light" attribute', () => {
      applyTheme('light');
      // CSS [data-theme="light"] selector should match
      expect(document.documentElement.matches('[data-theme="light"]')).toBe(true);
    });

    it('should work with data-theme="dark" attribute', () => {
      applyTheme('dark');
      // CSS [data-theme="dark"] selector should match
      expect(document.documentElement.matches('[data-theme="dark"]')).toBe(true);
    });

    it('should work with data-theme="auto" attribute', () => {
      applyTheme('auto');
      // CSS [data-theme="auto"] selector should match (for media query)
      expect(document.documentElement.matches('[data-theme="auto"]')).toBe(true);
    });
  });

  describe('Legacy browser support', () => {
    it('should use addListener if addEventListener not available', async () => {
      // Create a legacy mock (no addEventListener)
      const legacyMediaQuery = {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      window.matchMedia = vi.fn().mockReturnValue(legacyMediaQuery);

      const cleanup = await initTheme();
      expect(legacyMediaQuery.addListener).toHaveBeenCalled();

      cleanup();
      expect(legacyMediaQuery.removeListener).toHaveBeenCalled();
    });
  });
});
