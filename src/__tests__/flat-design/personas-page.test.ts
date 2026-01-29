import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * FD-5: Update personas page to flat design
 *
 * Verify that:
 * - No box-shadow definitions in CSS
 * - All colors use CSS variables from design system
 * - Solid borders used for persona cards/items
 * - Action buttons use flat styles
 * - Modal and form elements use flat design
 * - Consistent flat appearance with rest of extension
 */

describe('FD-5: Personas page flat design', () => {
  let personasHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../personas/index.html')
    personasHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('CSS variable definitions', () => {
    it('defines primary color CSS variables', () => {
      expect(personasHtml).toContain('--color-primary-50: #E8F0EA')
      expect(personasHtml).toContain('--color-primary-500: #3A5A40')
      expect(personasHtml).toContain('--color-primary-600: #2D4733')
    })

    it('defines background color CSS variables', () => {
      expect(personasHtml).toContain('--color-bg-base: #FAFBF9')
      expect(personasHtml).toContain('--color-bg-elevated: #FFFFFF')
      expect(personasHtml).toContain('--color-bg-muted: #F5F7F4')
    })

    it('defines surface color CSS variables', () => {
      expect(personasHtml).toContain('--color-surface-default: #FFFFFF')
      expect(personasHtml).toContain('--color-surface-hover: #F5F7F4')
      expect(personasHtml).toContain('--color-surface-active: #EEF1EC')
    })

    it('defines border color CSS variables', () => {
      expect(personasHtml).toContain('--color-border-light: #E4E8E2')
      expect(personasHtml).toContain('--color-border-default: #D4DCD6')
      expect(personasHtml).toContain('--color-border-strong: #B8C4BC')
      expect(personasHtml).toContain('--color-border-focus: #4A7C54')
    })

    it('defines text color CSS variables', () => {
      expect(personasHtml).toContain('--color-text-primary: #2D3A30')
      expect(personasHtml).toContain('--color-text-secondary: #6B7A6E')
      expect(personasHtml).toContain('--color-text-tertiary: #8A9A8C')
      expect(personasHtml).toContain('--color-text-inverse: #FFFFFF')
    })

    it('defines accent color CSS variables', () => {
      expect(personasHtml).toContain('--color-accent-success: #4A7C54')
      expect(personasHtml).toContain('--color-accent-error: #C45A5A')
      expect(personasHtml).toContain('--color-accent-error-hover: #A54444')
    })
  })

  describe('no shadows in styling', () => {
    it('does not contain box-shadow properties', () => {
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()

      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })

    it('modal does not have shadow', () => {
      // Previously had: box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15)
      expect(personasHtml).not.toContain('0 8px 24px rgba')
    })

    it('confirm-box does not have shadow', () => {
      expect(personasHtml).not.toContain('rgba(0, 0, 0, 0.15)')
    })
  })

  describe('uses CSS variables for colors', () => {
    it('body uses design system background', () => {
      expect(personasHtml).toContain('background: var(--color-bg-base)')
      expect(personasHtml).toContain('color: var(--color-text-primary)')
    })

    it('persona items use design system colors', () => {
      expect(personasHtml).toContain('background: var(--color-surface-default)')
      expect(personasHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('persona names use text primary color', () => {
      expect(personasHtml).toContain('color: var(--color-text-primary)')
    })

    it('text elements use text colors from design system', () => {
      expect(personasHtml).toContain('color: var(--color-text-secondary)')
    })
  })

  describe('buttons use flat design', () => {
    it('add button uses primary colors', () => {
      expect(personasHtml).toContain('background: var(--color-primary-500)')
      expect(personasHtml).toContain('color: var(--color-text-inverse)')
    })

    it('add button hover uses darker primary', () => {
      expect(personasHtml).toContain('background: var(--color-primary-600)')
    })

    it('action buttons use surface colors on hover', () => {
      expect(personasHtml).toContain('background: var(--color-surface-hover)')
    })

    it('delete button uses error color on hover', () => {
      expect(personasHtml).toContain('color: var(--color-accent-error)')
    })

    it('set-default button uses primary tints', () => {
      expect(personasHtml).toContain('background: var(--color-primary-50)')
      expect(personasHtml).toContain('background: var(--color-primary-100)')
    })

    it('danger button uses error colors', () => {
      expect(personasHtml).toContain('.btn-danger')
      expect(personasHtml).toContain('background: var(--color-accent-error)')
      expect(personasHtml).toContain('background: var(--color-accent-error-hover)')
    })

    it('secondary button uses surface colors', () => {
      expect(personasHtml).toContain('.btn-secondary')
      expect(personasHtml).toContain('border-color: var(--color-border-default)')
    })
  })

  describe('solid borders for cards and separation', () => {
    it('header uses solid bottom border', () => {
      expect(personasHtml).toContain('border-bottom: 1px solid var(--color-border-light)')
    })

    it('persona items use solid borders', () => {
      expect(personasHtml).toContain('.persona-item {')
      expect(personasHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('persona item hover changes border color', () => {
      expect(personasHtml).toContain('.persona-item:hover')
      expect(personasHtml).toContain('border-color: var(--color-border-strong)')
    })

    it('default persona uses primary border color', () => {
      expect(personasHtml).toContain('.persona-item.default')
      expect(personasHtml).toContain('border-color: var(--color-primary-500)')
    })
  })

  describe('modal uses flat design', () => {
    it('modal uses elevated background', () => {
      expect(personasHtml).toContain('background: var(--color-bg-elevated)')
    })

    it('modal uses solid border instead of shadow', () => {
      expect(personasHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('modal overlay uses muted background', () => {
      // Dark overlay with slight transparency
      expect(personasHtml).toContain('rgba(45, 58, 48')
    })
  })

  describe('form inputs use flat design', () => {
    it('inputs use surface background', () => {
      expect(personasHtml).toContain('background: var(--color-surface-default)')
    })

    it('inputs have solid border', () => {
      expect(personasHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('inputs hover changes border color', () => {
      expect(personasHtml).toContain('.form-group input:hover')
      expect(personasHtml).toContain('border-color: var(--color-border-strong)')
    })

    it('inputs focus uses focus border color', () => {
      expect(personasHtml).toContain('.form-group input:focus')
      expect(personasHtml).toContain('border-color: var(--color-border-focus)')
      expect(personasHtml).toContain('outline: none')
    })

    it('focus does not use box-shadow glow', () => {
      // Previously had: box-shadow: 0 0 0 3px rgba(58, 90, 64, 0.1)
      const styleMatch = personasHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('0 0 0 3px rgba')
    })
  })

  describe('icon picker uses flat design', () => {
    it('icon options use solid borders', () => {
      expect(personasHtml).toContain('border: 2px solid var(--color-border-light)')
    })

    it('icon option hover changes border color', () => {
      expect(personasHtml).toContain('.icon-option:hover')
      expect(personasHtml).toContain('border-color: var(--color-border-strong)')
    })

    it('selected icon uses primary colors', () => {
      expect(personasHtml).toContain('.icon-option.selected')
      expect(personasHtml).toContain('border-color: var(--color-primary-500)')
      expect(personasHtml).toContain('background: var(--color-primary-50)')
    })
  })

  describe('spacing uses CSS variables', () => {
    it('defines spacing CSS variables', () => {
      expect(personasHtml).toContain('--spacing-1: 4px')
      expect(personasHtml).toContain('--spacing-2: 8px')
      expect(personasHtml).toContain('--spacing-3: 12px')
      expect(personasHtml).toContain('--spacing-4: 16px')
      expect(personasHtml).toContain('--spacing-8: 32px')
    })

    it('elements use spacing variables', () => {
      expect(personasHtml).toContain('padding: var(--spacing-4)')
      expect(personasHtml).toContain('margin-bottom: var(--spacing-3)')
      expect(personasHtml).toContain('gap: var(--spacing-2)')
    })
  })

  describe('border radius uses CSS variables', () => {
    it('defines radius CSS variables', () => {
      expect(personasHtml).toContain('--radius-sm: 4px')
      expect(personasHtml).toContain('--radius-md: 6px')
      expect(personasHtml).toContain('--radius-lg: 8px')
      expect(personasHtml).toContain('--radius-xl: 10px')
      expect(personasHtml).toContain('--radius-2xl: 12px')
    })

    it('elements use radius variables', () => {
      expect(personasHtml).toContain('border-radius: var(--radius-md)')
      expect(personasHtml).toContain('border-radius: var(--radius-xl)')
      expect(personasHtml).toContain('border-radius: var(--radius-2xl)')
    })
  })

  describe('transitions use CSS variables', () => {
    it('defines transition CSS variables', () => {
      expect(personasHtml).toContain('--transition-fast: 0.1s ease')
      expect(personasHtml).toContain('--transition-default: 0.15s ease')
    })

    it('elements use transition variables', () => {
      expect(personasHtml).toContain('transition: background var(--transition-default)')
      expect(personasHtml).toContain('transition: border-color var(--transition-default)')
    })
  })

  describe('font sizes use CSS variables', () => {
    it('defines font size CSS variables', () => {
      expect(personasHtml).toContain('--font-size-xs: 10px')
      expect(personasHtml).toContain('--font-size-sm: 12px')
      expect(personasHtml).toContain('--font-size-base: 14px')
      expect(personasHtml).toContain('--font-size-xl: 16px')
      expect(personasHtml).toContain('--font-size-2xl: 18px')
    })

    it('elements use font size variables', () => {
      expect(personasHtml).toContain('font-size: var(--font-size-base)')
      expect(personasHtml).toContain('font-size: var(--font-size-xl)')
      expect(personasHtml).toContain('font-size: var(--font-size-md)')
    })
  })

  describe('empty state uses flat design', () => {
    it('empty state uses surface background', () => {
      expect(personasHtml).toContain('.empty-state')
      expect(personasHtml).toContain('background: var(--color-surface-default)')
    })

    it('empty state uses dashed border', () => {
      expect(personasHtml).toContain('border: 1px dashed var(--color-border-light)')
    })

    it('empty state text uses tertiary color', () => {
      expect(personasHtml).toContain('color: var(--color-text-tertiary)')
    })
  })

  describe('confirm dialog uses flat design', () => {
    it('confirm box uses elevated background', () => {
      expect(personasHtml).toContain('.confirm-box')
      expect(personasHtml).toContain('background: var(--color-bg-elevated)')
    })

    it('confirm box uses solid border instead of shadow', () => {
      // Should have border defined in .confirm-box
      expect(personasHtml).toContain('border: 1px solid var(--color-border-default)')
    })
  })
})
