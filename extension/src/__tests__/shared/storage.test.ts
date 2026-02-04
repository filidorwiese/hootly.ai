import { describe, it, expect, beforeEach } from 'vitest'
import { Storage } from '../../shared/storage'
import { DEFAULT_SETTINGS, DEFAULT_PROMPTS, SavedPrompt } from '../../shared/types'
import { resetChromeMock, setMockStorage, getMockStorage } from '../__mocks__/chrome'
import {
  createConversation,
  fullConversation,
  emptyConversation,
  oldConversation,
} from '../fixtures/conversations'
import { configuredSettings } from '../fixtures/settings'

describe('Storage', () => {
  beforeEach(() => {
    resetChromeMock()
  })

  describe('getSettings', () => {
    it('returns default settings when storage is empty', async () => {
      const settings = await Storage.getSettings()
      expect(settings).toEqual(DEFAULT_SETTINGS)
    })

    it('merges stored settings with defaults', async () => {
      setMockStorage({
        hootly_settings: { claudeApiKey: 'test-key', model: 'claude-3-opus' },
      })

      const settings = await Storage.getSettings()
      expect(settings.claudeApiKey).toBe('test-key')
      expect(settings.model).toBe('claude-3-opus')
      // Check defaults are still present
      expect(settings.maxTokens).toBe(DEFAULT_SETTINGS.maxTokens)
      expect(settings.temperature).toBe(DEFAULT_SETTINGS.temperature)
    })

    it('preserves all stored settings', async () => {
      setMockStorage({ hootly_settings: configuredSettings })

      const settings = await Storage.getSettings()
      expect(settings.claudeApiKey).toBe(configuredSettings.claudeApiKey)
      expect(settings.systemPrompt).toBe(configuredSettings.systemPrompt)
    })
  })

  describe('saveSettings', () => {
    it('saves partial settings', async () => {
      await Storage.saveSettings({ claudeApiKey: 'new-key' })

      const storage = getMockStorage()
      expect(storage.hootly_settings).toBeDefined()
      expect((storage.hootly_settings as any).claudeApiKey).toBe('new-key')
    })

    it('merges with existing settings', async () => {
      setMockStorage({
        hootly_settings: { claudeApiKey: 'old-key', model: 'old-model' },
      })

      await Storage.saveSettings({ model: 'new-model' })

      const settings = await Storage.getSettings()
      expect(settings.claudeApiKey).toBe('old-key') // preserved
      expect(settings.model).toBe('new-model') // updated
    })

    it('preserves defaults for unset values', async () => {
      await Storage.saveSettings({ claudeApiKey: 'test' })

      const settings = await Storage.getSettings()
      expect(settings.maxTokens).toBe(DEFAULT_SETTINGS.maxTokens)
      expect(settings.shortcut).toBe(DEFAULT_SETTINGS.shortcut)
    })
  })

  describe('getConversations', () => {
    it('returns empty array when no conversations', async () => {
      const conversations = await Storage.getConversations()
      expect(conversations).toEqual([])
    })

    it('returns stored conversations', async () => {
      setMockStorage({
        hootly_conversations: [fullConversation, emptyConversation],
      })

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(2)
      expect(conversations[0].id).toBe(fullConversation.id)
    })
  })

  describe('saveConversation', () => {
    it('adds new conversation', async () => {
      const conv = createConversation({ id: 'new-conv' })
      await Storage.saveConversation(conv)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('new-conv')
    })

    it('updates existing conversation', async () => {
      const conv = createConversation({ id: 'existing', title: 'Original' })
      setMockStorage({ hootly_conversations: [conv] })

      const updated = { ...conv, title: 'Updated' }
      await Storage.saveConversation(updated)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].title).toBe('Updated')
    })

    it('preserves other conversations when updating', async () => {
      setMockStorage({
        hootly_conversations: [fullConversation, emptyConversation],
      })

      const updated = { ...fullConversation, title: 'Modified' }
      await Storage.saveConversation(updated)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(2)
      expect(conversations.find(c => c.id === fullConversation.id)?.title).toBe('Modified')
      expect(conversations.find(c => c.id === emptyConversation.id)).toBeDefined()
    })
  })

  describe('deleteConversation', () => {
    it('removes conversation by id', async () => {
      setMockStorage({
        hootly_conversations: [fullConversation, emptyConversation],
      })

      await Storage.deleteConversation(fullConversation.id)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe(emptyConversation.id)
    })

    it('does nothing if conversation not found', async () => {
      setMockStorage({
        hootly_conversations: [fullConversation],
      })

      await Storage.deleteConversation('nonexistent')

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
    })
  })

  describe('getCurrentConversation / setCurrentConversation', () => {
    it('returns null when no current conversation', async () => {
      const current = await Storage.getCurrentConversation()
      expect(current).toBeNull()
    })

    it('sets and gets current conversation', async () => {
      await Storage.setCurrentConversation(fullConversation)

      const current = await Storage.getCurrentConversation()
      expect(current?.id).toBe(fullConversation.id)
    })

    it('clears current conversation with null', async () => {
      await Storage.setCurrentConversation(fullConversation)
      await Storage.setCurrentConversation(null)

      const current = await Storage.getCurrentConversation()
      expect(current).toBeNull()
    })
  })

  describe('getDialogPosition / saveDialogPosition', () => {
    it('returns null when no position saved', async () => {
      const position = await Storage.getDialogPosition()
      expect(position).toBeNull()
    })

    it('saves and retrieves dialog position', async () => {
      const pos = { x: 100, y: 200, width: 400, height: 500 }
      await Storage.saveDialogPosition(pos)

      const retrieved = await Storage.getDialogPosition()
      expect(retrieved).toEqual(pos)
    })
  })

  describe('clearOldConversations', () => {
    it('removes conversations older than retention days', async () => {
      const recentConv = createConversation({
        id: 'recent',
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      })

      setMockStorage({
        hootly_conversations: [recentConv, oldConversation], // oldConversation is 60 days old
      })

      await Storage.clearOldConversations(30) // 30 day retention

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('recent')
    })

    it('keeps all conversations within retention period', async () => {
      const conv1 = createConversation({
        id: 'conv1',
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      })
      const conv2 = createConversation({
        id: 'conv2',
        updatedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      })

      setMockStorage({
        hootly_conversations: [conv1, conv2],
      })

      await Storage.clearOldConversations(30)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(2)
    })

    it('removes all conversations with 0 day retention', async () => {
      const conv = createConversation({ updatedAt: Date.now() - 1000 }) // 1 second ago

      setMockStorage({
        hootly_conversations: [conv],
      })

      await Storage.clearOldConversations(0)

      const conversations = await Storage.getConversations()
      expect(conversations).toHaveLength(0)
    })
  })

  describe('getPrompts', () => {
    it('returns built-in prompts when no custom prompts', async () => {
      const prompts = await Storage.getPrompts()
      expect(prompts).toHaveLength(DEFAULT_PROMPTS.length)
      expect(prompts.every(p => p.isBuiltIn)).toBe(true)
    })

    it('returns built-in + custom prompts', async () => {
      const customPrompt: SavedPrompt = {
        id: 'custom-1',
        name: 'Custom',
        text: 'Custom prompt text',
        isBuiltIn: false,
      }
      setMockStorage({
        hootly_settings: { ...DEFAULT_SETTINGS, customPrompts: [customPrompt] },
      })

      const prompts = await Storage.getPrompts()
      expect(prompts).toHaveLength(DEFAULT_PROMPTS.length + 1)
      expect(prompts.find(p => p.id === 'custom-1')).toBeDefined()
    })
  })

  describe('savePrompt', () => {
    it('adds new custom prompt', async () => {
      const newPrompt: SavedPrompt = {
        id: 'new-prompt',
        text: 'New prompt text',
        isBuiltIn: false,
      }
      await Storage.savePrompt(newPrompt)

      const prompts = await Storage.getPrompts()
      const saved = prompts.find(p => p.id === 'new-prompt')
      expect(saved).toBeDefined()
      expect(saved?.createdAt).toBeDefined()
    })

    it('updates existing custom prompt', async () => {
      const original: SavedPrompt = {
        id: 'existing',
        text: 'Original text',
        isBuiltIn: false,
        createdAt: 1000,
      }
      setMockStorage({
        hootly_settings: { ...DEFAULT_SETTINGS, customPrompts: [original] },
      })

      const updated = { ...original, text: 'Updated text' }
      await Storage.savePrompt(updated)

      const prompts = await Storage.getPrompts()
      const saved = prompts.find(p => p.id === 'existing')
      expect(saved?.text).toBe('Updated text')
    })

    it('throws when trying to modify built-in prompt', async () => {
      const builtIn: SavedPrompt = {
        id: 'translate-page',
        text: 'Modified text',
        isBuiltIn: true,
      }
      await expect(Storage.savePrompt(builtIn)).rejects.toThrow('Cannot modify built-in prompts')
    })
  })

  describe('deletePrompt', () => {
    it('removes custom prompt by id', async () => {
      const prompt1: SavedPrompt = { id: 'p1', text: 'T1', isBuiltIn: false }
      const prompt2: SavedPrompt = { id: 'p2', text: 'T2', isBuiltIn: false }
      setMockStorage({
        hootly_settings: { ...DEFAULT_SETTINGS, customPrompts: [prompt1, prompt2] },
      })

      await Storage.deletePrompt('p1')

      const prompts = await Storage.getPrompts()
      expect(prompts.find(p => p.id === 'p1')).toBeUndefined()
      expect(prompts.find(p => p.id === 'p2')).toBeDefined()
    })
  })

  describe('getPromptById', () => {
    it('finds built-in prompt by id', async () => {
      const prompt = await Storage.getPromptById('translate-page')
      expect(prompt).toBeDefined()
      expect(prompt?.text).toBe('Translate this page into [language]')
    })

    it('finds custom prompt by id', async () => {
      const customPrompt: SavedPrompt = {
        id: 'custom-find',
        text: 'Find text',
        isBuiltIn: false,
      }
      setMockStorage({
        hootly_settings: { ...DEFAULT_SETTINGS, customPrompts: [customPrompt] },
      })

      const prompt = await Storage.getPromptById('custom-find')
      expect(prompt?.text).toBe('Find text')
    })

    it('returns undefined for non-existent id', async () => {
      const prompt = await Storage.getPromptById('nonexistent')
      expect(prompt).toBeUndefined()
    })
  })
})
