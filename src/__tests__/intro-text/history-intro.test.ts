import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * INTRO-3: Add intro text to history page
 *
 * Verify that:
 * - History page has intro paragraph below header
 * - Intro text has i18n translation key
 * - CSS styling matches page design
 * - All 10 language files have intro translation
 */

describe('INTRO-3: History page intro text', () => {
  let historyHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../history/index.html')
    historyHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('intro text in HTML', () => {
    it('has intro paragraph with data-i18n attribute', () => {
      expect(historyHtml).toContain('data-i18n="history.intro"')
    })

    it('has intro paragraph with correct CSS class', () => {
      expect(historyHtml).toContain('class="intro-text"')
    })

    it('has intro paragraph positioned after header', () => {
      const headerIndex = historyHtml.indexOf('</header>')
      const introIndex = historyHtml.indexOf('class="intro-text"')
      expect(headerIndex).toBeLessThan(introIndex)
    })

    it('has intro paragraph positioned before search container', () => {
      const introIndex = historyHtml.indexOf('class="intro-text"')
      const searchIndex = historyHtml.indexOf('class="search-container"')
      expect(introIndex).toBeLessThan(searchIndex)
    })

    it('contains default English intro text', () => {
      expect(historyHtml).toContain('Browse and manage your conversation history')
    })
  })

  describe('intro text CSS styling', () => {
    it('defines .intro-text class', () => {
      expect(historyHtml).toContain('.intro-text')
    })

    it('uses secondary text color', () => {
      const styleMatch = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]

      expect(styleContent).toContain('.intro-text')
      expect(styleContent).toContain('--color-text-secondary')
    })

    it('has appropriate margin styling', () => {
      const styleMatch = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      const styleContent = styleMatch![1]

      expect(styleContent).toContain('margin-bottom: var(--spacing-5)')
    })

    it('uses base font size', () => {
      const styleMatch = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
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

        expect(i18nContent.history).toHaveProperty('intro')
        expect(typeof i18nContent.history.intro).toBe('string')
        expect(i18nContent.history.intro.length).toBeGreaterThan(0)
      })
    })

    it('English intro is concise (1-2 sentences)', () => {
      const enPath = path.resolve(__dirname, '../../shared/i18n/en.json')
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

      const intro = enContent.history.intro
      const sentenceCount = (intro.match(/\.\s*[A-Z]|\.$/) || []).length

      expect(sentenceCount).toBeGreaterThanOrEqual(1)
      expect(sentenceCount).toBeLessThanOrEqual(2)
    })

    it('all translations mention history/conversation concepts', () => {
      languages.forEach(lang => {
        const i18nPath = path.resolve(__dirname, `../../shared/i18n/${lang}.json`)
        const i18nContent = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'))
        const intro = i18nContent.history.intro.toLowerCase()

        const hasHistoryMention = intro.includes('history') ||
          intro.includes('conversation') ||
          intro.includes('gesprek') || // Dutch
          intro.includes('verlauf') || // German
          intro.includes('historique') || // French
          intro.includes('historial') || // Spanish
          intro.includes('cronologia') || // Italian
          intro.includes('histórico') || // Portuguese
          intro.includes('历史') || // Chinese
          intro.includes('対話') || // Japanese
          intro.includes('履歴') || // Japanese
          intro.includes('会話') || // Japanese
          intro.includes('대화') || // Korean
          intro.includes('기록') // Korean

        expect(hasHistoryMention).toBe(true)
      })
    })
  })
})
