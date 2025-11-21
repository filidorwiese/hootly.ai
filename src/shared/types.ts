import modelsConfig from '../config/models.json';

export interface Settings {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  shortcut: string;
  autoClose: boolean;
  defaultContext: 'none' | 'full' | 'selection';
  contextMaxLength: number;
  includeScripts: boolean;
  includeStyles: boolean;
  includeAltText: boolean;
  systemPrompt: string;
  conversationDepth: 1 | 3 | 5 | 999;
  retentionDays: number;
  language: 'auto' | 'en' | 'nl' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'zh' | 'ja' | 'ko';
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
  legacy: boolean;
}

export const MODELS: ModelConfig[] = modelsConfig.models;
export const DEFAULT_MODEL: string = modelsConfig.defaultModel;

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: PageContext;
}

export interface PageContext {
  url: string;
  title: string;
  selection?: string;
  fullPage?: string;
  metadata?: {
    description?: string;
    keywords?: string;
  };
}

export interface DialogPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Message types for chrome.runtime.sendMessage
export type BackgroundMessage =
  | { type: 'sendPrompt'; payload: SendPromptPayload }
  | { type: 'cancelStream' }
  | { type: 'getSettings' }
  | { type: 'saveSettings'; payload: Settings }
  | { type: 'openSettings' };

export interface SendPromptPayload {
  prompt: string;
  context?: PageContext;
  conversationHistory: Message[];
  settings: Settings;
}

export type ContentMessage =
  | { type: 'streamChunk'; payload: { content: string } }
  | { type: 'streamEnd'; payload: { content: string } }
  | { type: 'streamError'; payload: { error: string } };

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: DEFAULT_MODEL,
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
};
