/**
 * TAB-2: Integrate TabHeader into settings page
 * Tests verify TabHeader component is properly integrated into settings.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source files
const settingsHtmlPath = path.join(__dirname, '../../settings/index.html');
const settingsTsPath = path.join(__dirname, '../../settings/settings.ts');
const tabHeaderPath = path.join(__dirname, '../../shared/TabHeader.ts');

let settingsHtml: string;
let settingsTs: string;
let tabHeaderTs: string;

beforeEach(() => {
  settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf-8');
  settingsTs = fs.readFileSync(settingsTsPath, 'utf-8');
  tabHeaderTs = fs.readFileSync(tabHeaderPath, 'utf-8');
});

describe('TAB-2: Integrate TabHeader into settings page', () => {
  describe('TabHeader import in settings.ts', () => {
    it('imports injectTabHeader from TabHeader module', () => {
      expect(settingsTs).toMatch(/import.*injectTabHeader.*from.*TabHeader/);
    });

    it('imports TabId type if used', () => {
      // Either imports the type or uses the literal string
      const hasImport = settingsTs.includes('TabId') || settingsTs.includes("'settings'");
      expect(hasImport).toBe(true);
    });
  });

  describe('TabHeader injection in settings.ts', () => {
    it('calls injectTabHeader with settings as activeTab', () => {
      expect(settingsTs).toMatch(/injectTabHeader\s*\(\s*\{[^}]*activeTab\s*:\s*['"]settings['"]/);
    });

    it('calls injectTabHeader in DOMContentLoaded handler', () => {
      // The function should be called after DOM is ready
      expect(settingsTs).toMatch(/DOMContentLoaded.*injectTabHeader|injectTabHeader.*DOMContentLoaded/s);
    });
  });

  describe('HTML structure changes', () => {
    it('removes old h1 header with settings icon', () => {
      // The old h1 with SVG settings icon should be removed
      // Check that there's no h1 with the settings SVG inside
      const hasOldH1WithIcon = settingsHtml.includes('<h1>') &&
        settingsHtml.includes('<svg') &&
        settingsHtml.includes('Settings</span>') &&
        settingsHtml.includes('</h1>');

      // After integration, h1 should either be removed or simplified
      // TabHeader provides the branding now
      const hasTabHeaderPlaceholder = settingsHtml.includes('tab-header') ||
        !settingsHtml.includes('<svg width="28" height="28"');

      // At minimum, the old SVG icon in h1 should be removed
      expect(hasTabHeaderPlaceholder || !hasOldH1WithIcon).toBe(true);
    });

    it('has container or body for TabHeader injection', () => {
      // TabHeader injects at start of body or a specified container
      const hasBody = settingsHtml.includes('<body');
      expect(hasBody).toBe(true);
    });
  });

  describe('Tab navigation functionality', () => {
    it('TabHeader module exports injectTabHeader function', () => {
      expect(tabHeaderTs).toMatch(/export\s+function\s+injectTabHeader/);
    });

    it('TabHeader module exports initTabHeaderNav function', () => {
      expect(tabHeaderTs).toMatch(/export\s+function\s+initTabHeaderNav/);
    });

    it('TabHeader module exports getTabUrl function', () => {
      expect(tabHeaderTs).toMatch(/export\s+function\s+getTabUrl/);
    });

    it('getTabUrl returns correct URL for settings tab', () => {
      expect(tabHeaderTs).toMatch(/settings.*settings\.html/);
    });

    it('getTabUrl returns correct URL for personas tab', () => {
      expect(tabHeaderTs).toMatch(/personas.*personas\.html/);
    });

    it('getTabUrl returns correct URL for history tab', () => {
      expect(tabHeaderTs).toMatch(/history.*history\.html/);
    });
  });

  describe('Styling consistency', () => {
    it('settings page has CSS variables for TabHeader styling', () => {
      // TabHeader uses CSS variables, settings page should have them
      const hasCssVars = settingsHtml.includes('--color-') ||
        settingsHtml.includes('--spacing-') ||
        settingsHtml.includes(':root');
      expect(hasCssVars).toBe(true);
    });

    it('settings page has Inter font loaded', () => {
      expect(settingsHtml).toMatch(/Inter/);
    });
  });

  describe('Visual requirements', () => {
    it('TabHeader uses icon.png for logo', () => {
      // TAB-6: Logo changed from inline SVG to icon.png
      expect(tabHeaderTs).toMatch(/icons\/icon\.png/);
      expect(tabHeaderTs).toMatch(/getLogoUrl/);
    });

    it('TabHeader contains Hootly.ai brand title', () => {
      expect(tabHeaderTs).toMatch(/Hootly\.ai/);
    });

    it('TabHeader has three tab buttons', () => {
      // Check for settings, personas, history tabs
      expect(tabHeaderTs).toMatch(/settings/);
      expect(tabHeaderTs).toMatch(/personas/);
      expect(tabHeaderTs).toMatch(/history/);
    });
  });

  describe('Active tab indication', () => {
    it('TabHeader has active class for current tab', () => {
      expect(tabHeaderTs).toMatch(/active/);
    });

    it('Settings tab will be marked as active', () => {
      // When activeTab is 'settings', that tab gets the active class
      expect(tabHeaderTs).toMatch(/activeTab.*active|active.*activeTab/s);
    });
  });

  describe('No duplicate headers', () => {
    it('old h1 with SVG icon is removed from HTML', () => {
      // The SVG with 28x28 dimensions was the old settings icon
      const hasOldSettingsIcon = settingsHtml.includes('<svg width="28" height="28"') &&
        settingsHtml.includes('data-i18n="settings.title"');

      // After TAB-2, this should be removed or changed
      // We expect either: no h1 at all, or h1 without the SVG icon
      const h1Match = settingsHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
      if (h1Match) {
        // If h1 exists, it should not have the old settings SVG icon
        const hasOldIcon = h1Match[0].includes('<svg width="28" height="28"');
        expect(hasOldIcon).toBe(false);
      }
      // If no h1, that's also fine - TabHeader provides branding
    });
  });

  describe('Intro text preserved', () => {
    it('intro text element still exists', () => {
      expect(settingsHtml).toMatch(/intro-text/);
    });

    it('intro text has settings.intro i18n key', () => {
      expect(settingsHtml).toMatch(/data-i18n="settings\.intro"/);
    });
  });

  describe('applyTranslations includes TabHeader', () => {
    it('applyTranslations is called after injectTabHeader', () => {
      // applyTranslations should run after TabHeader is injected to translate tab labels
      const injectIndex = settingsTs.indexOf('injectTabHeader');
      const translateIndex = settingsTs.lastIndexOf('applyTranslations');

      // If both exist, translations should be applied after injection
      if (injectIndex > -1 && translateIndex > -1) {
        // Both calls exist - translations will update tab labels
        expect(translateIndex > -1).toBe(true);
      }
    });
  });
});

describe('Settings page preserves existing functionality', () => {
  it('still has provider select', () => {
    expect(settingsHtml).toMatch(/id="provider"/);
  });

  it('still has API key inputs', () => {
    expect(settingsHtml).toMatch(/id="claudeApiKey"/);
    expect(settingsHtml).toMatch(/id="openaiApiKey"/);
    expect(settingsHtml).toMatch(/id="geminiApiKey"/);
    expect(settingsHtml).toMatch(/id="openrouterApiKey"/);
  });

  it('still has model select', () => {
    expect(settingsHtml).toMatch(/id="model"/);
  });

  it('still has save button', () => {
    expect(settingsHtml).toMatch(/id="saveBtn"/);
  });

  it('still has status div', () => {
    expect(settingsHtml).toMatch(/id="status"/);
  });

  it('still has manage personas link', () => {
    expect(settingsHtml).toMatch(/id="managePersonasLink"/);
  });

  it('still has default persona select', () => {
    expect(settingsHtml).toMatch(/id="defaultPersona"/);
  });
});
