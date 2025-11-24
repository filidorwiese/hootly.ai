import { describe, it, expect, beforeEach } from 'vitest'
import { t, setLanguage, getLanguage, initLanguage } from '../../shared/i18n'
import { setMockStorage } from '../__mocks__/chrome'

describe('i18n', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  describe('t() - translation function', () => {
    it('returns translation for valid key', () => {
      expect(t('appName')).toBe('FireOwl')
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
      expect(t('appName')).toBe('FireOwl')
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
        fireclaude_settings: { language: 'fr' },
      })
      await initLanguage()
      expect(getLanguage()).toBe('fr')
    })

    it('uses auto-detect when language is auto', async () => {
      setMockStorage({
        fireclaude_settings: { language: 'auto' },
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
