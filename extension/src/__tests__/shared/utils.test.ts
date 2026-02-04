import { describe, it, expect, vi, beforeEach } from 'vitest'
import { estimateTokens, generateId, formatDate, extractPageText } from '../../shared/utils'

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('estimates tokens at ~3.5 chars per token', () => {
    // 7 chars should be ~2 tokens
    expect(estimateTokens('1234567')).toBe(2)
    // 35 chars should be 10 tokens
    expect(estimateTokens('a'.repeat(35))).toBe(10)
  })

  it('rounds up for partial tokens', () => {
    // 1 char should round up to 1 token
    expect(estimateTokens('a')).toBe(1)
    // 4 chars should round up to 2 tokens
    expect(estimateTokens('abcd')).toBe(2)
  })

  it('handles long text', () => {
    const longText = 'x'.repeat(10000)
    expect(estimateTokens(longText)).toBe(Math.ceil(10000 / 3.5))
  })
})

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

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows time for today', () => {
    const today = new Date('2024-06-15T09:30:00').getTime()
    const result = formatDate(today)
    // Should contain time format (varies by locale)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('shows "Yesterday" for yesterday', () => {
    const yesterday = new Date('2024-06-14T12:00:00').getTime()
    expect(formatDate(yesterday)).toBe('Yesterday')
  })

  it('shows "X days ago" for 2-6 days', () => {
    const threeDaysAgo = new Date('2024-06-12T12:00:00').getTime()
    expect(formatDate(threeDaysAgo)).toBe('3 days ago')

    const sixDaysAgo = new Date('2024-06-09T12:00:00').getTime()
    expect(formatDate(sixDaysAgo)).toBe('6 days ago')
  })

  it('shows locale date for 7+ days', () => {
    const twoWeeksAgo = new Date('2024-06-01T12:00:00').getTime()
    const result = formatDate(twoWeeksAgo)
    // Should be a date string, not "X days ago"
    expect(result).not.toContain('days ago')
    expect(result).not.toBe('Yesterday')
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
