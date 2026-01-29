import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { DEFAULT_PERSONAS, type Persona } from '../../shared/types'

/**
 * P-7: Remove description field from persona
 *
 * Verifies that the description field has been removed from:
 * - Persona interface (types.ts)
 * - DEFAULT_PERSONAS constant
 * - Personas page form and list
 * - Settings page persona section
 * - PersonaSelector in dialog
 */

describe('P-7: Remove description field from persona', () => {
  describe('Persona interface and DEFAULT_PERSONAS', () => {
    it('Persona type does not include description field', () => {
      // Create a persona object to verify structure
      const persona: Persona = {
        id: 'test',
        name: 'Test',
        systemPrompt: 'Test prompt',
        icon: '🤖',
        isBuiltIn: false,
      }

      // Check that the persona doesn't have a description property
      expect(persona).not.toHaveProperty('description')
      expect(Object.keys(persona)).toEqual(['id', 'name', 'systemPrompt', 'icon', 'isBuiltIn'])
    })

    it('DEFAULT_PERSONAS do not have description field', () => {
      DEFAULT_PERSONAS.forEach((persona) => {
        expect(persona).not.toHaveProperty('description')
        expect(persona.id).toBeDefined()
        expect(persona.name).toBeDefined()
        expect(persona.systemPrompt).toBeDefined()
        expect(persona.icon).toBeDefined()
        expect(persona.isBuiltIn).toBe(true)
      })
    })

    it('DEFAULT_PERSONAS have required fields only', () => {
      const generalPersona = DEFAULT_PERSONAS.find((p) => p.id === 'general')
      expect(generalPersona).toBeDefined()
      expect(generalPersona!.name).toBe('General')
      expect(generalPersona!.icon).toBe('🦉')
      expect(generalPersona!.systemPrompt).toBe('')
    })

    it('Code Helper persona has system prompt but no description', () => {
      const codeHelper = DEFAULT_PERSONAS.find((p) => p.id === 'code-helper')
      expect(codeHelper).toBeDefined()
      expect(codeHelper!.name).toBe('Code Helper')
      expect(codeHelper!.systemPrompt).toContain('expert programmer')
      expect(codeHelper).not.toHaveProperty('description')
    })
  })

  describe('Personas page (personas/index.html)', () => {
    let personasHtml: string

    beforeAll(() => {
      const htmlPath = path.resolve(__dirname, '../../personas/index.html')
      personasHtml = fs.readFileSync(htmlPath, 'utf-8')
    })

    it('form does not have description input field', () => {
      expect(personasHtml).not.toContain('id="personaDescription"')
      expect(personasHtml).not.toContain('personaDescription')
    })

    it('form has only name, icon, and system prompt fields', () => {
      expect(personasHtml).toContain('id="personaName"')
      expect(personasHtml).toContain('id="personaSystemPrompt"')
      expect(personasHtml).toContain('id="iconPicker"')
    })

    it('CSS does not have persona-desc class', () => {
      expect(personasHtml).not.toContain('.persona-desc')
    })
  })

  describe('Settings page (settings/index.html)', () => {
    let settingsHtml: string

    beforeAll(() => {
      const htmlPath = path.resolve(__dirname, '../../settings/index.html')
      settingsHtml = fs.readFileSync(htmlPath, 'utf-8')
    })

    it('form does not have description input field', () => {
      expect(settingsHtml).not.toContain('id="personaDescription"')
    })

    it('CSS does not have persona-desc class', () => {
      expect(settingsHtml).not.toContain('.persona-desc {')
    })
  })

  describe('PersonaSelector component', () => {
    let selectorCode: string

    beforeAll(() => {
      const codePath = path.resolve(__dirname, '../../content/components/PersonaSelector.tsx')
      selectorCode = fs.readFileSync(codePath, 'utf-8')
    })

    it('does not display description in dropdown options', () => {
      expect(selectorCode).not.toContain('optionDescStyles')
      expect(selectorCode).not.toContain('optionTextStyles')
      expect(selectorCode).not.toContain('persona.description')
    })

    it('uses persona.name for title attribute instead of description', () => {
      expect(selectorCode).toContain('title={persona.name}')
      expect(selectorCode).toContain('title={selectedPersona.name}')
    })

    it('renders name directly without column layout', () => {
      // Should have name directly after icon, not wrapped in a text container
      expect(selectorCode).toContain('<span className={optionIconStyles}>{persona.icon}</span>')
      expect(selectorCode).toContain('<span className={optionNameStyles}>{persona.name}</span>')
    })

    it('option styles use center alignment', () => {
      expect(selectorCode).toContain('align-items: center')
    })
  })

  describe('personas.ts logic', () => {
    let personasTs: string

    beforeAll(() => {
      const codePath = path.resolve(__dirname, '../../personas/personas.ts')
      personasTs = fs.readFileSync(codePath, 'utf-8')
    })

    it('does not read description from form', () => {
      expect(personasTs).not.toContain("getElementById('personaDescription')")
    })

    it('does not include description in saved persona', () => {
      // Should not have description field in the new persona object
      expect(personasTs).not.toContain('description,')
      expect(personasTs).not.toContain('description:')
    })

    it('does not render description in persona item', () => {
      expect(personasTs).not.toContain('persona-desc')
      expect(personasTs).not.toContain('persona.description')
    })
  })

  describe('settings.ts logic', () => {
    let settingsTs: string

    beforeAll(() => {
      const codePath = path.resolve(__dirname, '../../settings/settings.ts')
      settingsTs = fs.readFileSync(codePath, 'utf-8')
    })

    it('does not read description from form', () => {
      expect(settingsTs).not.toContain("getElementById('personaDescription')")
    })

    it('does not render description in persona list', () => {
      expect(settingsTs).not.toContain('persona-desc')
    })

    it('does not include description in saved persona', () => {
      // Look for description field in persona creation
      const createPersonaMatch = settingsTs.match(/const newPersona[^}]+}/s)
      if (createPersonaMatch) {
        expect(createPersonaMatch[0]).not.toContain('description')
      }
    })
  })
})
