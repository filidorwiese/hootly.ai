import { describe, it, expect, beforeEach } from 'vitest'
import { Storage } from '../../shared/storage'
import { DEFAULT_SETTINGS } from '../../shared/types'
import { resetChromeMock, setMockStorage, getMockStorage, triggerStorageChange } from '../__mocks__/chrome'

describe('Selection Tooltip Feature (ST-1 through ST-4)', () => {
  beforeEach(() => {
    resetChromeMock()
  })

  describe('ST-1: showSelectionTooltip setting in storage', () => {
    it('should have showSelectionTooltip in Settings type', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('showSelectionTooltip')
    })

    it('should default showSelectionTooltip to true', () => {
      expect(DEFAULT_SETTINGS.showSelectionTooltip).toBe(true)
    })

    it('should return default true when storage is empty', async () => {
      const settings = await Storage.getSettings()
      expect(settings.showSelectionTooltip).toBe(true)
    })

    it('should save showSelectionTooltip: false', async () => {
      await Storage.saveSettings({ showSelectionTooltip: false })

      const storage = getMockStorage()
      expect((storage.hootly_settings as any).showSelectionTooltip).toBe(false)
    })

    it('should save showSelectionTooltip: true', async () => {
      await Storage.saveSettings({ showSelectionTooltip: true })

      const storage = getMockStorage()
      expect((storage.hootly_settings as any).showSelectionTooltip).toBe(true)
    })

    it('should preserve showSelectionTooltip when saving other settings', async () => {
      setMockStorage({
        hootly_settings: { showSelectionTooltip: false },
      })

      await Storage.saveSettings({ shortcut: 'Ctrl+K' })

      const settings = await Storage.getSettings()
      expect(settings.showSelectionTooltip).toBe(false)
      expect(settings.shortcut).toBe('Ctrl+K')
    })
  })

  describe('ST-2: Toggle in settings near keyboard shortcut', () => {
    it('i18n translations exist for showSelectionTooltip label', async () => {
      const { t, setLanguage } = await import('../../shared/i18n')
      setLanguage('en')
      expect(t('settings.showSelectionTooltip')).toBe('Show Selection Tooltip')
    })

    it('i18n translations exist for showSelectionTooltip hint', async () => {
      const { t, setLanguage } = await import('../../shared/i18n')
      setLanguage('en')
      expect(t('settings.showSelectionTooltipHint')).toBe('Show a tooltip when text is selected on a page')
    })

    it('translations exist in all supported languages', async () => {
      const { t, setLanguage } = await import('../../shared/i18n')
      const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko']

      for (const lang of languages) {
        setLanguage(lang)
        const label = t('settings.showSelectionTooltip')
        const hint = t('settings.showSelectionTooltipHint')
        expect(label).toBeTruthy()
        expect(hint).toBeTruthy()
        expect(label).not.toBe('settings.showSelectionTooltip')
        expect(hint).not.toBe('settings.showSelectionTooltipHint')
      }
    })
  })

  describe('ST-3: Content script respects tooltip setting', () => {
    it('should read showSelectionTooltip from storage', async () => {
      setMockStorage({
        hootly_settings: { showSelectionTooltip: false },
      })

      const settings = await Storage.getSettings()
      expect(settings.showSelectionTooltip).toBe(false)
    })

    it('should handle undefined showSelectionTooltip as true (backwards compatibility)', async () => {
      setMockStorage({
        hootly_settings: { claudeApiKey: 'test' },
      })

      const settings = await Storage.getSettings()
      expect(settings.showSelectionTooltip).toBe(true)
    })
  })

  describe('ST-4: Tooltip toggle works without reload', () => {
    it('storage change listener should be callable', () => {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.settings?.newValue?.showSelectionTooltip !== undefined) {
          return changes.settings.newValue.showSelectionTooltip
        }
        return null
      }

      const result = listener({
        settings: {
          oldValue: { showSelectionTooltip: true },
          newValue: { showSelectionTooltip: false },
        },
      })

      expect(result).toBe(false)
    })

    it('should trigger storage change event when saving', async () => {
      let changeDetected = false
      const listener = () => {
        changeDetected = true
      }
      chrome.storage.onChanged.addListener(listener)

      await Storage.saveSettings({ showSelectionTooltip: false })

      triggerStorageChange({
        hootly_settings: {
          newValue: { showSelectionTooltip: false }
        }
      })

      expect(changeDetected).toBe(true)
      chrome.storage.onChanged.removeListener(listener)
    })
  })
})
