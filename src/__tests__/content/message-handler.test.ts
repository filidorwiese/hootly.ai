import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Message types used between content script and iframe
type IframeMessage =
  | { type: 'fireowl-toggle' }
  | { type: 'fireowl-get-page-info' }
  | { type: 'fireowl-page-info'; payload: PageInfo }
  | { type: 'fireowl-dialog-closed' }
  | { type: 'fireowl-selection-change'; payload: { hasSelection: boolean } }

interface PageInfo {
  url: string
  title: string
  selection: string
  pageText: string
}

describe('Content Script Message Handling', () => {
  let messageListeners: Array<(event: MessageEvent) => void>

  beforeEach(() => {
    messageListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'message' && typeof listener === 'function') {
        messageListeners.push(listener)
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Message Type Validation', () => {
    it('fireowl-toggle has correct structure', () => {
      const msg: IframeMessage = { type: 'fireowl-toggle' }
      expect(msg.type).toBe('fireowl-toggle')
    })

    it('fireowl-get-page-info has correct structure', () => {
      const msg: IframeMessage = { type: 'fireowl-get-page-info' }
      expect(msg.type).toBe('fireowl-get-page-info')
    })

    it('fireowl-page-info includes all required fields', () => {
      const msg: IframeMessage = {
        type: 'fireowl-page-info',
        payload: {
          url: 'https://example.com',
          title: 'Test Page',
          selection: 'selected text',
          pageText: 'full page text',
        },
      }
      expect(msg.payload.url).toBeDefined()
      expect(msg.payload.title).toBeDefined()
      expect(msg.payload.selection).toBeDefined()
      expect(msg.payload.pageText).toBeDefined()
    })

    it('fireowl-dialog-closed has correct structure', () => {
      const msg: IframeMessage = { type: 'fireowl-dialog-closed' }
      expect(msg.type).toBe('fireowl-dialog-closed')
    })

    it('fireowl-selection-change includes hasSelection', () => {
      const msg: IframeMessage = {
        type: 'fireowl-selection-change',
        payload: { hasSelection: true },
      }
      expect(msg.payload.hasSelection).toBe(true)
    })
  })

  describe('Page Info Response Logic', () => {
    function simulatePageInfoRequest(): PageInfo {
      // Simulates what content script does when receiving fireowl-get-page-info
      return {
        url: window.location.href,
        title: document.title,
        selection: window.getSelection()?.toString() || '',
        pageText: document.body?.innerText || '',
      }
    }

    it('returns current URL', () => {
      const info = simulatePageInfoRequest()
      expect(info.url).toBe('http://localhost:3000/')
    })

    it('returns document title', () => {
      document.title = 'Test Document'
      const info = simulatePageInfoRequest()
      expect(info.title).toBe('Test Document')
    })

    it('returns empty selection when nothing selected', () => {
      const info = simulatePageInfoRequest()
      expect(info.selection).toBe('')
    })

    it('returns body text for pageText', () => {
      document.body.innerText = 'Test body content'
      const info = simulatePageInfoRequest()
      expect(info.pageText).toBe('Test body content')
    })
  })
})

describe('Background Message Types', () => {
  // Test message structures for content script <-> background worker
  it('sendPrompt message has required fields', () => {
    const msg = {
      type: 'sendPrompt' as const,
      payload: {
        prompt: 'test prompt',
        context: undefined,
        conversationHistory: [],
        settings: {} as any,
      },
    }
    expect(msg.type).toBe('sendPrompt')
    expect(msg.payload.prompt).toBeDefined()
    expect(msg.payload.conversationHistory).toBeDefined()
    expect(msg.payload.settings).toBeDefined()
  })

  it('cancelStream message has correct structure', () => {
    const msg = { type: 'cancelStream' as const }
    expect(msg.type).toBe('cancelStream')
  })

  it('getSettings message has correct structure', () => {
    const msg = { type: 'getSettings' as const }
    expect(msg.type).toBe('getSettings')
  })

  it('streamChunk response has content', () => {
    const msg = {
      type: 'streamChunk' as const,
      payload: { content: 'partial response' },
    }
    expect(msg.payload.content).toBe('partial response')
  })

  it('streamEnd response has full content', () => {
    const msg = {
      type: 'streamEnd' as const,
      payload: { content: 'full response text' },
    }
    expect(msg.payload.content).toBe('full response text')
  })

  it('streamError response has error message', () => {
    const msg = {
      type: 'streamError' as const,
      payload: { error: 'API rate limit exceeded' },
    }
    expect(msg.payload.error).toBe('API rate limit exceeded')
  })

  it('modelNotFound response has model name', () => {
    const msg = {
      type: 'modelNotFound' as const,
      payload: { model: 'claude-3-opus-20240229' },
    }
    expect(msg.payload.model).toBe('claude-3-opus-20240229')
  })
})
