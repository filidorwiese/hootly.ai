/**
 * Theme Management Module
 *
 * Handles theme switching, system preference detection, and dynamic updates.
 * Works with CSS variables defined in styles.ts
 */

import { Storage } from './storage';
import type { Theme } from './styles';

/**
 * Get the effective theme based on setting and system preference
 * @param themeSetting - The user's theme preference ('light', 'dark', or 'auto')
 * @returns The actual theme to apply ('light' or 'dark')
 */
export const getEffectiveTheme = (themeSetting: Theme): 'light' | 'dark' => {
  if (themeSetting === 'auto') {
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default fallback
  }
  return themeSetting;
};

/**
 * Apply theme to document by setting data-theme attribute
 * For 'auto' mode, we use JS to detect system preference rather than
 * relying on CSS media queries (which can fail in iframes)
 * @param themeSetting - The theme setting ('light', 'dark', or 'auto')
 */
export const applyTheme = (themeSetting: Theme): void => {
  if (typeof document !== 'undefined') {
    // For auto mode, resolve to actual light/dark based on system preference
    // This is more reliable than CSS media queries, especially in iframes
    const effectiveTheme = getEffectiveTheme(themeSetting);
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }
};

/**
 * Initialize theme system
 * - Loads theme from storage
 * - Sets initial data-theme attribute
 * - Listens for system preference changes (for auto mode)
 * - Listens for storage changes (for dynamic theme switching)
 *
 * @returns Cleanup function to remove listeners
 */
export const initTheme = async (): Promise<() => void> => {
  // Load theme from storage
  const settings = await Storage.getSettings();
  const themeSetting = settings.theme || 'auto';

  // Apply initial theme
  applyTheme(themeSetting);

  // Create cleanup functions array
  const cleanupFns: (() => void)[] = [];

  // Listen for system preference changes (relevant when theme is 'auto')
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = () => {
      // Re-apply theme to trigger CSS variable updates
      // The CSS handles auto mode via @media query, but we need to ensure
      // the data-theme attribute stays as 'auto' for the CSS to work
      Storage.getSettings().then((s) => {
        if (s.theme === 'auto') {
          applyTheme('auto');
        }
      });
    };

    // Modern browsers use addEventListener, older use addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      cleanupFns.push(() => mediaQuery.removeEventListener('change', handleSystemChange));
    } else if (mediaQuery.addListener) {
      // Deprecated but needed for older browsers
      mediaQuery.addListener(handleSystemChange);
      cleanupFns.push(() => mediaQuery.removeListener(handleSystemChange));
    }
  }

  // Listen for storage changes (when user changes theme in settings)
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.settings) {
        const newSettings = changes.settings.newValue;
        if (newSettings?.theme) {
          applyTheme(newSettings.theme);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    cleanupFns.push(() => chrome.storage.onChanged.removeListener(handleStorageChange));
  }

  // Return cleanup function
  return () => {
    cleanupFns.forEach((fn) => fn());
  };
};
