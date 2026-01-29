import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * FD-7: Update input areas to flat design
 *
 * Verify that all input areas across the extension:
 * - Have flat textarea borders (no inner shadows)
 * - Use solid focus states instead of glow/shadow effects
 * - Have consistent border widths (no layout shift on focus)
 * - Verify in dialog and history page continue mode
 */

describe('FD-7: Input areas flat design', () => {
  let historyHtml: string
  let settingsHtml: string
  let personasHtml: string
  let inputAreaTsx: string

  beforeAll(() => {
    historyHtml = fs.readFileSync(
      path.resolve(__dirname, '../../history/index.html'),
      'utf-8'
    )
    settingsHtml = fs.readFileSync(
      path.resolve(__dirname, '../../settings/index.html'),
      'utf-8'
    )
    personasHtml = fs.readFileSync(
      path.resolve(__dirname, '../../personas/index.html'),
      'utf-8'
    )
    inputAreaTsx = fs.readFileSync(
      path.resolve(__dirname, '../../content/components/InputArea.tsx'),
      'utf-8'
    )
  })

  describe('dialog InputArea component', () => {
    it('imports styles from design system', () => {
      expect(inputAreaTsx).toContain("from '../../shared/styles'")
    })

    it('uses design system colors for textarea', () => {
      expect(inputAreaTsx).toContain('colors.border.default')
      expect(inputAreaTsx).toContain('colors.surface.default')
      expect(inputAreaTsx).toContain('colors.text.primary')
    })

    it('focus state uses only border color change', () => {
      expect(inputAreaTsx).toContain('colors.border.focus')
    })

    it('does not have box-shadow in textarea styles', () => {
      // Extract the textareaStyles section
      const textareaMatch = inputAreaTsx.match(/const textareaStyles\s*=\s*css`([^`]*)`/)
      expect(textareaMatch).not.toBeNull()
      const textareaStyles = textareaMatch![1]
      expect(textareaStyles).not.toContain('box-shadow')
      expect(textareaStyles).not.toContain('shadow')
    })

    it('uses design system transitions', () => {
      expect(inputAreaTsx).toContain('transitions.default')
    })

    it('disabled state uses design system colors', () => {
      expect(inputAreaTsx).toContain('colors.surface.disabled')
      expect(inputAreaTsx).toContain('colors.text.secondary')
    })

    it('placeholder uses design system tertiary color', () => {
      expect(inputAreaTsx).toContain('colors.text.tertiary')
    })

    it('uses design system radii for border-radius', () => {
      expect(inputAreaTsx).toContain('radii.xl')
    })

    it('uses design system spacing for padding', () => {
      expect(inputAreaTsx).toContain('spacing[3]')
    })
  })

  describe('history page input area', () => {
    it('does not have box-shadow in any styles', () => {
      const styleMatch = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })

    it('input textarea has solid border', () => {
      expect(historyHtml).toContain('.input-textarea')
      expect(historyHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('focus state only changes border color, not width', () => {
      const focusBlock = historyHtml.match(/\.input-textarea:focus\s*\{([^}]*)\}/)?.[1] || ''
      expect(focusBlock).toContain('border-color: var(--color-border-focus)')
      expect(focusBlock).not.toContain('border-width')
    })

    it('uses CSS variables for all input styling', () => {
      expect(historyHtml).toContain('background: var(--color-surface-default)')
      expect(historyHtml).toContain('color: var(--color-text-primary)')
    })

    it('disabled state uses surface disabled color', () => {
      expect(historyHtml).toContain('background: var(--color-surface-disabled)')
    })

    it('placeholder uses text tertiary color', () => {
      expect(historyHtml).toContain('color: var(--color-text-tertiary)')
    })

    it('uses transition for smooth state changes', () => {
      expect(historyHtml).toContain('transition: border-color var(--transition-default)')
    })
  })

  describe('settings page input fields', () => {
    it('does not have box-shadow in input styles', () => {
      const styleMatch = settingsHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })

    it('inputs have solid border', () => {
      expect(settingsHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('focus state changes only border color', () => {
      expect(settingsHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('inputs use CSS variables for styling', () => {
      expect(settingsHtml).toContain('background: var(--color-surface-default)')
      expect(settingsHtml).toContain('color: var(--color-text-primary)')
    })

    it('placeholder uses text tertiary color', () => {
      expect(settingsHtml).toContain('color: var(--color-text-tertiary)')
    })

    it('uses transition for state changes', () => {
      expect(settingsHtml).toContain('transition: border-color var(--transition-default)')
    })

    it('textarea has proper resize setting', () => {
      expect(settingsHtml).toContain('resize: vertical')
    })
  })

  describe('personas page input fields', () => {
    it('does not have box-shadow in input styles', () => {
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()
      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })

    it('form inputs have solid border', () => {
      expect(personasHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('focus state changes only border color', () => {
      expect(personasHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('inputs use CSS variables for styling', () => {
      expect(personasHtml).toContain('background: var(--color-surface-default)')
      expect(personasHtml).toContain('color: var(--color-text-primary)')
    })

    it('uses transition for state changes', () => {
      expect(personasHtml).toContain('transition: border-color var(--transition-default)')
    })

    it('textarea has minimum height', () => {
      expect(personasHtml).toContain('min-height: 100px')
    })

    it('textarea has vertical resize', () => {
      expect(personasHtml).toContain('resize: vertical')
    })
  })

  describe('consistent flat design across all input areas', () => {
    it('all pages use the same border color variable', () => {
      const borderDefaultVar = '--color-border-default'
      expect(historyHtml).toContain(borderDefaultVar)
      expect(settingsHtml).toContain(borderDefaultVar)
      expect(personasHtml).toContain(borderDefaultVar)
    })

    it('all pages use the same focus border color variable', () => {
      const borderFocusVar = '--color-border-focus'
      expect(historyHtml).toContain(borderFocusVar)
      expect(settingsHtml).toContain(borderFocusVar)
      expect(personasHtml).toContain(borderFocusVar)
    })

    it('all pages use the same surface color variable', () => {
      const surfaceVar = '--color-surface-default'
      expect(historyHtml).toContain(surfaceVar)
      expect(settingsHtml).toContain(surfaceVar)
      expect(personasHtml).toContain(surfaceVar)
    })

    it('all pages use the same text colors', () => {
      const textPrimary = '--color-text-primary'
      const textTertiary = '--color-text-tertiary'
      expect(historyHtml).toContain(textPrimary)
      expect(historyHtml).toContain(textTertiary)
      expect(settingsHtml).toContain(textPrimary)
      expect(settingsHtml).toContain(textTertiary)
      expect(personasHtml).toContain(textPrimary)
    })

    it('no pages have inner shadows on inputs', () => {
      const checkNoInnerShadow = (html: string, name: string) => {
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        if (styleMatch) {
          expect(styleMatch[1]).not.toContain('inset')
        }
      }
      checkNoInnerShadow(historyHtml, 'history')
      checkNoInnerShadow(settingsHtml, 'settings')
      checkNoInnerShadow(personasHtml, 'personas')
    })

    it('no pages have glow effects on focus', () => {
      // Glow effects typically use 0 0 Xpx color or rgba with alpha
      const checkNoGlow = (html: string, name: string) => {
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        if (styleMatch) {
          const css = styleMatch[1]
          // Check for typical glow patterns
          expect(css).not.toMatch(/0\s+0\s+\d+px\s+rgba/)
        }
      }
      checkNoGlow(historyHtml, 'history')
      checkNoGlow(settingsHtml, 'settings')
      checkNoGlow(personasHtml, 'personas')
    })
  })
})
