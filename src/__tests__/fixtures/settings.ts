// Test fixtures for Settings

import type { Settings } from '../../shared/types'

export const defaultSettings: Settings = {
  provider: 'claude',
  claudeApiKey: '',
  geminiApiKey: '',
  openaiApiKey: '',
  openrouterApiKey: '',
  model: '',
  maxTokens: 4096,
  temperature: 1.0,
  theme: 'system',
  fontSize: 14,
  shortcut: 'Alt+C',
  autoClose: false,
  defaultContext: 'none',
  contextMaxLength: 100000,
  includeScripts: false,
  includeStyles: false,
  includeAltText: true,
  systemPrompt: '',
  conversationDepth: 5,
  retentionDays: 30,
  language: 'auto',
}

export const configuredSettings: Settings = {
  ...defaultSettings,
  claudeApiKey: 'sk-test-key-12345',
  model: 'claude-sonnet-4-20250514',
  defaultContext: 'selection',
  systemPrompt: 'You are a helpful assistant.',
}

export const openaiSettings: Settings = {
  ...defaultSettings,
  provider: 'openai',
  openaiApiKey: 'sk-openai-test-key',
  model: 'gpt-4o',
}

export const geminiSettings: Settings = {
  ...defaultSettings,
  provider: 'gemini',
  geminiApiKey: 'gemini-test-key',
  model: 'gemini-1.5-pro',
}

export const openrouterSettings: Settings = {
  ...defaultSettings,
  provider: 'openrouter',
  openrouterApiKey: 'sk-or-test-key',
  model: 'anthropic/claude-3.5-sonnet',
}
