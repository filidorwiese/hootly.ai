import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * P-8: System prompt maxlength 10000 with counter
 *
 * Verify that:
 * - System prompt textarea has maxlength=10000
 * - Character counter is displayed below the field
 * - Counter shows current length / 10000 format
 * - Warning styling when at/near limit
 */

describe('P-8: System prompt maxlength with counter', () => {
  let personasHtml: string
  let personasTs: string
  let settingsHtml: string
  let settingsTs: string

  beforeAll(() => {
    const personasHtmlPath = path.resolve(__dirname, '../../personas/index.html')
    const personasTsPath = path.resolve(__dirname, '../../personas/personas.ts')
    const settingsHtmlPath = path.resolve(__dirname, '../../settings/index.html')
    const settingsTsPath = path.resolve(__dirname, '../../settings/settings.ts')

    personasHtml = fs.readFileSync(personasHtmlPath, 'utf-8')
    personasTs = fs.readFileSync(personasTsPath, 'utf-8')
    settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf-8')
    settingsTs = fs.readFileSync(settingsTsPath, 'utf-8')
  })

  describe('Personas page', () => {
    describe('HTML structure', () => {
      it('system prompt textarea has maxlength=10000', () => {
        expect(personasHtml).toContain('id="personaSystemPrompt"')
        expect(personasHtml).toContain('maxlength="10000"')
        expect(personasHtml).toMatch(/<textarea[^>]*id="personaSystemPrompt"[^>]*maxlength="10000"/)
      })

      it('has character counter element', () => {
        expect(personasHtml).toContain('id="systemPromptCounter"')
        expect(personasHtml).toContain('class="char-counter"')
      })

      it('counter displays initial value', () => {
        expect(personasHtml).toContain('0 / 10000')
      })
    })

    describe('CSS styling', () => {
      it('defines char-counter class', () => {
        expect(personasHtml).toContain('.char-counter {')
      })

      it('char-counter has appropriate styling', () => {
        const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        expect(styleMatch).not.toBeNull()

        const styleContent = styleMatch![1]
        expect(styleContent).toContain('.char-counter')
        expect(styleContent).toContain('text-align: right')
      })

      it('defines warning class for limit reached', () => {
        expect(personasHtml).toContain('.char-counter.warning')
        expect(personasHtml).toContain('--color-accent-error')
      })
    })

    describe('TypeScript implementation', () => {
      it('defines SYSTEM_PROMPT_MAX_LENGTH constant', () => {
        expect(personasTs).toContain('SYSTEM_PROMPT_MAX_LENGTH = 10000')
      })

      it('has updateCharCounter function', () => {
        expect(personasTs).toContain('function updateCharCounter')
      })

      it('counter function gets prompt length', () => {
        expect(personasTs).toContain("getElementById('personaSystemPrompt')")
        expect(personasTs).toContain('.value.length')
      })

      it('counter function updates text content', () => {
        expect(personasTs).toContain('counter.textContent')
        expect(personasTs).toContain('SYSTEM_PROMPT_MAX_LENGTH')
      })

      it('adds input event listener for counter updates', () => {
        expect(personasTs).toContain("addEventListener('input', updateCharCounter)")
      })

      it('calls updateCharCounter when modal opens', () => {
        expect(personasTs).toContain('updateCharCounter()')
        // Should be called in showModal
        const showModalMatch = personasTs.match(/function showModal[\s\S]*?updateCharCounter\(\)/m)
        expect(showModalMatch).not.toBeNull()
      })

      it('toggles warning class when at limit', () => {
        expect(personasTs).toContain("classList.toggle('warning'")
      })
    })
  })

  describe('Settings page', () => {
    describe('HTML structure', () => {
      it('system prompt textarea has maxlength=10000', () => {
        expect(settingsHtml).toContain('id="personaSystemPrompt"')
        expect(settingsHtml).toContain('maxlength="10000"')
        expect(settingsHtml).toMatch(/<textarea[^>]*id="personaSystemPrompt"[^>]*maxlength="10000"/)
      })

      it('has character counter element', () => {
        expect(settingsHtml).toContain('id="systemPromptCounter"')
        expect(settingsHtml).toContain('class="char-counter"')
      })

      it('counter displays initial value', () => {
        expect(settingsHtml).toContain('0 / 10000')
      })
    })

    describe('CSS styling', () => {
      it('defines char-counter class', () => {
        expect(settingsHtml).toContain('.char-counter {')
      })

      it('defines warning class for limit reached', () => {
        expect(settingsHtml).toContain('.char-counter.warning')
        expect(settingsHtml).toContain('--color-accent-error')
      })
    })

    describe('TypeScript implementation', () => {
      it('defines SYSTEM_PROMPT_MAX_LENGTH constant', () => {
        expect(settingsTs).toContain('SYSTEM_PROMPT_MAX_LENGTH = 10000')
      })

      it('has updateCharCounter function', () => {
        expect(settingsTs).toContain('function updateCharCounter')
      })

      it('adds input event listener for counter updates', () => {
        expect(settingsTs).toContain("addEventListener('input', updateCharCounter)")
      })

      it('calls updateCharCounter when form opens', () => {
        expect(settingsTs).toContain('updateCharCounter()')
      })

      it('toggles warning class when at limit', () => {
        expect(settingsTs).toContain("classList.toggle('warning'")
      })
    })
  })

  describe('Consistency between pages', () => {
    it('both pages use same max length', () => {
      const personasMatch = personasTs.match(/SYSTEM_PROMPT_MAX_LENGTH\s*=\s*(\d+)/)
      const settingsMatch = settingsTs.match(/SYSTEM_PROMPT_MAX_LENGTH\s*=\s*(\d+)/)

      expect(personasMatch).not.toBeNull()
      expect(settingsMatch).not.toBeNull()
      expect(personasMatch![1]).toBe('10000')
      expect(settingsMatch![1]).toBe('10000')
    })

    it('both HTML textareas use same maxlength attribute', () => {
      const personasMaxlength = personasHtml.match(/id="personaSystemPrompt"[^>]*maxlength="(\d+)"/)
      const settingsMaxlength = settingsHtml.match(/id="personaSystemPrompt"[^>]*maxlength="(\d+)"/)

      expect(personasMaxlength).not.toBeNull()
      expect(settingsMaxlength).not.toBeNull()
      expect(personasMaxlength![1]).toBe('10000')
      expect(settingsMaxlength![1]).toBe('10000')
    })

    it('both pages have warning styling for limit', () => {
      expect(personasHtml).toContain('.char-counter.warning')
      expect(settingsHtml).toContain('.char-counter.warning')
    })
  })
})
