/**
 * TAB-5: Update manage personas link to open tab
 * Tests verify that the "Manage Personas" link in settings navigates to the Personas tab
 * instead of opening a new page in a new tab.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source files
const settingsTsPath = path.join(__dirname, '../../settings/settings.ts');
const settingsHtmlPath = path.join(__dirname, '../../settings/index.html');
const tabHeaderPath = path.join(__dirname, '../../shared/TabHeader.ts');

let settingsTs: string;
let settingsHtml: string;
let tabHeaderTs: string;

beforeEach(() => {
  settingsTs = fs.readFileSync(settingsTsPath, 'utf-8');
  settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf-8');
  tabHeaderTs = fs.readFileSync(tabHeaderPath, 'utf-8');
});

describe('TAB-5: Update manage personas link to open tab', () => {
  describe('Import getTabUrl from TabHeader', () => {
    it('imports getTabUrl from TabHeader module', () => {
      expect(settingsTs).toMatch(/import.*getTabUrl.*from.*TabHeader/);
    });

    it('imports both injectTabHeader and getTabUrl', () => {
      const importMatch = settingsTs.match(/import\s*\{[^}]+\}\s*from\s*['"].*TabHeader['"]/);
      expect(importMatch).toBeTruthy();
      expect(importMatch![0]).toContain('injectTabHeader');
      expect(importMatch![0]).toContain('getTabUrl');
    });
  });

  describe('Manage Personas link navigation behavior', () => {
    it('uses window.location.href instead of chrome.tabs.create', () => {
      // Should use window.location.href for same-tab navigation
      expect(settingsTs).toMatch(/window\.location\.href\s*=\s*getTabUrl\s*\(\s*['"]personas['"]\s*\)/);
    });

    it('does NOT use chrome.tabs.create for personas link', () => {
      // The old approach used chrome.tabs.create
      // After TAB-5, this should not be used for the manage personas link
      const managePersonasSection = settingsTs.match(/managePersonasLink[\s\S]*?(\}[\s\S]*?\})/);
      if (managePersonasSection) {
        expect(managePersonasSection[0]).not.toContain('chrome.tabs.create');
      }
    });

    it('still prevents default link behavior', () => {
      expect(settingsTs).toMatch(/managePersonasLink[\s\S]*?preventDefault/);
    });

    it('navigates to personas tab on click', () => {
      // Verify the click handler uses getTabUrl('personas')
      expect(settingsTs).toMatch(/getTabUrl\s*\(\s*['"]personas['"]\s*\)/);
    });
  });

  describe('Link element in HTML', () => {
    it('manage personas link exists in HTML', () => {
      expect(settingsHtml).toMatch(/id="managePersonasLink"/);
    });

    it('link has href="#" for proper link semantics', () => {
      expect(settingsHtml).toMatch(/<a[^>]*href="#"[^>]*id="managePersonasLink"/);
    });

    it('link has manage-personas-link class', () => {
      expect(settingsHtml).toMatch(/class="manage-personas-link"/);
    });

    it('link has i18n translation key', () => {
      expect(settingsHtml).toMatch(/data-i18n="settings\.managePersonas"/);
    });

    it('link has persona SVG icon', () => {
      const linkSection = settingsHtml.match(/<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/);
      expect(linkSection).toBeTruthy();
      expect(linkSection![0]).toContain('<svg');
    });
  });

  describe('TabHeader getTabUrl function', () => {
    it('getTabUrl is exported from TabHeader', () => {
      expect(tabHeaderTs).toMatch(/export\s+function\s+getTabUrl/);
    });

    it('getTabUrl handles personas tab', () => {
      expect(tabHeaderTs).toMatch(/personas.*personas\.html|personas\.html.*personas/);
    });

    it('getTabUrl uses chrome.runtime.getURL', () => {
      expect(tabHeaderTs).toMatch(/chrome\.runtime\.getURL/);
    });
  });

  describe('Navigation consistency with TabHeader', () => {
    it('uses same navigation mechanism as tab buttons', () => {
      // Tab buttons use window.location.href = getTabUrl(tabId)
      expect(tabHeaderTs).toMatch(/window\.location\.href\s*=\s*getTabUrl/);
      // Manage personas link should also use window.location.href = getTabUrl
      expect(settingsTs).toMatch(/window\.location\.href\s*=\s*getTabUrl/);
    });

    it('link navigates to same URL as Personas tab button', () => {
      // Both should go to personas.html
      expect(settingsTs).toMatch(/getTabUrl\s*\(\s*['"]personas['"]\s*\)/);
      expect(tabHeaderTs).toMatch(/personas.*personas\.html/);
    });
  });

  describe('Active tab state after navigation', () => {
    it('Personas tab will be active after navigation', () => {
      // When user navigates to personas page, it calls injectTabHeader with activeTab: 'personas'
      // This is verified by checking personas.ts integration (already done in TAB-3)
      // Here we just verify the URL goes to personas.html which will show personas as active
      expect(settingsTs).toMatch(/getTabUrl\s*\(\s*['"]personas['"]\s*\)/);
    });
  });

  describe('Comment/documentation update', () => {
    it('comment reflects new navigation behavior', () => {
      // Comment should indicate tab navigation, not opening new page
      expect(settingsTs).toMatch(/Manage Personas link.*tab|navigates.*Personas tab/i);
    });

    it('does NOT mention opening new page/tab', () => {
      const commentSection = settingsTs.match(/\/\/.*Manage Personas.*/);
      if (commentSection) {
        expect(commentSection[0]).not.toMatch(/new page|new tab|opens.*page/i);
      }
    });
  });
});

describe('Backward compatibility', () => {
  it('other settings functionality unaffected', () => {
    // Provider select still works
    expect(settingsTs).toMatch(/providerSelect/);
    // API key inputs still work
    expect(settingsTs).toMatch(/claudeApiKeyInput/);
    expect(settingsTs).toMatch(/openaiApiKeyInput/);
    // Model select still works
    expect(settingsTs).toMatch(/modelSelect/);
    // Save button still works
    expect(settingsTs).toMatch(/saveBtn/);
    // Default persona select still works
    expect(settingsTs).toMatch(/defaultPersonaSelect/);
  });

  it('TabHeader injection still works', () => {
    expect(settingsTs).toMatch(/injectTabHeader\s*\(\s*\{[^}]*activeTab\s*:\s*['"]settings['"]/);
  });

  it('language switching still works', () => {
    expect(settingsTs).toMatch(/languageSelect/);
    expect(settingsTs).toMatch(/setLanguage/);
  });
});

describe('User experience', () => {
  it('link is positioned below default persona dropdown', () => {
    // Link should come after the defaultPersona select and its hint
    const defaultPersonaSection = settingsHtml.indexOf('id="defaultPersona"');
    const linkSection = settingsHtml.indexOf('id="managePersonasLink"');
    expect(linkSection).toBeGreaterThan(defaultPersonaSection);
  });

  it('link has visual icon for recognition', () => {
    const linkMatch = settingsHtml.match(/<a[^>]*id="managePersonasLink"[^>]*>[\s\S]*?<\/a>/);
    expect(linkMatch).toBeTruthy();
    // SVG icon with user/persona theme
    expect(linkMatch![0]).toMatch(/<svg[^>]*>[\s\S]*?<\/svg>/);
  });

  it('link has hover styling', () => {
    expect(settingsHtml).toMatch(/\.manage-personas-link:hover/);
  });
});
