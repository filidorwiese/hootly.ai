import { describe, test, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PP-10: Remove persona list from settings page', () => {
  let settingsHtml: string;
  let settingsTs: string;

  beforeEach(() => {
    settingsHtml = readFileSync(resolve(__dirname, '../../settings/index.html'), 'utf-8');
    settingsTs = readFileSync(resolve(__dirname, '../../settings/settings.ts'), 'utf-8');
  });

  describe('HTML changes', () => {
    test('no persona list element exists', () => {
      expect(settingsHtml).not.toContain('id="personaList"');
      expect(settingsHtml).not.toContain('class="persona-list"');
    });

    test('no persona form exists', () => {
      expect(settingsHtml).not.toContain('id="personaForm"');
      expect(settingsHtml).not.toContain('class="persona-form"');
    });

    test('no Add Persona button exists', () => {
      expect(settingsHtml).not.toContain('id="addPersonaBtn"');
      expect(settingsHtml).not.toContain('addPersona">');
    });

    test('no persona item styles exist', () => {
      expect(settingsHtml).not.toContain('.persona-item');
      expect(settingsHtml).not.toContain('.persona-icon');
      expect(settingsHtml).not.toContain('.persona-info');
      expect(settingsHtml).not.toContain('.persona-actions');
    });

    test('no icon picker exists', () => {
      expect(settingsHtml).not.toContain('id="iconPicker"');
      expect(settingsHtml).not.toContain('class="icon-picker"');
      expect(settingsHtml).not.toContain('class="icon-option"');
    });

    test('no persona form fields exist', () => {
      expect(settingsHtml).not.toContain('id="personaName"');
      expect(settingsHtml).not.toContain('id="personaSystemPrompt"');
      expect(settingsHtml).not.toContain('id="editingPersonaId"');
    });

    test('default persona dropdown still exists', () => {
      expect(settingsHtml).toContain('id="defaultPersona"');
      expect(settingsHtml).toContain('data-i18n="settings.defaultPersona"');
    });

    test('Manage Personas link exists', () => {
      expect(settingsHtml).toContain('id="managePersonasLink"');
      expect(settingsHtml).toContain('data-i18n="settings.managePersonas"');
    });

    test('Manage Personas link is positioned below dropdown', () => {
      const dropdownPos = settingsHtml.indexOf('id="defaultPersona"');
      const linkPos = settingsHtml.indexOf('id="managePersonasLink"');
      expect(linkPos).toBeGreaterThan(dropdownPos);
    });

    test('Manage Personas is styled as a link not button', () => {
      expect(settingsHtml).toContain('class="manage-personas-link"');
      expect(settingsHtml).not.toContain('managePersonasLink" class="btn-secondary"');
    });

    test('link styling defined in CSS', () => {
      expect(settingsHtml).toContain('.manage-personas-link');
      expect(settingsHtml).toContain('text-decoration: none');
      expect(settingsHtml).toContain('color: var(--color-text-link)');
    });
  });

  describe('TypeScript changes', () => {
    test('no renderPersonaList function', () => {
      expect(settingsTs).not.toContain('renderPersonaList');
    });

    test('no showPersonaForm function', () => {
      expect(settingsTs).not.toContain('showPersonaForm');
    });

    test('no hidePersonaForm function', () => {
      expect(settingsTs).not.toContain('hidePersonaForm');
    });

    test('no savePersona function', () => {
      expect(settingsTs).not.toContain('async function savePersona');
    });

    test('no editPersona function', () => {
      expect(settingsTs).not.toContain('function editPersona');
    });

    test('no deletePersona function', () => {
      expect(settingsTs).not.toContain('async function deletePersona');
    });

    test('no addPersonaBtn reference', () => {
      expect(settingsTs).not.toContain('addPersonaBtn');
    });

    test('no personaForm reference', () => {
      expect(settingsTs).not.toContain('personaForm');
    });

    test('no iconPicker reference', () => {
      expect(settingsTs).not.toContain('iconPicker');
    });

    test('no selectedIcon variable', () => {
      expect(settingsTs).not.toContain('selectedIcon');
    });

    test('no updateIconSelection function', () => {
      expect(settingsTs).not.toContain('updateIconSelection');
    });

    test('no updateCharCounter function', () => {
      expect(settingsTs).not.toContain('updateCharCounter');
    });

    test('no SYSTEM_PROMPT_MAX_LENGTH constant', () => {
      expect(settingsTs).not.toContain('SYSTEM_PROMPT_MAX_LENGTH');
    });

    test('no Persona import for form management', () => {
      // Should not import Persona type since not used for form anymore
      expect(settingsTs).not.toMatch(/import.*Persona.*from/);
    });

    test('managePersonasLink still has event handler', () => {
      expect(settingsTs).toContain("getElementById('managePersonasLink')");
      expect(settingsTs).toContain("personas.html");
    });

    test('custom personas still populated in default dropdown', () => {
      expect(settingsTs).toContain('customPersonas');
      expect(settingsTs).toContain('defaultPersonaSelect.appendChild');
    });
  });

  describe('Section header removal', () => {
    test('no Personas section header', () => {
      expect(settingsHtml).not.toContain('personasSection');
      expect(settingsHtml).not.toContain('class="section-header"');
    });
  });

  describe('Character counter removal', () => {
    test('no char-counter styles for persona form', () => {
      // char-counter CSS was only for persona form, should be removed
      // Actually keep this since settings might have other uses - let's check
      // No, we removed it with the persona form CSS
      expect(settingsHtml).not.toContain('.char-counter');
    });

    test('no systemPromptCounter element', () => {
      expect(settingsHtml).not.toContain('id="systemPromptCounter"');
    });
  });
});
