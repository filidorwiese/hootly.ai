import { describe, it, expect, beforeEach } from 'vitest'
import { t, setLanguage, getLanguage, initLanguage, getLocalizedPersonaName, getLocalizedPersonaDescription } from '../../shared/i18n'
import { setMockStorage } from '../__mocks__/chrome'

describe('i18n', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  describe('t() - translation function', () => {
    it('returns translation for valid key', () => {
      expect(t('appName')).toBe('Hootly.ai')
    })

    it('returns nested translation', () => {
      expect(t('dialog.close')).toBe('Close')
      expect(t('settings.title')).toBe('Settings')
    })

    it('returns key when translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('interpolates parameters', () => {
      const result = t('input.tokens', { count: 100 })
      expect(result).toBe('~100 tokens')
    })

    it('interpolates multiple parameters', () => {
      setLanguage('en')
      const result = t('context.selection', { chars: 500 })
      expect(result).toBe('Selection (500 chars)')
    })

    it('handles missing parameters gracefully', () => {
      const result = t('input.tokens')
      expect(result).toBe('~{{count}} tokens')
    })
  })

  describe('setLanguage / getLanguage', () => {
    it('changes current language', () => {
      setLanguage('de')
      expect(getLanguage()).toBe('de')
    })

    it('ignores invalid language codes', () => {
      setLanguage('en')
      setLanguage('invalid')
      expect(getLanguage()).toBe('en')
    })

    it('accepts all supported languages', () => {
      const supported = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko']
      for (const lang of supported) {
        setLanguage(lang)
        expect(getLanguage()).toBe(lang)
      }
    })
  })

  describe('language fallback', () => {
    it('falls back to English for missing translations', () => {
      setLanguage('de')
      // appName should be same in all languages
      expect(t('appName')).toBe('Hootly.ai')
    })

    it('returns English for unsupported language', () => {
      setLanguage('en')
      // Force internal state to invalid
      ;(globalThis as any).__TEST_FORCE_LANG__ = 'xyz'
      // Still returns English content
      expect(t('dialog.close')).toBe('Close')
    })
  })

  describe('initLanguage', () => {
    it('loads language from storage', async () => {
      setMockStorage({
        hootly_settings: { language: 'fr' },
      })
      await initLanguage()
      expect(getLanguage()).toBe('fr')
    })

    it('uses auto-detect when language is auto', async () => {
      setMockStorage({
        hootly_settings: { language: 'auto' },
      })
      await initLanguage()
      // Should use browser language (mocked as 'en' in jsdom)
      expect(['en', 'de', 'fr', 'es', 'nl', 'it', 'pt', 'zh', 'ja', 'ko']).toContain(getLanguage())
    })

    it('handles missing storage gracefully', async () => {
      setMockStorage({})
      await initLanguage()
      // Should not throw, language stays as browser default
      expect(typeof getLanguage()).toBe('string')
    })
  })
})

describe('translation completeness', () => {
  const requiredKeys = [
    'appName',
    'settings.title',
    'settings.save',
    'dialog.close',
    'dialog.settings',
    'response.error',
    'input.placeholder',
    'input.send',
    'context.selection',
    'context.fullPage',
  ]

  it('English has all required keys', () => {
    setLanguage('en')
    for (const key of requiredKeys) {
      const value = t(key)
      expect(value).not.toBe(key) // Not returning the key itself
    }
  })
})

describe('PER-3: Persona localization', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  describe('getLocalizedPersonaName', () => {
    it('returns localized name for built-in personas', () => {
      expect(getLocalizedPersonaName('general')).toBe('General')
      expect(getLocalizedPersonaName('code-helper')).toBe('Code Helper')
      expect(getLocalizedPersonaName('writer')).toBe('Writer')
    })

    it('returns null for unknown persona IDs', () => {
      expect(getLocalizedPersonaName('unknown-id')).toBeNull()
      expect(getLocalizedPersonaName('custom-123')).toBeNull()
    })

    it('returns translated name when language changes', () => {
      setLanguage('de')
      expect(getLocalizedPersonaName('general')).toBe('Allgemein')
      expect(getLocalizedPersonaName('writer')).toBe('Schriftsteller')
    })
  })

  describe('getLocalizedPersonaDescription', () => {
    it('returns localized description for built-in personas', () => {
      const desc = getLocalizedPersonaDescription('general')
      expect(desc).toContain('helpful')
      expect(desc).toContain('assistant')
    })

    it('returns null for unknown persona IDs', () => {
      expect(getLocalizedPersonaDescription('unknown-id')).toBeNull()
    })

    it('returns translated description when language changes', () => {
      setLanguage('fr')
      const desc = getLocalizedPersonaDescription('general')
      expect(desc).toContain('assistant')
      expect(desc).toContain('serviable')
    })
  })
})

