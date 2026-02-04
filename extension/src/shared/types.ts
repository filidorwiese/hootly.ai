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
  theme: 'light' | 'dark' | 'auto';
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
  customPrompts: SavedPrompt[];
  showSelectionTooltip: boolean;
  shareAnalytics: boolean;
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

export interface SavedPrompt {
  id: string;
  text: string;
  isBuiltIn: boolean;
  createdAt?: number;
}

export const DEFAULT_PROMPTS: SavedPrompt[] = [
  {
    id: 'translate-page',
    text: 'Translate this text into ',
    isBuiltIn: true,
  },
  {
    id: 'summarize-page',
    text: 'Summarize this text in a few paragraphs',
    isBuiltIn: true,
  },
  {
    id: 'change-tone',
    text: 'Change the tone of this text to ',
    isBuiltIn: true,
  },
  {
    id: 'explain-simple',
    text: "Explain this like I'm 5 years old",
    isBuiltIn: true,
  },
  {
    id: 'key-points',
    text: 'Find the key points in this text and list them',
    isBuiltIn: true,
  },
  {
    id: 'check-spelling',
    text: 'Check this text for spelling and grammar mistakes',
    isBuiltIn: true,
  },
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'general',
    name: 'General',
    systemPrompt:
      'You are a helpful, knowledgeable assistant. Be concise and direct. Adapt your tone to the context—professional for work topics, casual for everyday questions. When uncertain, ask clarifying questions rather than assuming.',
    icon: '🦉',
    isBuiltIn: true,
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    systemPrompt:
      'You are an expert programmer skilled in multiple languages and paradigms. Write clean, efficient, well-tested code following modern best practices. Explain your reasoning concisely. Suggest improvements when you spot issues. Prefer idiomatic solutions and warn about potential edge cases or security concerns.',
    icon: '💻',
    isBuiltIn: true,
  },
  {
    id: 'writer',
    name: 'Writer',
    systemPrompt:
      'You are a skilled writer and editor. Help draft, revise, and polish written content. Match the appropriate tone—formal for business, conversational for blogs, persuasive for marketing. Focus on clarity, flow, and engagement. Offer specific suggestions rather than vague feedback.',
    icon: '✍️',
    isBuiltIn: true,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    systemPrompt:
      'You are a thorough researcher and analyst. Investigate topics systematically, presenting findings with clear structure. Cite sources when possible. Present multiple perspectives fairly and distinguish facts from opinions. Highlight gaps in available information and suggest further avenues of inquiry.',
    icon: '🔬',
    isBuiltIn: true,
  },
  {
    id: 'translator',
    name: 'Translator',
    systemPrompt:
      'You are an expert translator fluent in many languages. Translate accurately while preserving meaning, tone, and cultural context. Handle idioms and colloquialisms naturally. Always state source and target languages. Note when concepts don\'t translate directly and offer alternatives.',
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
  | { type: 'continueConversation'; payload: { conversationId: string } }
  | { type: 'setExtensionTabId'; payload: { tabId: number } }
  | { type: 'getExtensionTabId' }
  | { type: 'clearExtensionTabId' }
  | { type: 'toggleDialogFromTooltip' }
  | { type: 'getShortcut' };

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
  theme: 'auto',
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
  customPrompts: [],
  showSelectionTooltip: true,
  shareAnalytics: true,
};
