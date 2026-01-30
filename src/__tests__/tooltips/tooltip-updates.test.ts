import { describe, it, expect, beforeEach } from 'vitest'
import { setLanguage, t } from '../../shared/i18n'
import en from '../../shared/i18n/en.json'
import nl from '../../shared/i18n/nl.json'
import de from '../../shared/i18n/de.json'
import fr from '../../shared/i18n/fr.json'
import es from '../../shared/i18n/es.json'
import itLang from '../../shared/i18n/it.json'
import pt from '../../shared/i18n/pt.json'
import zh from '../../shared/i18n/zh.json'
import ja from '../../shared/i18n/ja.json'
import ko from '../../shared/i18n/ko.json'

describe('Tooltip i18n keys', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  describe('TT-1: Context toggle tooltip', () => {
    it('has descriptive tooltip text in English', () => {
      expect(t('context.clickToEnable')).toBe('Add current website as context to chat')
    })

    it('translation key exists in all languages', () => {
      const languages = [en, nl, de, fr, es, itLang, pt, zh, ja, ko]
      languages.forEach(lang => {
        expect(lang.context.clickToEnable).toBeDefined()
        expect(lang.context.clickToEnable.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TT-2: Persona selector tooltip', () => {
    it('has changePersona key in English', () => {
      expect(t('persona.changePersona')).toBe('Change persona')
    })

    it('translation key exists in all languages', () => {
      const languages = [en, nl, de, fr, es, itLang, pt, zh, ja, ko]
      languages.forEach(lang => {
        expect(lang.persona.changePersona).toBeDefined()
        expect(lang.persona.changePersona.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TT-3: Model selector tooltip', () => {
    it('has changeModel key in English', () => {
      expect(t('model.changeModel')).toBe('Change AI model')
    })

    it('translation key exists in all languages', () => {
      const languages = [en, nl, de, fr, es, itLang, pt, zh, ja, ko]
      languages.forEach(lang => {
        expect(lang.model.changeModel).toBeDefined()
        expect(lang.model.changeModel.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TT-4: Close dialog tooltip', () => {
    it('has closeDialog key in English', () => {
      expect(t('dialog.closeDialog')).toBe('Close dialog')
    })

    it('translation key exists in all languages', () => {
      const languages = [en, nl, de, fr, es, itLang, pt, zh, ja, ko]
      languages.forEach(lang => {
        expect(lang.dialog.closeDialog).toBeDefined()
        expect(lang.dialog.closeDialog.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Tooltip usage in components', () => {
  describe('PersonaSelector tooltip', () => {
    it('should use changePersona key', async () => {
      const fs = await import('fs')
      const path = await import('path')
      const componentPath = path.resolve(__dirname, '../../content/components/PersonaSelector.tsx')
      const content = fs.readFileSync(componentPath, 'utf-8')

      expect(content).toContain("title={t('persona.changePersona')}")
    })
  })

  describe('ModelSelector tooltip', () => {
    it('should use changeModel key', async () => {
      const fs = await import('fs')
      const path = await import('path')
      const componentPath = path.resolve(__dirname, '../../content/components/ModelSelector.tsx')
      const content = fs.readFileSync(componentPath, 'utf-8')

      expect(content).toContain("title={t('model.changeModel')}")
    })
  })

  describe('Dialog close button tooltip', () => {
    it('should use closeDialog key', async () => {
      const fs = await import('fs')
      const path = await import('path')
      const componentPath = path.resolve(__dirname, '../../content/components/Dialog.tsx')
      const content = fs.readFileSync(componentPath, 'utf-8')

      expect(content).toContain("title={t('dialog.closeDialog')}")
    })
  })
})
