export type LLMProvider = 'claude' | 'gemini' | 'openai' | 'openrouter';

export interface Settings {
  provider: LLMProvider;
  claudeApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  openrouterApiKey: string;
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
  defaultPersonaId: string;
  customPersonas: Persona[];
  showSelectionTooltip: boolean;
}

// Re-export ModelConfig from models.ts for convenience
export type { ModelConfig } from './models';

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  personaId?: string;
  modelId?: string;
}

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
  icon: string;
  isBuiltIn: boolean;
  createdAt?: number;
}

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'general',
    name: 'General',
    systemPrompt: '',
    icon: '🦉',
    isBuiltIn: true,
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    systemPrompt: 'You are an expert programmer. Provide clean, efficient, well-documented code. Explain your reasoning briefly. Prefer modern best practices and idiomatic solutions.',
    icon: '💻',
    isBuiltIn: true,
  },
  {
    id: 'writer',
    name: 'Writer',
    systemPrompt: 'You are a skilled writer. Help with drafting, editing, and improving written content. Focus on clarity, engagement, and appropriate tone for the context.',
    icon: '✍️',
    isBuiltIn: true,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    systemPrompt: 'You are a thorough researcher. Analyze topics in depth, cite sources when possible, present multiple perspectives, and clearly distinguish facts from opinions.',
    icon: '🔬',
    isBuiltIn: true,
  },
  {
    id: 'translator',
    name: 'Translator',
    systemPrompt: 'You are an expert translator. Translate text accurately while preserving meaning, tone, and cultural nuances. Always specify source and target languages.',
    icon: '🌐',
    isBuiltIn: true,
  },
];

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
  | { type: 'openSettings' }
  | { type: 'openHistory' }
  | { type: 'fetchModels' }
  | { type: 'continueConversation'; payload: { conversationId: string } };

export interface SendPromptPayload {
  prompt: string;
  context?: PageContext;
  conversationHistory: Message[];
  settings: Settings;
}

export type ContentMessage =
  | { type: 'streamChunk'; payload: { content: string } }
  | { type: 'streamEnd'; payload: { content: string } }
  | { type: 'streamError'; payload: { error: string } }
  | { type: 'modelNotFound'; payload: { model: string } };

export const DEFAULT_SETTINGS: Settings = {
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
  defaultPersonaId: 'general',
  customPersonas: [],
  showSelectionTooltip: true,
};
