import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * INTRO-2: Add intro text to personas page
 *
 * Verify that:
 * - Personas page has intro paragraph below title
 * - Intro text has i18n translation key
 * - CSS styling matches page design
 * - All 10 language files have intro translation
 */

describe('INTRO-2: Personas page intro text', () => {
  let personasHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../personas/index.html')
    personasHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('intro text in HTML', () => {
    it('has intro paragraph with data-i18n attribute', () => {
      expect(personasHtml).toContain('data-i18n="personas.intro"')
    })

    it('has intro paragraph with correct CSS class', () => {
      expect(personasHtml).toContain('class="intro-text"')
    })

    it('has intro paragraph positioned after header', () => {
      const headerIndex = personasHtml.indexOf('</header>')
      const introIndex = personasHtml.indexOf('class="intro-text"')
      expect(headerIndex).toBeLessThan(introIndex)
    })

    it('has intro paragraph positioned before persona sections', () => {
      const introIndex = personasHtml.indexOf('class="intro-text"')
      const sectionIndex = personasHtml.indexOf('class="persona-section"')
      expect(introIndex).toBeLessThan(sectionIndex)
    })

    it('contains default English intro text', () => {
      expect(personasHtml).toContain('Create custom personas to tailor AI responses for different tasks and workflows.')
    })
  })

  describe('intro text CSS styling', () => {
    it('defines .intro-text class', () => {
      expect(personasHtml).toContain('.intro-text')
    })

    it('uses secondary text color', () => {
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]

      expect(styleContent).toContain('.intro-text')
      expect(styleContent).toContain('--color-text-secondary')
    })

    it('has appropriate margin styling', () => {
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      const styleContent = styleMatch![1]

      expect(styleContent).toContain('margin-bottom: var(--spacing-6)')
    })

    it('uses base font size', () => {
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
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

        expect(i18nContent.personas).toHaveProperty('intro')
        expect(typeof i18nContent.personas.intro).toBe('string')
        expect(i18nContent.personas.intro.length).toBeGreaterThan(0)
      })
    })

    it('English intro is concise (1-2 sentences)', () => {
      const enPath = path.resolve(__dirname, '../../shared/i18n/en.json')
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

      const intro = enContent.personas.intro
      const sentenceCount = (intro.match(/\.\s*[A-Z]|\.$/) || []).length

      expect(sentenceCount).toBeGreaterThanOrEqual(1)
      expect(sentenceCount).toBeLessThanOrEqual(2)
    })

    it('all translations mention personas/customization concept', () => {
      languages.forEach(lang => {
        const i18nPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`)
        const i18nContent = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'))
        const intro = i18nContent.personas.intro.toLowerCase()

        // Each translation should mention persona or custom in some form
        const hasPersonaConcept = intro.includes('persona') ||
          intro.includes('custom') ||
          intro.includes('aangepast') || // Dutch for custom
          intro.includes('benutzerdefiniert') || // German for custom
          intro.includes('personnalisé') || // French for custom
          intro.includes('personalizado') || // Spanish/Portuguese for custom
          intro.includes('personalizzat') || // Italian for custom
          intro.includes('自定义') || // Chinese for custom
          intro.includes('カスタム') || // Japanese for custom
          intro.includes('사용자 지정') // Korean for custom

        expect(hasPersonaConcept).toBe(true)
      })
    })
  })
})
