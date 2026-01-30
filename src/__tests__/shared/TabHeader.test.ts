import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTabHeaderStyles,
  generateTabHeaderHTML,
  getTabUrl,
  initTabHeaderNav,
  injectTabHeader,
  createTabHeaderElement,
  TabId,
} from '../../shared/TabHeader';

// Mock chrome.runtime.getURL
const mockChrome = {
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
  },
};

(global as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;

describe('TabHeader (TAB-1)', () => {
  describe('getTabHeaderStyles', () => {
    it('returns CSS string with tab-header class', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-header');
    });

    it('includes styles for tab-header-brand', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-header-brand');
    });

    it('includes styles for tab-header-logo', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-header-logo');
    });

    it('includes styles for tab-header-title', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-header-title');
    });

    it('includes styles for tab-header-nav', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-header-nav');
    });

    it('includes styles for tab-btn', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-btn');
    });

    it('includes active state for tab-btn', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-btn.active');
    });

    it('includes hover state for tab-btn', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('.tab-btn:hover');
    });

    it('uses CSS custom properties for theming', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('var(--color-');
      expect(styles).toContain('var(--spacing-');
      expect(styles).toContain('var(--radius-');
      expect(styles).toContain('var(--font-size-');
    });
  });

  describe('generateTabHeaderHTML', () => {
    it('generates HTML with tab-header container', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-header"');
    });

    it('includes Hootly.ai brand title', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('Hootly.ai');
    });

    it('includes tab-header-brand section', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-header-brand"');
    });

    it('includes tab-header-logo with SVG', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-header-logo"');
      expect(html).toContain('<svg');
    });

    it('includes tab-header-nav section', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-header-nav"');
    });

    it('includes all three tab buttons', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('data-tab="settings"');
      expect(html).toContain('data-tab="personas"');
      expect(html).toContain('data-tab="history"');
    });

    it('marks settings tab as active when activeTab is settings', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-btn active" data-tab="settings"');
      expect(html).not.toContain('class="tab-btn active" data-tab="personas"');
      expect(html).not.toContain('class="tab-btn active" data-tab="history"');
    });

    it('marks personas tab as active when activeTab is personas', () => {
      const html = generateTabHeaderHTML('personas');
      expect(html).toContain('class="tab-btn active" data-tab="personas"');
      expect(html).not.toContain('class="tab-btn active" data-tab="settings"');
      expect(html).not.toContain('class="tab-btn active" data-tab="history"');
    });

    it('marks history tab as active when activeTab is history', () => {
      const html = generateTabHeaderHTML('history');
      expect(html).toContain('class="tab-btn active" data-tab="history"');
      expect(html).not.toContain('class="tab-btn active" data-tab="settings"');
      expect(html).not.toContain('class="tab-btn active" data-tab="personas"');
    });

    it('includes i18n data attributes for tabs', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('data-i18n="tabs.settings"');
      expect(html).toContain('data-i18n="tabs.personas"');
      expect(html).toContain('data-i18n="tabs.history"');
    });

    it('includes SVG icons for each tab', () => {
      const html = generateTabHeaderHTML('settings');
      const svgCount = (html.match(/<svg/g) || []).length;
      // 1 logo + 3 tab icons = 4 SVGs
      expect(svgCount).toBe(4);
    });
  });

  describe('getTabUrl', () => {
    it('returns correct URL for settings tab', () => {
      const url = getTabUrl('settings');
      expect(url).toBe('chrome-extension://test-id/settings.html');
    });

    it('returns correct URL for personas tab', () => {
      const url = getTabUrl('personas');
      expect(url).toBe('chrome-extension://test-id/personas.html');
    });

    it('returns correct URL for history tab', () => {
      const url = getTabUrl('history');
      expect(url).toBe('chrome-extension://test-id/history.html');
    });

    it('calls chrome.runtime.getURL with correct path', () => {
      mockChrome.runtime.getURL.mockClear();
      getTabUrl('settings');
      expect(mockChrome.runtime.getURL).toHaveBeenCalledWith('settings.html');
    });
  });

  describe('initTabHeaderNav', () => {
    beforeEach(() => {
      document.body.innerHTML = generateTabHeaderHTML('settings');
    });

    it('adds click listeners to tab buttons', () => {
      const addEventListenerSpy = vi.spyOn(HTMLButtonElement.prototype, 'addEventListener');
      initTabHeaderNav('settings');

      const tabBtns = document.querySelectorAll('.tab-btn');
      expect(tabBtns.length).toBe(3);
      expect(addEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('does not navigate when clicking active tab', () => {
      initTabHeaderNav('settings');
      const originalLocation = window.location.href;

      const settingsBtn = document.querySelector('[data-tab="settings"]') as HTMLElement;
      settingsBtn.click();

      // Location should not change for active tab
      expect(window.location.href).toBe(originalLocation);
    });
  });

  describe('injectTabHeader', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
      document.body.innerHTML = '<div id="container"><p>Content</p></div>';
    });

    it('adds styles to document head', () => {
      injectTabHeader({ activeTab: 'settings' });
      const styleEl = document.getElementById('tab-header-styles');
      expect(styleEl).not.toBeNull();
      expect(styleEl?.textContent).toContain('.tab-header');
    });

    it('does not duplicate styles on multiple calls', () => {
      injectTabHeader({ activeTab: 'settings' });
      injectTabHeader({ activeTab: 'personas' });

      const styleEls = document.querySelectorAll('#tab-header-styles');
      expect(styleEls.length).toBe(1);
    });

    it('injects header at start of body by default', () => {
      injectTabHeader({ activeTab: 'settings' });

      const firstChild = document.body.firstElementChild;
      expect(firstChild?.classList.contains('tab-header')).toBe(true);
    });

    it('injects header at start of specified container', () => {
      injectTabHeader({ activeTab: 'personas', containerId: 'container' });

      const container = document.getElementById('container');
      const firstChild = container?.firstElementChild;
      expect(firstChild?.classList.contains('tab-header')).toBe(true);
    });

    it('replaces existing header on re-injection', () => {
      injectTabHeader({ activeTab: 'settings' });
      injectTabHeader({ activeTab: 'personas' });

      const headers = document.querySelectorAll('.tab-header');
      expect(headers.length).toBe(1);

      const activeTab = document.querySelector('.tab-btn.active');
      expect(activeTab?.getAttribute('data-tab')).toBe('personas');
    });

    it('sets correct active tab', () => {
      injectTabHeader({ activeTab: 'history' });

      const activeTab = document.querySelector('.tab-btn.active');
      expect(activeTab?.getAttribute('data-tab')).toBe('history');
    });
  });

  describe('createTabHeaderElement', () => {
    it('returns HTMLElement', () => {
      const element = createTabHeaderElement('settings');
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('returns element with tab-header class', () => {
      const element = createTabHeaderElement('settings');
      expect(element.classList.contains('tab-header')).toBe(true);
    });

    it('contains all tab buttons', () => {
      const element = createTabHeaderElement('settings');
      const buttons = element.querySelectorAll('.tab-btn');
      expect(buttons.length).toBe(3);
    });

    it('marks correct tab as active', () => {
      const element = createTabHeaderElement('personas');
      const activeBtn = element.querySelector('.tab-btn.active');
      expect(activeBtn?.getAttribute('data-tab')).toBe('personas');
    });
  });

  describe('Logo SVG', () => {
    it('includes owl logo with multiple colors', () => {
      const html = generateTabHeaderHTML('settings');
      // Check for multiple fill colors in logo (not monochrome)
      expect(html).toContain('fill="#4A7C54"'); // Primary green
      expect(html).toContain('fill="#E8F0EA"'); // Light green
      expect(html).toContain('fill="#2D3A30"'); // Dark green
      expect(html).toContain('fill="#A3C4AC"'); // Medium green
    });
  });

  describe('Tab icons', () => {
    it('settings tab has gear icon', () => {
      const html = generateTabHeaderHTML('settings');
      // Settings icon should have path that looks like a gear
      const settingsSection = html.split('data-tab="settings"')[1].split('data-tab="personas"')[0];
      expect(settingsSection).toContain('<svg');
    });

    it('personas tab has user icon', () => {
      const html = generateTabHeaderHTML('settings');
      const personasSection = html.split('data-tab="personas"')[1].split('data-tab="history"')[0];
      expect(personasSection).toContain('<svg');
    });

    it('history tab has clock icon', () => {
      const html = generateTabHeaderHTML('settings');
      const historySection = html.split('data-tab="history"')[1];
      expect(historySection).toContain('<svg');
    });
  });

  describe('i18n translations', () => {
    it('all tabs have i18n keys', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('data-i18n="tabs.settings"');
      expect(html).toContain('data-i18n="tabs.personas"');
      expect(html).toContain('data-i18n="tabs.history"');
    });
  });

  describe('Flat design compliance', () => {
    it('styles do not include box-shadow', () => {
      const styles = getTabHeaderStyles();
      expect(styles).not.toContain('box-shadow');
    });

    it('styles do not include gradient', () => {
      const styles = getTabHeaderStyles();
      expect(styles).not.toContain('linear-gradient');
      expect(styles).not.toContain('radial-gradient');
    });

    it('uses solid border for active tab', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('border-color');
    });
  });

  describe('Forest theme colors', () => {
    it('styles reference forest theme primary colors', () => {
      const styles = getTabHeaderStyles();
      expect(styles).toContain('--color-primary-50');
      expect(styles).toContain('--color-primary-500');
    });

    it('logo uses forest green colors', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('#4A7C54'); // Forest green (primary-400)
      expect(html).toContain('#2D3A30'); // Darker green for eyes/details
      expect(html).toContain('#A3C4AC'); // Light green (primary-200)
    });
  });
});
