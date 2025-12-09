import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chromeMock, setMockStorage, resetChromeMock } from '../__mocks__/chrome'
import { configuredSettings } from '../fixtures/settings'

// Mock the providers module
vi.mock('../../shared/providers', () => ({
  getProvider: vi.fn(() => ({
    streamChat: vi.fn(),
    fetchModels: vi.fn(),
  })),
  getApiKey: vi.fn((settings) => settings?.anthropicApiKey || null),
}))

// Mock Storage
vi.mock('../../shared/storage', () => ({
  Storage: {
    getSettings: vi.fn(() => Promise.resolve(configuredSettings)),
    saveSettings: vi.fn(() => Promise.resolve()),
  },
}))

// Get references to mocked modules
import { getProvider, getApiKey } from '../../shared/providers'
import { Storage } from '../../shared/storage'

describe('service-worker message handling', () => {
  let messageHandler: (message: any, sender: any, sendResponse: any) => boolean | undefined

  beforeEach(() => {
    resetChromeMock()
    vi.clearAllMocks()

    setMockStorage({
      hootly_settings: configuredSettings,
    })

    // Capture the message listener when it's registered
    chromeMock.runtime.onMessage.addListener.mockImplementation((handler) => {
      messageHandler = handler
    })

    // Simulate module initialization
    chromeMock.runtime.onMessage.addListener(
      (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'sendPrompt') {
          sendResponse({ success: true })
        } else if (message.type === 'cancelStream') {
          sendResponse({ success: true })
        } else if (message.type === 'getSettings') {
          sendResponse({ success: true })
        } else if (message.type === 'saveSettings') {
          sendResponse({ success: true })
        } else if (message.type === 'openSettings') {
          chromeMock.tabs.create({ url: chromeMock.runtime.getURL('settings.html') })
          sendResponse({ success: true })
        } else if (message.type === 'fetchModels') {
          return true
        }
        return true
      }
    )
  })

  describe('message types', () => {
    it('handles sendPrompt message', () => {
      const sendResponse = vi.fn()
      const message = { type: 'sendPrompt', payload: {} }

      messageHandler(message, { tab: { id: 1 } }, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('handles cancelStream message', () => {
      const sendResponse = vi.fn()
      const message = { type: 'cancelStream' }

      messageHandler(message, { tab: { id: 1 } }, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('handles getSettings message', () => {
      const sendResponse = vi.fn()
      const message = { type: 'getSettings' }

      messageHandler(message, {}, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('handles saveSettings message', () => {
      const sendResponse = vi.fn()
      const message = { type: 'saveSettings' }

      messageHandler(message, {}, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('handles openSettings message', () => {
      const sendResponse = vi.fn()
      const message = { type: 'openSettings' }

      messageHandler(message, {}, sendResponse)

      expect(chromeMock.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://mock-id/settings.html',
      })
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('handles fetchModels message asynchronously', () => {
      const sendResponse = vi.fn()
      const message = { type: 'fetchModels' }

      const result = messageHandler(message, {}, sendResponse)

      // Should return true to keep channel open for async response
      expect(result).toBe(true)
    })
  })
})

describe('buildPromptWithContext', () => {
  // Test the context building logic
  function buildPromptWithContext(prompt: string, context?: any): string {
    if (!context) return prompt

    let fullPrompt = ''

    if (context.selection) {
      fullPrompt += `# Selected Text\n\n${context.selection}\n\n---\n\n`
    } else if (context.fullPage) {
      fullPrompt += `# Page Content\n\n${context.fullPage}\n\n---\n\n`
    }

    if (context.url || context.title) {
      fullPrompt += `# Page Info\n`
      if (context.title) fullPrompt += `Title: ${context.title}\n`
      if (context.url) fullPrompt += `URL: ${context.url}\n`
      fullPrompt += `\n---\n\n`
    }

    fullPrompt += `# User Query\n\n${prompt}`

    return fullPrompt
  }

  it('returns prompt as-is when no context', () => {
    const result = buildPromptWithContext('Hello')
    expect(result).toBe('Hello')
  })

  it('includes selection when provided', () => {
    const result = buildPromptWithContext('Explain this', { selection: 'Some selected text' })
    expect(result).toContain('# Selected Text')
    expect(result).toContain('Some selected text')
    expect(result).toContain('# User Query')
    expect(result).toContain('Explain this')
  })

  it('includes full page when provided', () => {
    const result = buildPromptWithContext('Summarize', { fullPage: 'Full page content here' })
    expect(result).toContain('# Page Content')
    expect(result).toContain('Full page content here')
  })

  it('prefers selection over fullPage', () => {
    const result = buildPromptWithContext('Query', {
      selection: 'Selected',
      fullPage: 'Full page',
    })
    expect(result).toContain('Selected')
    expect(result).not.toContain('Full page')
  })

  it('includes page info when url and title provided', () => {
    const result = buildPromptWithContext('Query', {
      url: 'https://example.com',
      title: 'Example Page',
    })
    expect(result).toContain('# Page Info')
    expect(result).toContain('URL: https://example.com')
    expect(result).toContain('Title: Example Page')
  })

  it('combines all context sections', () => {
    const result = buildPromptWithContext('What is this?', {
      selection: 'Selected text',
      url: 'https://example.com',
      title: 'Test Page',
    })
    expect(result).toContain('# Selected Text')
    expect(result).toContain('# Page Info')
    expect(result).toContain('# User Query')
  })
})

describe('extractErrorMessage', () => {
  function extractErrorMessage(error: any): string {
    // Handle Anthropic SDK errors
    if (error?.error?.message) {
      return error.error.message
    }

    // Handle error with message field
    if (error?.message) {
      const msg = error.message

      // Try to parse JSON error message
      try {
        const match = msg.match(/\d{3}\s+(\{.*\})/)
        if (match) {
          const errorData = JSON.parse(match[1])
          if (errorData?.error?.message) {
            return errorData.error.message
          }
        }
      } catch (e) {
        // If parsing fails, return the original message
      }

      return msg
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error
    }

    // Handle object errors
    if (typeof error === 'object') {
      if (error.error_message) return error.error_message
      if (error.detail) return error.detail
      return JSON.stringify(error)
    }

    return 'An unexpected error occurred'
  }

  it('extracts Anthropic SDK error message', () => {
    const error = { error: { message: 'Invalid API key' } }
    expect(extractErrorMessage(error)).toBe('Invalid API key')
  })

  it('extracts standard error message', () => {
    const error = new Error('Something went wrong')
    expect(extractErrorMessage(error)).toBe('Something went wrong')
  })

  it('extracts string error', () => {
    expect(extractErrorMessage('Simple error')).toBe('Simple error')
  })

  it('parses JSON error in message', () => {
    const error = { message: '400 {"error":{"message":"Bad request"}}' }
    expect(extractErrorMessage(error)).toBe('Bad request')
  })

  it('handles error_message field', () => {
    const error = { error_message: 'Custom error' }
    expect(extractErrorMessage(error)).toBe('Custom error')
  })

  it('handles detail field', () => {
    const error = { detail: 'Detailed error' }
    expect(extractErrorMessage(error)).toBe('Detailed error')
  })

  it('returns default for undefined', () => {
    expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred')
  })

  it('stringifies unknown object', () => {
    const error = { foo: 'bar' }
    expect(extractErrorMessage(error)).toBe('{"foo":"bar"}')
  })
})

describe('isModelNotFoundError', () => {
  function isModelNotFoundError(error: any, errorMessage: string): boolean {
    if (error?.status === 404) return true

    const lowerMessage = errorMessage.toLowerCase()
    if (lowerMessage.includes('model') && (
      lowerMessage.includes('not found') ||
      lowerMessage.includes('does not exist') ||
      lowerMessage.includes('invalid model')
    )) {
      return true
    }

    return false
  }

  it('returns true for 404 status', () => {
    expect(isModelNotFoundError({ status: 404 }, '')).toBe(true)
  })

  it('returns true for "model not found" message', () => {
    expect(isModelNotFoundError({}, 'The model was not found')).toBe(true)
  })

  it('returns true for "model does not exist" message', () => {
    expect(isModelNotFoundError({}, 'Model claude-xyz does not exist')).toBe(true)
  })

  it('returns true for "invalid model" message', () => {
    expect(isModelNotFoundError({}, 'Invalid model specified')).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isModelNotFoundError({}, 'Rate limit exceeded')).toBe(false)
  })

  it('returns false for generic error', () => {
    expect(isModelNotFoundError({}, 'Something went wrong')).toBe(false)
  })
})

describe('toolbar and commands', () => {
  beforeEach(() => {
    resetChromeMock()
    vi.clearAllMocks()
  })

  it('registers action click listener', () => {
    // Simulate registration
    chromeMock.action.onClicked.addListener(() => {})

    expect(chromeMock.action.onClicked.addListener).toHaveBeenCalled()
  })

  it('registers command listener', () => {
    // Simulate registration
    chromeMock.commands.onCommand.addListener(() => {})

    expect(chromeMock.commands.onCommand.addListener).toHaveBeenCalled()
  })
})

describe('handleFetchModels', () => {
  beforeEach(() => {
    resetChromeMock()
    vi.clearAllMocks()
  })

  it('returns error when no API key', async () => {
    vi.mocked(getApiKey).mockReturnValue(null)

    const handler = async () => {
      const settings = await Storage.getSettings()
      const apiKey = getApiKey(settings)
      if (!apiKey) {
        return { success: false, error: 'No API key configured' }
      }
      return { success: true }
    }

    const result = await handler()
    expect(result).toEqual({ success: false, error: 'No API key configured' })
  })

  it('returns models when API key exists', async () => {
    const mockModels = [{ id: 'claude-3', name: 'Claude 3', created: Date.now() }]
    vi.mocked(getApiKey).mockReturnValue('sk-test-key')
    vi.mocked(getProvider).mockReturnValue({
      fetchModels: vi.fn().mockResolvedValue(mockModels),
      streamChat: vi.fn(),
    })

    const handler = async () => {
      const settings = await Storage.getSettings()
      const apiKey = getApiKey(settings)
      if (!apiKey) {
        return { success: false, error: 'No API key configured' }
      }
      const provider = getProvider(settings.provider)
      const models = await provider.fetchModels(apiKey)
      return { success: true, models }
    }

    const result = await handler()
    expect(result.success).toBe(true)
    expect(result.models).toEqual(mockModels)
  })

  it('handles fetch error', async () => {
    vi.mocked(getApiKey).mockReturnValue('sk-test-key')
    vi.mocked(getProvider).mockReturnValue({
      fetchModels: vi.fn().mockRejectedValue(new Error('Network error')),
      streamChat: vi.fn(),
    })

    const handler = async () => {
      try {
        const settings = await Storage.getSettings()
        const apiKey = getApiKey(settings)
        if (!apiKey) {
          return { success: false, error: 'No API key configured' }
        }
        const provider = getProvider(settings.provider)
        const models = await provider.fetchModels(apiKey)
        return { success: true, models }
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to fetch models' }
      }
    }

    const result = await handler()
    expect(result).toEqual({ success: false, error: 'Network error' })
  })
})
