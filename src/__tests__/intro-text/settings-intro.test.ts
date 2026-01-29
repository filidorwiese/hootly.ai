import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * INTRO-1: Add intro text to settings page
 *
 * Verify that:
 * - Settings page has intro paragraph below title
 * - Intro text has i18n translation key
 * - CSS styling matches page design
 * - All 10 language files have intro translation
 */

describe('INTRO-1: Settings page intro text', () => {
  let settingsHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../settings/index.html')
    settingsHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('intro text in HTML', () => {
    it('has intro paragraph with data-i18n attribute', () => {
      expect(settingsHtml).toContain('data-i18n="settings.intro"')
    })

    it('has intro paragraph with correct CSS class', () => {
      expect(settingsHtml).toContain('class="intro-text"')
    })

    it('has intro paragraph positioned after h1 title', () => {
      const h1Index = settingsHtml.indexOf('</h1>')
      const introIndex = settingsHtml.indexOf('class="intro-text"')
      expect(h1Index).toBeLessThan(introIndex)
    })

    it('has intro paragraph positioned before first setting div', () => {
      const introIndex = settingsHtml.indexOf('class="intro-text"')
      const firstSettingIndex = settingsHtml.indexOf('class="setting"')
      expect(introIndex).toBeLessThan(firstSettingIndex)
    })

    it('contains default English intro text', () => {
      expect(settingsHtml).toContain('Configure your API keys, model preferences, and personalization options below.')
    })
  })

  describe('intro text CSS styling', () => {
    it('defines .intro-text class', () => {
      expect(settingsHtml).toContain('.intro-text')
    })

    it('uses secondary text color', () => {
      const styleMatch = settingsHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]

      // Check that intro-text uses secondary color variable
      expect(styleContent).toContain('.intro-text')
      expect(styleContent).toContain('--color-text-secondary')
    })

    it('has appropriate margin styling', () => {
      const styleMatch = settingsHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      const styleContent = styleMatch![1]

      // Check for margin in intro-text section
      expect(styleContent).toContain('margin-bottom: var(--spacing-6)')
    })

    it('uses base font size', () => {
      const styleMatch = settingsHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      const styleContent = styleMatch![1]

      expect(styleContent).toContain('font-size: var(--font-size-base)')
    })
  })

  describe('i18n translations', () => {
    const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko']

    languages.forEach(lang => {
      it(`has intro translation for ${lang}`, () => {
        const i18nPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`)
        const i18nContent = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'))

        expect(i18nContent.settings).toHaveProperty('intro')
        expect(typeof i18nContent.settings.intro).toBe('string')
        expect(i18nContent.settings.intro.length).toBeGreaterThan(0)
      })
    })

    it('English intro is concise (1-2 sentences)', () => {
      const enPath = path.resolve(__dirname, '../../shared/i18n/en.json')
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

      const intro = enContent.settings.intro
      // Count periods that end sentences (not in abbreviations like "e.g.")
      const sentenceCount = (intro.match(/\.\s*[A-Z]|\.$/) || []).length

      // Should be 1-2 sentences
      expect(sentenceCount).toBeGreaterThanOrEqual(1)
      expect(sentenceCount).toBeLessThanOrEqual(2)
    })

    it('all translations mention key concepts', () => {
      languages.forEach(lang => {
        const i18nPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`)
        const i18nContent = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'))
        const intro = i18nContent.settings.intro.toLowerCase()

        // Each translation should mention API in some form
        const hasApiMention = intro.includes('api') ||
          intro.includes('密钥') || // Chinese for "key"
          intro.includes('キー') || // Japanese for "key"
          intro.includes('키') // Korean for "key"

        expect(hasApiMention).toBe(true)
      })
    })
  })
})
