import { describe, it, expect } from 'vitest'

// Extract parseShortcut logic for testing (mirrors content/index.tsx)
function parseShortcut(shortcut: string): {
  key: string
  alt: boolean
  ctrl: boolean
  shift: boolean
  meta: boolean
} {
  const parts = shortcut.toLowerCase().split('+')
  const modifiers = {
    alt: parts.includes('alt'),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  }
  const key = parts[parts.length - 1]
  return { key, ...modifiers }
}

describe('parseShortcut', () => {
  describe('single modifier shortcuts', () => {
    it('parses Alt+C', () => {
      const result = parseShortcut('Alt+C')
      expect(result).toEqual({
        key: 'c',
        alt: true,
        ctrl: false,
        shift: false,
        meta: false,
      })
    })

    it('parses Ctrl+K', () => {
      const result = parseShortcut('Ctrl+K')
      expect(result).toEqual({
        key: 'k',
        alt: false,
        ctrl: true,
        shift: false,
        meta: false,
      })
    })

    it('parses Control+K (alternate spelling)', () => {
      const result = parseShortcut('Control+K')
      expect(result).toEqual({
        key: 'k',
        alt: false,
        ctrl: true,
        shift: false,
        meta: false,
      })
    })

    it('parses Shift+Space', () => {
      const result = parseShortcut('Shift+Space')
      expect(result).toEqual({
        key: 'space',
        alt: false,
        ctrl: false,
        shift: true,
        meta: false,
      })
    })

    it('parses Meta+O', () => {
      const result = parseShortcut('Meta+O')
      expect(result).toEqual({
        key: 'o',
        alt: false,
        ctrl: false,
        shift: false,
        meta: true,
      })
    })

    it('parses Cmd+O (Mac-style)', () => {
      const result = parseShortcut('Cmd+O')
      expect(result).toEqual({
        key: 'o',
        alt: false,
        ctrl: false,
        shift: false,
        meta: true,
      })
    })

    it('parses Command+O (Mac-style full)', () => {
      const result = parseShortcut('Command+O')
      expect(result).toEqual({
        key: 'o',
        alt: false,
        ctrl: false,
        shift: false,
        meta: true,
      })
    })
  })

  describe('multiple modifier shortcuts', () => {
    it('parses Alt+Shift+C', () => {
      const result = parseShortcut('Alt+Shift+C')
      expect(result).toEqual({
        key: 'c',
        alt: true,
        ctrl: false,
        shift: true,
        meta: false,
      })
    })

    it('parses Ctrl+Shift+K', () => {
      const result = parseShortcut('Ctrl+Shift+K')
      expect(result).toEqual({
        key: 'k',
        alt: false,
        ctrl: true,
        shift: true,
        meta: false,
      })
    })

    it('parses Ctrl+Alt+Delete', () => {
      const result = parseShortcut('Ctrl+Alt+Delete')
      expect(result).toEqual({
        key: 'delete',
        alt: true,
        ctrl: true,
        shift: false,
        meta: false,
      })
    })

    it('parses Cmd+Shift+Enter', () => {
      const result = parseShortcut('Cmd+Shift+Enter')
      expect(result).toEqual({
        key: 'enter',
        alt: false,
        ctrl: false,
        shift: true,
        meta: true,
      })
    })

    it('parses all modifiers', () => {
      const result = parseShortcut('Ctrl+Alt+Shift+Meta+X')
      expect(result).toEqual({
        key: 'x',
        alt: true,
        ctrl: true,
        shift: true,
        meta: true,
      })
    })
  })

  describe('case insensitivity', () => {
    it('handles lowercase input', () => {
      const result = parseShortcut('alt+c')
      expect(result.alt).toBe(true)
      expect(result.key).toBe('c')
    })

    it('handles uppercase input', () => {
      const result = parseShortcut('ALT+C')
      expect(result.alt).toBe(true)
      expect(result.key).toBe('c')
    })

    it('handles mixed case input', () => {
      const result = parseShortcut('AlT+sHiFt+C')
      expect(result.alt).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.key).toBe('c')
    })
  })

  describe('special keys', () => {
    it('parses function keys', () => {
      const result = parseShortcut('Ctrl+F1')
      expect(result.key).toBe('f1')
      expect(result.ctrl).toBe(true)
    })

    it('parses Escape', () => {
      const result = parseShortcut('Alt+Escape')
      expect(result.key).toBe('escape')
      expect(result.alt).toBe(true)
    })

    it('parses Tab', () => {
      const result = parseShortcut('Ctrl+Tab')
      expect(result.key).toBe('tab')
      expect(result.ctrl).toBe(true)
    })

    it('parses number keys', () => {
      const result = parseShortcut('Alt+1')
      expect(result.key).toBe('1')
      expect(result.alt).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles single key (no modifier)', () => {
      const result = parseShortcut('C')
      expect(result).toEqual({
        key: 'c',
        alt: false,
        ctrl: false,
        shift: false,
        meta: false,
      })
    })

    it('handles empty string', () => {
      const result = parseShortcut('')
      expect(result.key).toBe('')
      expect(result.alt).toBe(false)
    })

    it('handles modifier-only string (key becomes modifier name)', () => {
      const result = parseShortcut('Alt')
      expect(result.key).toBe('alt')
      expect(result.alt).toBe(true)
    })
  })
})
