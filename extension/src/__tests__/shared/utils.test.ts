import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateId, extractPageText } from '../../shared/utils'

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('contains timestamp prefix', () => {
    const before = Date.now()
    const id = generateId()
    const after = Date.now()
    const timestamp = parseInt(id.split('-')[0], 10)
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })

  it('generates unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })

  it('has correct format (timestamp-randomstring)', () => {
    const id = generateId()
    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })
})

describe('extractPageText', () => {
  it('truncates text exceeding maxLength', () => {
    // Mock document.body.innerText
    const longText = 'x'.repeat(200)
    Object.defineProperty(document.body, 'innerText', {
      value: longText,
      writable: true,
      configurable: true,
    })

    const result = extractPageText({
      includeScripts: false,
      includeStyles: false,
      maxLength: 100,
    })

    expect(result.length).toBeLessThan(200)
    expect(result).toContain('[Content truncated due to length limit]')
  })

  it('returns full text when under maxLength', () => {
    const shortText = 'Short content'
    Object.defineProperty(document.body, 'innerText', {
      value: shortText,
      writable: true,
      configurable: true,
    })

    const result = extractPageText({
      includeScripts: false,
      includeStyles: false,
      maxLength: 1000,
    })

    expect(result).toBe(shortText)
  })

  it('trims whitespace', () => {
    Object.defineProperty(document.body, 'innerText', {
      value: '  text with spaces  ',
      writable: true,
      configurable: true,
    })

    const result = extractPageText({
      includeScripts: false,
      includeStyles: false,
      maxLength: 1000,
    })

    expect(result).toBe('text with spaces')
  })
})