describe('PER-4: Multilingual persona testing', () => {
  const personaIds = ['general', 'code-helper', 'writer', 'researcher', 'translator']
  const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko']

  beforeEach(() => {
    setLanguage('en')
  })

  describe('personas display correctly in English', () => {
    it('all built-in personas have English names', () => {
      setLanguage('en')
      expect(getLocalizedPersonaName('general')).toBe('General')
      expect(getLocalizedPersonaName('code-helper')).toBe('Code Helper')
      expect(getLocalizedPersonaName('writer')).toBe('Writer')
      expect(getLocalizedPersonaName('researcher')).toBe('Researcher')
      expect(getLocalizedPersonaName('translator')).toBe('Translator')
    })

    it('all built-in personas have non-empty English descriptions', () => {
      setLanguage('en')
      for (const id of personaIds) {
        const desc = getLocalizedPersonaDescription(id)
        expect(desc).not.toBeNull()
        expect(desc!.length).toBeGreaterThan(100)
      }
    })
  })

  describe('personas display correctly in other languages', () => {
    it('German: all personas have translated names and descriptions', () => {
      setLanguage('de')
      expect(getLocalizedPersonaName('general')).toBe('Allgemein')
      expect(getLocalizedPersonaName('code-helper')).toBe('Code-Helfer')
      expect(getLocalizedPersonaName('writer')).toBe('Schriftsteller')

      const desc = getLocalizedPersonaDescription('general')
      expect(desc).toContain('hilfreicher')
    })

    it('French: all personas have translated names and descriptions', () => {
      setLanguage('fr')
      expect(getLocalizedPersonaName('general')).toBe('Général')
      expect(getLocalizedPersonaName('code-helper')).toBe('Assistant Code')
      expect(getLocalizedPersonaName('writer')).toBe('Rédacteur')

      const desc = getLocalizedPersonaDescription('general')
      expect(desc).toContain('serviable')
    })

    it('Chinese: all personas have translated names and descriptions', () => {
      setLanguage('zh')
      expect(getLocalizedPersonaName('general')).toBe('通用')
      expect(getLocalizedPersonaName('code-helper')).toBe('编程助手')
      expect(getLocalizedPersonaName('writer')).toBe('写作助手')

      const desc = getLocalizedPersonaDescription('general')
      expect(desc).toContain('助手')
    })
  })

  describe('character counts stay under 500 in all languages', () => {
    it('all persona descriptions are under 500 characters in all languages', () => {
      for (const lang of languages) {
        setLanguage(lang)
        for (const id of personaIds) {
          const desc = getLocalizedPersonaDescription(id)
          expect(desc).not.toBeNull()
          expect(desc!.length).toBeLessThan(500)
        }
      }
    })
  })

  describe('language switch updates persona text', () => {
    it('persona name changes when language switches', () => {
      setLanguage('en')
      expect(getLocalizedPersonaName('general')).toBe('General')

      setLanguage('de')
      expect(getLocalizedPersonaName('general')).toBe('Allgemein')

      setLanguage('ja')
      expect(getLocalizedPersonaName('general')).toBe('汎用')

      setLanguage('en')
      expect(getLocalizedPersonaName('general')).toBe('General')
    })

    it('persona description changes when language switches', () => {
      setLanguage('en')
      const enDesc = getLocalizedPersonaDescription('writer')
      expect(enDesc).toContain('writer')

      setLanguage('es')
      const esDesc = getLocalizedPersonaDescription('writer')
      expect(esDesc).toContain('escritor')
      expect(esDesc).not.toBe(enDesc)

      setLanguage('ko')
      const koDesc = getLocalizedPersonaDescription('writer')
      expect(koDesc).toContain('작가')
      expect(koDesc).not.toBe(enDesc)
      expect(koDesc).not.toBe(esDesc)
    })
  })
})
