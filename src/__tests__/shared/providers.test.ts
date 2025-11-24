import { describe, it, expect } from 'vitest'
import { getProvider, getApiKey } from '../../shared/providers'
import type { Settings, LLMProvider } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'
import {
  configuredSettings,
  openaiSettings,
  geminiSettings,
  openrouterSettings,
} from '../fixtures/settings'

describe('getProvider', () => {
  it('returns Claude provider', () => {
    const provider = getProvider('claude')
    expect(provider.name).toBe('Claude')
  })

  it('returns OpenAI provider', () => {
    const provider = getProvider('openai')
    expect(provider.name).toBe('OpenAI')
  })

  it('returns Gemini provider', () => {
    const provider = getProvider('gemini')
    expect(provider.name).toBe('Gemini')
  })

  it('returns OpenRouter provider', () => {
    const provider = getProvider('openrouter')
    expect(provider.name).toBe('OpenRouter')
  })

  it('all providers have required methods', () => {
    const providerTypes: LLMProvider[] = ['claude', 'openai', 'gemini', 'openrouter']

    for (const type of providerTypes) {
      const provider = getProvider(type)
      expect(typeof provider.fetchModels).toBe('function')
      expect(typeof provider.streamChat).toBe('function')
      expect(typeof provider.name).toBe('string')
    }
  })
})

describe('getApiKey', () => {
  it('returns Claude API key for claude provider', () => {
    const key = getApiKey(configuredSettings)
    expect(key).toBe(configuredSettings.claudeApiKey)
  })

  it('returns OpenAI API key for openai provider', () => {
    const key = getApiKey(openaiSettings)
    expect(key).toBe(openaiSettings.openaiApiKey)
  })

  it('returns Gemini API key for gemini provider', () => {
    const key = getApiKey(geminiSettings)
    expect(key).toBe(geminiSettings.geminiApiKey)
  })

  it('returns OpenRouter API key for openrouter provider', () => {
    const key = getApiKey(openrouterSettings)
    expect(key).toBe(openrouterSettings.openrouterApiKey)
  })

  it('returns empty string for unconfigured provider', () => {
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      provider: 'openai',
      // openaiApiKey is empty by default
    }
    const key = getApiKey(settings)
    expect(key).toBe('')
  })
})

describe('Provider interface contract', () => {
  const providerTypes: LLMProvider[] = ['claude', 'openai', 'gemini', 'openrouter']

  it.each(providerTypes)('%s provider has streamChat method', (type) => {
    const provider = getProvider(type)
    expect(typeof provider.streamChat).toBe('function')
  })

  it.each(providerTypes)('%s provider has fetchModels method', (type) => {
    const provider = getProvider(type)
    expect(typeof provider.fetchModels).toBe('function')
  })
})
