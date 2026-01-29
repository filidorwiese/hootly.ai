import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * FD-4: Update settings page to flat design
 *
 * Verify that:
 * - No box-shadow definitions in CSS
 * - All colors use CSS variables from design system
 * - Solid borders used for section separation
 * - Input fields and dropdowns use flat styles
 * - Consistent with dialog flat style
 */

describe('FD-4: Settings page flat design', () => {
  let settingsHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../settings/index.html')
    settingsHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('CSS variable definitions', () => {
    it('defines primary color CSS variables', () => {
      expect(settingsHtml).toContain('--color-primary-50: #E8F0EA')
      expect(settingsHtml).toContain('--color-primary-500: #3A5A40')
      expect(settingsHtml).toContain('--color-primary-600: #2D4733')
    })

    it('defines background color CSS variables', () => {
      expect(settingsHtml).toContain('--color-bg-base: #FAFBF9')
      expect(settingsHtml).toContain('--color-bg-elevated: #FFFFFF')
      expect(settingsHtml).toContain('--color-bg-muted: #F5F7F4')
    })

    it('defines border color CSS variables', () => {
      expect(settingsHtml).toContain('--color-border-light: #E4E8E2')
      expect(settingsHtml).toContain('--color-border-default: #D4DCD6')
      expect(settingsHtml).toContain('--color-border-focus: #4A7C54')
    })

    it('defines text color CSS variables', () => {
      expect(settingsHtml).toContain('--color-text-primary: #2D3A30')
      expect(settingsHtml).toContain('--color-text-secondary: #6B7A6E')
      expect(settingsHtml).toContain('--color-text-inverse: #FFFFFF')
    })

    it('defines accent color CSS variables', () => {
      expect(settingsHtml).toContain('--color-accent-success: #4A7C54')
      expect(settingsHtml).toContain('--color-accent-success-hover: #3A6A44')
      expect(settingsHtml).toContain('--color-accent-error: #C45A5A')
    })
  })

  describe('no shadows in styling', () => {
    it('does not contain box-shadow properties', () => {
      // Extract style section
      const styleMatch = settingsHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()

      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })
  })

  describe('uses CSS variables in styles', () => {
    it('body uses design system background', () => {
      expect(settingsHtml).toContain('background: var(--color-bg-base)')
      expect(settingsHtml).toContain('color: var(--color-text-primary)')
    })

    it('inputs use design system border colors', () => {
      expect(settingsHtml).toContain('border: 1px solid var(--color-border-default)')
      expect(settingsHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('buttons use design system accent colors', () => {
      expect(settingsHtml).toContain('background: var(--color-accent-success)')
      expect(settingsHtml).toContain('background: var(--color-accent-success-hover)')
    })

    it('secondary buttons use surface colors', () => {
      expect(settingsHtml).toContain('background: var(--color-surface-default)')
      expect(settingsHtml).toContain('background: var(--color-surface-hover)')
    })
  })

  describe('solid borders for separation', () => {
    it('section header uses solid border', () => {
      expect(settingsHtml).toContain('border-bottom: 1px solid var(--color-border-default)')
    })

    it('persona items use solid borders', () => {
      expect(settingsHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('persona form uses solid border', () => {
      expect(settingsHtml).toContain('border: 1px solid var(--color-border-focus)')
    })
  })

  describe('status messages use design system', () => {
    it('success status uses design system colors', () => {
      expect(settingsHtml).toContain('background: var(--color-status-success-bg)')
      expect(settingsHtml).toContain('color: var(--color-status-success-text)')
    })

    it('error status uses design system colors', () => {
      expect(settingsHtml).toContain('background: var(--color-status-error-bg)')
      expect(settingsHtml).toContain('color: var(--color-status-error-text)')
    })
  })

  describe('spacing uses CSS variables', () => {
    it('defines spacing CSS variables', () => {
      expect(settingsHtml).toContain('--spacing-1: 4px')
      expect(settingsHtml).toContain('--spacing-2: 8px')
      expect(settingsHtml).toContain('--spacing-4: 16px')
      expect(settingsHtml).toContain('--spacing-8: 32px')
    })

    it('elements use spacing variables', () => {
      expect(settingsHtml).toContain('margin-bottom: var(--spacing-5)')
      expect(settingsHtml).toContain('padding: var(--spacing-2)')
    })
  })

  describe('border radius uses CSS variables', () => {
    it('defines radius CSS variables', () => {
      expect(settingsHtml).toContain('--radius-sm: 4px')
      expect(settingsHtml).toContain('--radius-md: 6px')
      expect(settingsHtml).toContain('--radius-lg: 8px')
    })

    it('elements use radius variables', () => {
      expect(settingsHtml).toContain('border-radius: var(--radius-md)')
    })
  })

  describe('transitions use CSS variables', () => {
    it('defines transition CSS variables', () => {
      expect(settingsHtml).toContain('--transition-fast: 0.1s ease')
      expect(settingsHtml).toContain('--transition-default: 0.15s ease')
    })

    it('elements use transition variables', () => {
      expect(settingsHtml).toContain('transition: background var(--transition-default)')
      expect(settingsHtml).toContain('transition: border-color var(--transition-default)')
    })
  })

  describe('no hardcoded colors in inline styles', () => {
    it('small elements do not have hardcoded color styles', () => {
      // Check that inline style="color: #xxx" patterns are removed
      const smallTags = settingsHtml.match(/<small[^>]*style="[^"]*color:\s*#[^"]*"[^>]*>/gi)
      expect(smallTags).toBeNull()
    })

    it('links do not have hardcoded color styles', () => {
      // Check that inline style="color: #xxx" patterns on links are removed
      const linkTags = settingsHtml.match(/<a[^>]*style="[^"]*color:\s*#[^"]*"[^>]*>/gi)
      expect(linkTags).toBeNull()
    })
  })

  describe('flat input styling', () => {
    it('inputs have hover state with border color change', () => {
      expect(settingsHtml).toContain('input:hover')
      expect(settingsHtml).toContain('border-color: var(--color-border-strong)')
    })

    it('inputs have focus state with border color change', () => {
      expect(settingsHtml).toContain('input:focus')
      expect(settingsHtml).toContain('border-color: var(--color-border-focus)')
      expect(settingsHtml).toContain('outline: none')
    })
  })
})
