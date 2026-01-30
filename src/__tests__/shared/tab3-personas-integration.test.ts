/**
 * TAB-3: Integrate TabHeader into personas page
 * Tests verify TabHeader component is properly integrated into personas.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source files
const personasHtmlPath = path.join(__dirname, '../../personas/index.html');
const personasTsPath = path.join(__dirname, '../../personas/personas.ts');
const tabHeaderPath = path.join(__dirname, '../../shared/TabHeader.ts');

let personasHtml: string;
let personasTs: string;
let tabHeaderTs: string;

beforeEach(() => {
  personasHtml = fs.readFileSync(personasHtmlPath, 'utf-8');
  personasTs = fs.readFileSync(personasTsPath, 'utf-8');
  tabHeaderTs = fs.readFileSync(tabHeaderPath, 'utf-8');
});

describe('TAB-3: Integrate TabHeader into personas page', () => {
  describe('TabHeader import in personas.ts', () => {
    it('imports injectTabHeader from TabHeader module', () => {
      expect(personasTs).toMatch(/import.*injectTabHeader.*from.*TabHeader/);
    });
  });

  describe('TabHeader injection in personas.ts', () => {
    it('calls injectTabHeader with personas as activeTab', () => {
      expect(personasTs).toMatch(/injectTabHeader\s*\(\s*\{[^}]*activeTab\s*:\s*['"]personas['"]/);
    });

    it('calls injectTabHeader in init function', () => {
      // The function should be called after language is initialized
      expect(personasTs).toMatch(/async\s+function\s+init.*injectTabHeader/s);
    });
  });

  describe('HTML structure changes', () => {
    it('removes old header element', () => {
      // Old header with h1 containing img logo should be removed
      const hasOldHeader = personasHtml.includes('<header>') &&
        personasHtml.includes('<h1>') &&
        personasHtml.includes('id="logo"');
      expect(hasOldHeader).toBe(false);
    });

    it('removes back button/link', () => {
      // Close/back button should be removed per PRD
      expect(personasHtml).not.toMatch(/id="backBtn"/);
      expect(personasHtml).not.toMatch(/class="back-link"/);
    });

    it('has personas-content container', () => {
      expect(personasHtml).toMatch(/class="personas-content"/);
    });

    it('has page-header with title and add button', () => {
      expect(personasHtml).toMatch(/class="page-header"/);
    });

    it('has body for TabHeader injection', () => {
      expect(personasHtml).toMatch(/<body/);
    });
  });

  describe('CSS changes', () => {
    it('removes header-actions CSS', () => {
      expect(personasHtml).not.toMatch(/\.header-actions\s*\{/);
    });

    it('removes back-link CSS', () => {
      expect(personasHtml).not.toMatch(/\.back-link\s*\{/);
    });

    it('has personas-content CSS', () => {
      expect(personasHtml).toMatch(/\.personas-content\s*\{/);
    });

    it('has page-header CSS', () => {
      expect(personasHtml).toMatch(/\.page-header\s*\{/);
    });

    it('has page-title CSS', () => {
      expect(personasHtml).toMatch(/\.page-title\s*\{/);
    });
  });

  describe('Tab navigation functionality', () => {
    it('injectTabHeader initializes navigation handlers', () => {
      expect(tabHeaderTs).toMatch(/initTabHeaderNav/);
    });

    it('clicking non-active tab navigates to that page', () => {
      expect(tabHeaderTs).toMatch(/window\.location\.href\s*=\s*getTabUrl/);
    });
  });

  describe('Personas tab active state', () => {
    it('passes personas as activeTab value', () => {
      expect(personasTs).toMatch(/activeTab\s*:\s*['"]personas['"]/);
    });
  });

  describe('Styling consistency', () => {
    it('personas page has CSS variables for TabHeader styling', () => {
      const hasCssVars = personasHtml.includes('--color-') ||
        personasHtml.includes('--spacing-') ||
        personasHtml.includes(':root');
      expect(hasCssVars).toBe(true);
    });

    it('personas page has Inter font loaded', () => {
      expect(personasHtml).toMatch(/Inter/);
    });
  });

  describe('Visual requirements', () => {
    it('page title is still displayed', () => {
      expect(personasHtml).toMatch(/data-i18n="personas\.title"/);
    });

    it('add persona button still exists', () => {
      expect(personasHtml).toMatch(/id="addPersonaBtn"/);
    });

    it('add persona button has add icon', () => {
      expect(personasHtml).toMatch(/id="addPersonaBtn"[\s\S]*?<svg/);
    });
  });

  describe('No old header elements', () => {
    it('no h1 with img logo', () => {
      const h1Match = personasHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) || [];
      for (const h1 of h1Match) {
        expect(h1).not.toMatch(/<img[^>]*id="logo"/);
      }
    });

    it('no back button event listener in init', () => {
      // Should not have backBtn event listener
      expect(personasTs).not.toMatch(/getElementById\s*\(\s*['"]backBtn['"]\s*\)/);
    });
  });

  describe('Intro text preserved', () => {
    it('intro text element still exists', () => {
      expect(personasHtml).toMatch(/intro-text/);
    });

    it('intro text has personas.intro i18n key', () => {
      expect(personasHtml).toMatch(/data-i18n="personas\.intro"/);
    });
  });

  describe('applyTranslations includes TabHeader', () => {
    it('applyTranslations is called after injectTabHeader', () => {
      const injectIndex = personasTs.indexOf('injectTabHeader');
      const translateIndex = personasTs.indexOf('applyTranslations');

      // Both exist and translations come after injection
      if (injectIndex > -1 && translateIndex > -1) {
        expect(translateIndex > injectIndex).toBe(true);
      }
    });
  });
});

describe('Personas page preserves existing functionality', () => {
  it('still has builtin personas list', () => {
    expect(personasHtml).toMatch(/id="builtinList"/);
  });

  it('still has custom personas list', () => {
    expect(personasHtml).toMatch(/id="customList"/);
  });

  it('still has custom empty state', () => {
    expect(personasHtml).toMatch(/id="customEmptyState"/);
  });

  it('still has persona modal', () => {
    expect(personasHtml).toMatch(/id="personaModal"/);
  });

  it('still has modal title', () => {
    expect(personasHtml).toMatch(/id="modalTitle"/);
  });

  it('still has persona name input', () => {
    expect(personasHtml).toMatch(/id="personaName"/);
  });

  it('still has icon picker', () => {
    expect(personasHtml).toMatch(/id="iconPicker"/);
  });

  it('still has system prompt textarea', () => {
    expect(personasHtml).toMatch(/id="personaSystemPrompt"/);
  });

  it('still has character counter', () => {
    expect(personasHtml).toMatch(/id="systemPromptCounter"/);
  });

  it('still has save button', () => {
    expect(personasHtml).toMatch(/id="savePersonaBtn"/);
  });

  it('still has cancel button', () => {
    expect(personasHtml).toMatch(/id="cancelPersonaBtn"/);
  });

  it('still has confirm dialog', () => {
    expect(personasHtml).toMatch(/id="confirmDialog"/);
  });

  it('still has delete confirm button', () => {
    expect(personasHtml).toMatch(/id="confirmDelete"/);
  });

  it('still has cancel delete button', () => {
    expect(personasHtml).toMatch(/id="cancelDelete"/);
  });
});

describe('Personas.ts functionality preserved', () => {
  it('still imports Storage', () => {
    expect(personasTs).toMatch(/import.*Storage.*from.*storage/);
  });

  it('still imports DEFAULT_PERSONAS', () => {
    expect(personasTs).toMatch(/import.*DEFAULT_PERSONAS.*from.*types/);
  });

  it('still imports i18n', () => {
    expect(personasTs).toMatch(/import.*t.*initLanguage.*from.*i18n/);
  });

  it('still has renderPersonaLists function', () => {
    expect(personasTs).toMatch(/function\s+renderPersonaLists/);
  });

  it('still has savePersona function', () => {
    expect(personasTs).toMatch(/async\s+function\s+savePersona/);
  });

  it('still has deletePersona function', () => {
    expect(personasTs).toMatch(/async\s+function\s+deletePersona/);
  });

  it('still has setDefaultPersona function', () => {
    expect(personasTs).toMatch(/async\s+function\s+setDefaultPersona/);
  });

  it('still has modal show/hide functions', () => {
    expect(personasTs).toMatch(/function\s+showModal/);
    expect(personasTs).toMatch(/function\s+hideModal/);
  });

  it('still has character counter function', () => {
    expect(personasTs).toMatch(/function\s+updateCharCounter/);
  });

  it('still has SYSTEM_PROMPT_MAX_LENGTH constant', () => {
    expect(personasTs).toMatch(/SYSTEM_PROMPT_MAX_LENGTH\s*=\s*10000/);
  });
});
