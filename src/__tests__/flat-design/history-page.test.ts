import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * FD-6: Update history page to flat design
 *
 * Verify that:
 * - No box-shadow definitions in CSS
 * - All colors use CSS variables from design system
 * - Solid borders used for history items
 * - Action buttons use flat styles
 * - Date group headers use flat styling
 * - Confirm dialog uses flat design (no shadow)
 * - Input areas use flat design (no glow)
 * - Consistent flat appearance with rest of extension
 */

describe('FD-6: History page flat design', () => {
  let historyHtml: string

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../../history/index.html')
    historyHtml = fs.readFileSync(htmlPath, 'utf-8')
  })

  describe('CSS variable definitions', () => {
    it('defines primary color CSS variables', () => {
      expect(historyHtml).toContain('--color-primary-50: #E8F0EA')
      expect(historyHtml).toContain('--color-primary-500: #3A5A40')
      expect(historyHtml).toContain('--color-primary-600: #2D4733')
    })

    it('defines background color CSS variables', () => {
      expect(historyHtml).toContain('--color-bg-base: #FAFBF9')
      expect(historyHtml).toContain('--color-bg-elevated: #FFFFFF')
      expect(historyHtml).toContain('--color-bg-muted: #F5F7F4')
      expect(historyHtml).toContain('--color-bg-subtle: #EEF1EC')
    })

    it('defines surface color CSS variables', () => {
      expect(historyHtml).toContain('--color-surface-default: #FFFFFF')
      expect(historyHtml).toContain('--color-surface-hover: #F5F7F4')
      expect(historyHtml).toContain('--color-surface-active: #EEF1EC')
      expect(historyHtml).toContain('--color-surface-disabled: #F0F2EF')
    })

    it('defines border color CSS variables', () => {
      expect(historyHtml).toContain('--color-border-light: #E4E8E2')
      expect(historyHtml).toContain('--color-border-default: #D4DCD6')
      expect(historyHtml).toContain('--color-border-strong: #B8C4BC')
      expect(historyHtml).toContain('--color-border-focus: #4A7C54')
    })

    it('defines text color CSS variables', () => {
      expect(historyHtml).toContain('--color-text-primary: #2D3A30')
      expect(historyHtml).toContain('--color-text-secondary: #6B7A6E')
      expect(historyHtml).toContain('--color-text-tertiary: #8A9A8C')
      expect(historyHtml).toContain('--color-text-inverse: #FFFFFF')
      expect(historyHtml).toContain('--color-text-link: #3A5A40')
    })

    it('defines accent color CSS variables', () => {
      expect(historyHtml).toContain('--color-accent-success: #4A7C54')
      expect(historyHtml).toContain('--color-accent-success-hover: #3A6A44')
      expect(historyHtml).toContain('--color-accent-error: #C45A5A')
      expect(historyHtml).toContain('--color-accent-error-hover: #A54444')
    })

    it('defines send button color CSS variables', () => {
      expect(historyHtml).toContain('--color-send-default: #99cd7e')
      expect(historyHtml).toContain('--color-send-hover: #769d60')
    })

    it('defines spacing CSS variables', () => {
      expect(historyHtml).toContain('--spacing-1: 4px')
      expect(historyHtml).toContain('--spacing-2: 8px')
      expect(historyHtml).toContain('--spacing-3: 12px')
      expect(historyHtml).toContain('--spacing-4: 16px')
    })

    it('defines border radius CSS variables', () => {
      expect(historyHtml).toContain('--radius-md: 6px')
      expect(historyHtml).toContain('--radius-lg: 8px')
      expect(historyHtml).toContain('--radius-xl: 10px')
      expect(historyHtml).toContain('--radius-2xl: 12px')
    })

    it('defines font size CSS variables', () => {
      expect(historyHtml).toContain('--font-size-xs: 10px')
      expect(historyHtml).toContain('--font-size-sm: 12px')
      expect(historyHtml).toContain('--font-size-base: 14px')
    })

    it('defines transition CSS variables', () => {
      expect(historyHtml).toContain('--transition-default: 0.15s ease')
    })
  })

  describe('no shadows in styling', () => {
    it('does not contain box-shadow properties', () => {
      const styleMatch = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
      expect(styleMatch).not.toBeNull()

      const styleContent = styleMatch![1]
      expect(styleContent).not.toContain('box-shadow')
    })

    it('conversation-item hover does not have shadow', () => {
      // Previously had: box-shadow: 0 2px 8px rgba(45, 60, 48, 0.08)
      expect(historyHtml).not.toContain('0 2px 8px rgba')
    })

    it('confirm-box does not have shadow', () => {
      // Previously had: box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15)
      expect(historyHtml).not.toContain('0 8px 24px rgba')
      expect(historyHtml).not.toContain('rgba(0, 0, 0, 0.15)')
    })

    it('input-textarea focus does not have shadow', () => {
      // Previously had: box-shadow: 0 0 0 3px rgba(74, 124, 84, 0.1)
      expect(historyHtml).not.toContain('0 0 0 3px rgba')
    })
  })

  describe('uses CSS variables for colors', () => {
    it('body uses design system background', () => {
      expect(historyHtml).toContain('background: var(--color-bg-base)')
      expect(historyHtml).toContain('color: var(--color-text-primary)')
    })

    it('conversation items use design system colors', () => {
      expect(historyHtml).toContain('background: var(--color-surface-default)')
      expect(historyHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('conversation title uses text primary color', () => {
      expect(historyHtml).toContain('color: var(--color-text-primary)')
    })

    it('conversation meta uses text tertiary color', () => {
      expect(historyHtml).toContain('color: var(--color-text-tertiary)')
    })

    it('date group header uses text secondary color', () => {
      expect(historyHtml).toContain('color: var(--color-text-secondary)')
    })

    it('back link uses text link color', () => {
      expect(historyHtml).toContain('color: var(--color-text-link)')
    })

    it('send button uses design system colors', () => {
      expect(historyHtml).toContain('background: var(--color-send-default)')
      expect(historyHtml).toContain('background: var(--color-send-hover)')
    })

    it('clear button uses surface active color', () => {
      expect(historyHtml).toContain('background: var(--color-surface-active)')
    })

    it('empty state uses text tertiary color', () => {
      expect(historyHtml).toContain('color: var(--color-text-tertiary)')
    })
  })

  describe('flat design for conversation items', () => {
    it('uses solid border for items', () => {
      expect(historyHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('hover uses border focus color', () => {
      expect(historyHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('hover uses surface hover background', () => {
      expect(historyHtml).toContain('background: var(--color-surface-hover)')
    })
  })

  describe('flat design for action buttons', () => {
    it('action buttons use transparent background by default', () => {
      expect(historyHtml).toContain('.action-btn')
      expect(historyHtml).toContain('background: transparent')
    })

    it('action buttons have solid border on hover', () => {
      expect(historyHtml).toContain('border-color: var(--color-border-default)')
    })

    it('continue button uses primary background', () => {
      expect(historyHtml).toContain('background: var(--color-primary-50)')
    })

    it('delete button uses error color on hover', () => {
      expect(historyHtml).toContain('border-color: var(--color-accent-error)')
      expect(historyHtml).toContain('color: var(--color-accent-error)')
    })
  })

  describe('flat design for input area', () => {
    it('textarea uses border default color', () => {
      expect(historyHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('textarea focus uses border focus color', () => {
      expect(historyHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('textarea focus uses thicker border instead of shadow', () => {
      expect(historyHtml).toContain('border-width: 2px')
    })

    it('textarea placeholder uses text tertiary', () => {
      expect(historyHtml).toContain('color: var(--color-text-tertiary)')
    })

    it('disabled textarea uses surface disabled', () => {
      expect(historyHtml).toContain('background: var(--color-surface-disabled)')
    })
  })

  describe('flat design for confirm dialog', () => {
    it('confirm box uses solid border instead of shadow', () => {
      expect(historyHtml).toContain('border: 1px solid var(--color-border-default)')
    })

    it('confirm box uses surface default background', () => {
      expect(historyHtml).toContain('background: var(--color-surface-default)')
    })

    it('cancel button uses surface active background', () => {
      expect(historyHtml).toContain('background: var(--color-surface-active)')
    })

    it('delete button uses accent error color', () => {
      expect(historyHtml).toContain('background: var(--color-accent-error)')
      expect(historyHtml).toContain('background: var(--color-accent-error-hover)')
    })

    it('buttons have solid borders', () => {
      expect(historyHtml).toContain('border: 1px solid transparent')
      expect(historyHtml).toContain('border-color: var(--color-border-default)')
    })
  })

  describe('flat design for messages', () => {
    it('messages use solid border', () => {
      expect(historyHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('user messages use message user background', () => {
      expect(historyHtml).toContain('background: var(--color-message-user-bg)')
    })

    it('assistant messages use message assistant background', () => {
      expect(historyHtml).toContain('background: var(--color-message-assistant-bg)')
    })
  })

  describe('flat design for context toggle', () => {
    it('context toggle button uses solid border', () => {
      expect(historyHtml).toContain('border: 1.5px solid var(--color-border-default)')
    })

    it('enabled state uses border focus color', () => {
      expect(historyHtml).toContain('border-color: var(--color-border-focus)')
    })

    it('context badge uses bg subtle', () => {
      expect(historyHtml).toContain('background: var(--color-bg-subtle)')
    })

    it('selection/fullpage badges use primary colors', () => {
      expect(historyHtml).toContain('background: var(--color-primary-50)')
    })
  })

  describe('flat design for streaming/cancel', () => {
    it('streaming indicator uses bg muted', () => {
      expect(historyHtml).toContain('background: var(--color-bg-muted)')
    })

    it('streaming indicator has solid border', () => {
      expect(historyHtml).toContain('border: 1px solid var(--color-border-light)')
    })

    it('cancel hint uses bg subtle', () => {
      expect(historyHtml).toContain('background: var(--color-bg-subtle)')
    })

    it('cancel hint has solid border', () => {
      const styleContent = historyHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1]
      expect(styleContent).toContain('.cancel-hint')
      expect(styleContent).toContain('border: 1px solid var(--color-border-light)')
    })
  })

  describe('uses CSS variables for spacing and sizing', () => {
    it('uses spacing variables for padding', () => {
      expect(historyHtml).toContain('padding: var(--spacing-3)')
      expect(historyHtml).toContain('padding-top: var(--spacing-4)')
      expect(historyHtml).toContain('padding: var(--spacing-6)')
    })

    it('uses spacing variables for gaps', () => {
      expect(historyHtml).toContain('gap: var(--spacing-2)')
      expect(historyHtml).toContain('gap: var(--spacing-3)')
    })

    it('uses spacing variables for margins', () => {
      expect(historyHtml).toContain('margin-bottom: var(--spacing-3)')
      expect(historyHtml).toContain('margin-bottom: var(--spacing-4)')
    })

    it('uses radius variables for border-radius', () => {
      expect(historyHtml).toContain('border-radius: var(--radius-md)')
      expect(historyHtml).toContain('border-radius: var(--radius-lg)')
      expect(historyHtml).toContain('border-radius: var(--radius-xl)')
      expect(historyHtml).toContain('border-radius: var(--radius-2xl)')
    })

    it('uses font-size variables', () => {
      expect(historyHtml).toContain('font-size: var(--font-size-xs)')
      expect(historyHtml).toContain('font-size: var(--font-size-sm)')
      expect(historyHtml).toContain('font-size: var(--font-size-base)')
      expect(historyHtml).toContain('font-size: var(--font-size-md)')
    })

    it('uses transition variables', () => {
      expect(historyHtml).toContain('transition: all var(--transition-default)')
      expect(historyHtml).toContain('transition: background var(--transition-default)')
    })
  })
})
