import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Storage } from '../../shared/storage'
import { generateId } from '../../shared/utils'
import { getProvider, getApiKey } from '../../shared/providers'
import type { Message, Conversation, Settings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'
import { setMockStorage, resetChromeMock, getMockStorage } from '../__mocks__/chrome'
import { configuredSettings, createConversation, createMessage } from '../fixtures'

describe('Conversation Flow Integration', () => {
  beforeEach(() => {
    resetChromeMock()
  })

  describe('Full conversation lifecycle', () => {
    it('creates, updates, and retrieves conversation', async () => {
      // 1. Create new conversation
      const conv = createConversation({ title: 'Test Chat' })
      await Storage.saveConversation(conv)

      // 2. Retrieve and verify
      let conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].title).toBe('Test Chat')

      // 3. Add message
      const userMsg = createMessage({ content: 'Hello, how are you?' })
      conv.messages.push(userMsg)
      conv.updatedAt = Date.now()
      await Storage.saveConversation(conv)

      // 4. Verify message persisted
      conversations = await Storage.getConversations()
      expect(conversations[0].messages).toHaveLength(1)
      expect(conversations[0].messages[0].content).toBe('Hello, how are you?')

      // 5. Add response
      const assistantMsg = createMessage({
        role: 'assistant',
        content: 'I am doing well, thank you!',
      })
      conv.messages.push(assistantMsg)
      conv.updatedAt = Date.now()
      await Storage.saveConversation(conv)

      // 6. Final verification
      conversations = await Storage.getConversations()
      expect(conversations[0].messages).toHaveLength(2)
    })

    it('manages current conversation', async () => {
      const conv = createConversation({ title: 'Active Chat' })

      // Set as current
      await Storage.setCurrentConversation(conv)
      let current = await Storage.getCurrentConversation()
      expect(current?.title).toBe('Active Chat')

      // Clear current
      await Storage.setCurrentConversation(null)
      current = await Storage.getCurrentConversation()
      expect(current).toBeNull()
    })

    it('deletes conversation while preserving others', async () => {
      const conv1 = createConversation({ id: 'conv-1', title: 'First' })
      const conv2 = createConversation({ id: 'conv-2', title: 'Second' })

      await Storage.saveConversation(conv1)
      await Storage.saveConversation(conv2)

      let conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(2)

      await Storage.deleteConversation('conv-1')

      conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('conv-2')
    })
  })

  describe('Settings and provider flow', () => {
    it('retrieves correct API key for provider', async () => {
      setMockStorage({
        hootly_settings: {
          ...DEFAULT_SETTINGS,
          provider: 'claude',
          claudeApiKey: 'sk-claude-key',
        },
      })

      const settings = await Storage.getSettings()
      const apiKey = getApiKey(settings)
      expect(apiKey).toBe('sk-claude-key')
    })

    it('switches providers correctly', async () => {
      // Start with Claude
      setMockStorage({
        hootly_settings: {
          ...DEFAULT_SETTINGS,
          provider: 'claude',
          claudeApiKey: 'sk-claude',
          openaiApiKey: 'sk-openai',
        },
      })

      let settings = await Storage.getSettings()
      expect(getApiKey(settings)).toBe('sk-claude')
      expect(getProvider(settings.provider).name).toBe('Claude')

      // Switch to OpenAI
      await Storage.saveSettings({ provider: 'openai' })

      settings = await Storage.getSettings()
      expect(getApiKey(settings)).toBe('sk-openai')
      expect(getProvider(settings.provider).name).toBe('OpenAI')
    })
  })

  describe('Conversation history depth', () => {
    it('respects conversation depth setting', async () => {
      setMockStorage({
        hootly_settings: { ...configuredSettings, conversationDepth: 3 },
      })

      const settings = await Storage.getSettings()
      expect(settings.conversationDepth).toBe(3)

      // Simulate building history for API call
      const fullHistory: Message[] = Array.from({ length: 10 }, (_, i) =>
        createMessage({ content: `Message ${i}` })
      )

      // Slice to depth (3 means 3 exchanges = 6 messages)
      const depth = settings.conversationDepth
      const trimmedHistory = fullHistory.slice(-depth * 2)

      expect(trimmedHistory).toHaveLength(6)
    })
  })

  describe('Retention cleanup', () => {
    it('removes old conversations based on retention', async () => {
      const recentConv = createConversation({
        id: 'recent',
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      })
      const oldConv = createConversation({
        id: 'old',
        updatedAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
      })

      setMockStorage({
        hootly_conversations: [recentConv, oldConv],
        hootly_settings: { ...DEFAULT_SETTINGS, retentionDays: 30 },
      })

      await Storage.clearOldConversations(30)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('recent')
    })
  })

  describe('Message context attachment', () => {
    it('attaches page context to user message', () => {
      const message = createMessage({
        content: 'What is this about?',
        context: {
          url: 'https://example.com/article',
          title: 'Sample Article',
          selection: 'Selected text from page',
        },
      })

      expect(message.context).toBeDefined()
      expect(message.context?.url).toBe('https://example.com/article')
      expect(message.context?.selection).toBe('Selected text from page')
    })

    it('handles full page context', () => {
      const pageContent = 'Full page content '.repeat(100)
      const message = createMessage({
        content: 'Summarize this page',
        context: {
          url: 'https://example.com/docs',
          title: 'Documentation',
          fullPage: pageContent,
        },
      })

      expect(message.context?.fullPage).toBeDefined()
      expect(message.context?.fullPage?.length).toBeGreaterThan(100)
    })
  })

  describe('ID generation uniqueness', () => {
    it('generates unique IDs for messages', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 50; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(50)
    })

    it('generates unique IDs for conversations', () => {
      const conversations = Array.from({ length: 20 }, () =>
        createConversation()
      )
      const ids = new Set(conversations.map(c => c.id))
      expect(ids.size).toBe(20)
    })
  })
})

describe('Provider streaming simulation', () => {
  beforeEach(() => {
    resetChromeMock()
  })

  it('handles streaming response chunks', () => {
    const chunks: string[] = []
    const callbacks = {
      onText: (text: string) => chunks.push(text),
      onEnd: vi.fn(),
      onError: vi.fn(),
    }

    // Simulate streaming
    const mockChunks = ['Hello', ', ', 'world', '!']
    mockChunks.forEach(chunk => callbacks.onText(chunk))
    callbacks.onEnd(mockChunks.join(''))

    expect(chunks).toEqual(mockChunks)
    expect(callbacks.onEnd).toHaveBeenCalledWith('Hello, world!')
  })

  it('handles stream abortion', () => {
    const abortController = new AbortController()
    let aborted = false

    abortController.signal.addEventListener('abort', () => {
      aborted = true
    })

    abortController.abort()
    expect(aborted).toBe(true)
    expect(abortController.signal.aborted).toBe(true)
  })

  it('handles stream errors', () => {
    const onError = vi.fn()

    // Simulate error
    const error = new Error('Rate limit exceeded')
    onError(error)

    expect(onError).toHaveBeenCalledWith(error)
  })
})
