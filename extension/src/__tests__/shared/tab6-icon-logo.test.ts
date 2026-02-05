/**
 * TAB-6: Use icon.svg as logo in TabHeader
 * Tests that the TabHeader uses the extension's icon.svg instead of inline SVG
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTabHeaderStyles,
  generateTabHeaderHTML,
  injectTabHeader,
} from '../../shared/TabHeader';

// Mock chrome.runtime.getURL
const mockGetURL = vi.fn((path: string) => `chrome-extension://mock-id/${path}`);
vi.stubGlobal('chrome', {
  runtime: {
    getURL: mockGetURL,
  },
});

describe('TAB-6: Use icon.svg as logo in TabHeader', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    mockGetURL.mockClear();
  });

  describe('Logo HTML structure', () => {
    it('should use img element for logo instead of inline SVG', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('<img');
      expect(html).toContain('tab-header-logo-img');
    });

    it('should reference icon.svg via chrome.runtime.getURL', () => {
      generateTabHeaderHTML('settings');
      expect(mockGetURL).toHaveBeenCalledWith('icons/icon.svg');
    });

    it('should set appropriate src attribute for logo image', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('src="chrome-extension://mock-id/icons/icon.svg"');
    });

    it('should include alt text for accessibility', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toMatch(/alt=["']Hootly\.ai[^"']*["']/i);
    });

    it('should NOT contain inline owl SVG in logo', () => {
      injectTabHeader({ activeTab: 'settings' });
      const logoContainer = document.querySelector('.tab-header-logo');
      // Logo should contain img, not svg
      expect(logoContainer?.querySelector('img')).toBeTruthy();
      expect(logoContainer?.querySelector('svg')).toBeNull();
    });
  });

  describe('Logo CSS styling', () => {
    it('should include CSS for logo image sizing', () => {
      const css = getTabHeaderStyles();
      expect(css).toContain('.tab-header-logo-img');
    });

    it('should set appropriate width for logo image', () => {
      const css = getTabHeaderStyles();
      // Logo should be appropriately sized for header (32px matches the old SVG)
      expect(css).toMatch(/\.tab-header-logo-img[^}]*width:\s*32px/);
    });

    it('should set appropriate height for logo image', () => {
      const css = getTabHeaderStyles();
      expect(css).toMatch(/\.tab-header-logo-img[^}]*height:\s*32px/);
    });

    it('should have object-fit contain for proper scaling', () => {
      const css = getTabHeaderStyles();
      expect(css).toMatch(/\.tab-header-logo-img[^}]*object-fit:\s*contain/);
    });
  });

  describe('Integration with injectTabHeader', () => {
    it('should inject logo image into settings page', () => {
      injectTabHeader({ activeTab: 'settings' });
      const logoImg = document.querySelector('.tab-header-logo-img') as HTMLImageElement;
      expect(logoImg).toBeTruthy();
      expect(logoImg.tagName).toBe('IMG');
    });

    it('should inject logo image into personas page', () => {
      injectTabHeader({ activeTab: 'personas' });
      const logoImg = document.querySelector('.tab-header-logo-img') as HTMLImageElement;
      expect(logoImg).toBeTruthy();
    });

    it('should inject logo image into history page', () => {
      injectTabHeader({ activeTab: 'history' });
      const logoImg = document.querySelector('.tab-header-logo-img') as HTMLImageElement;
      expect(logoImg).toBeTruthy();
    });

    it('should have correct src on injected logo', () => {
      injectTabHeader({ activeTab: 'settings' });
      const logoImg = document.querySelector('.tab-header-logo-img') as HTMLImageElement;
      expect(logoImg.src).toBe('chrome-extension://mock-id/icons/icon.svg');
    });
  });

  describe('Logo container structure', () => {
    it('should keep tab-header-logo container', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('tab-header-logo');
    });

    it('should have logo image inside brand section', () => {
      injectTabHeader({ activeTab: 'settings' });
      const brand = document.querySelector('.tab-header-brand');
      const logoImg = brand?.querySelector('.tab-header-logo-img');
      expect(logoImg).toBeTruthy();
    });

    it('should keep title next to logo', () => {
      injectTabHeader({ activeTab: 'settings' });
      const brand = document.querySelector('.tab-header-brand');
      const title = brand?.querySelector('.tab-header-title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Hootly.ai');
    });
  });

  describe('Display across all pages', () => {
    const tabs: Array<'settings' | 'personas' | 'history'> = ['settings', 'personas', 'history'];

    tabs.forEach((tab) => {
      it(`should display logo correctly on ${tab} page`, () => {
        document.body.innerHTML = '';
        injectTabHeader({ activeTab: tab });
        const logoImg = document.querySelector('.tab-header-logo-img') as HTMLImageElement;
        expect(logoImg).toBeTruthy();
        expect(logoImg.src).toContain('icons/icon.svg');
      });
    });
  });
});
