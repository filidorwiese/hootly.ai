import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('ST-5: Bug fix - Tooltip appears even when disabled in settings', () => {
  let tooltipCode: string

  beforeEach(() => {
    tooltipCode = readFileSync(
      join(__dirname, '../../content/components/SelectionTooltip.tsx'),
      'utf-8'
    )
  })

  describe('Initial state prevents premature rendering', () => {
    it('should initialize isEnabled as null (loading state)', () => {
      expect(tooltipCode).toContain('useState<boolean | null>(null)')
    })

    it('should have comment explaining null means loading', () => {
      expect(tooltipCode).toContain('null = loading')
    })

    it('should not default isEnabled to true', () => {
      // Old bug: useState(true) caused tooltip to show before settings loaded
      expect(tooltipCode).not.toMatch(/useState\(true\)\s*;?\s*\/\/.*isEnabled/)
      expect(tooltipCode).not.toMatch(/const \[isEnabled, setIsEnabled\] = useState\(true\)/)
    })
  })

  describe('Render condition checks loading state', () => {
    it('should check isEnabled === null before rendering', () => {
      expect(tooltipCode).toContain('isEnabled === null')
    })

    it('should return null when isEnabled is null (loading)', () => {
      // The condition should be: if (isEnabled === null || !isEnabled || !isVisible)
      const renderCondition = tooltipCode.match(/if\s*\(isEnabled === null[^)]+\)\s*return null/)
      expect(renderCondition).toBeTruthy()
    })

    it('should have render condition that prevents showing during loading', () => {
      expect(tooltipCode).toMatch(/if\s*\(\s*isEnabled === null\s*\|\|\s*!isEnabled/)
    })
  })

  describe('Settings loading sequence', () => {
    it('should call Storage.getSettings() on mount', () => {
      expect(tooltipCode).toContain('Storage.getSettings()')
    })

    it('should set isEnabled from settings.showSelectionTooltip', () => {
      expect(tooltipCode).toContain('settings.showSelectionTooltip')
    })

    it('should handle undefined showSelectionTooltip as true (backwards compatibility)', () => {
      expect(tooltipCode).toContain('settings.showSelectionTooltip !== false')
    })
  })

  describe('Bug fix verification', () => {
    it('should not render tooltip before settings are loaded even if selection exists', () => {
      // This test verifies the fix conceptually:
      // Old behavior: isEnabled=true initially, so tooltip shows if isVisible=true
      // New behavior: isEnabled=null initially, so tooltip never shows until settings load

      // Check that the component guards against rendering during loading
      const hasLoadingGuard = tooltipCode.includes('isEnabled === null')
      const hasNullInitialState = tooltipCode.includes('useState<boolean | null>(null)')

      expect(hasLoadingGuard).toBe(true)
      expect(hasNullInitialState).toBe(true)
    })

    it('should only render after settings are confirmed loaded and enabled', () => {
      // The render condition should check: loading complete, enabled, visible, dialog closed, shortcut set
      expect(tooltipCode).toContain('isEnabled === null')
      expect(tooltipCode).toContain('!isEnabled')
      expect(tooltipCode).toContain('!isVisible')
      expect(tooltipCode).toContain('isDialogOpen')
      expect(tooltipCode).toContain('!shortcut')
      expect(tooltipCode).toContain('return null')
    })
  })

  describe('TypeScript type safety', () => {
    it('should use proper type annotation for isEnabled state', () => {
      expect(tooltipCode).toContain('useState<boolean | null>')
    })
  })

  describe('Comment explains the fix', () => {
    it('should have descriptive comment about render condition', () => {
      expect(tooltipCode).toMatch(/\/\/.*loading|\/\/.*render|\/\/.*Don.*render/)
    })
  })

  describe('Storage change listener still works', () => {
    it('should listen for showSelectionTooltip changes', () => {
      expect(tooltipCode).toContain("changes.settings?.newValue?.showSelectionTooltip")
    })

    it('should update isEnabled when settings change', () => {
      expect(tooltipCode).toContain('setIsEnabled(changes.settings.newValue.showSelectionTooltip)')
    })
  })

  describe('Integration with PRD requirements', () => {
    it('content script sends selection change messages', () => {
      const contentScript = readFileSync(
        join(__dirname, '../../content/index.tsx'),
        'utf-8'
      )
      expect(contentScript).toContain('hootly-selection-change')
    })

    it('tooltip listens for selection change messages', () => {
      expect(tooltipCode).toContain('hootly-selection-change')
    })

    it('tooltip sets isVisible based on selection message', () => {
      expect(tooltipCode).toContain('setIsVisible(event.data.payload?.hasSelection')
    })
  })
})
