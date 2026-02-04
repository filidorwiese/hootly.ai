import type { LLMProvider, Settings } from '../types';
import type { ModelConfig } from '../models';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { OpenRouterProvider } from './openrouter';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamParams {
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export interface StreamCallbacks {
  onText: (text: string) => void;
  onEnd: (fullContent: string) => void;
  onError: (error: Error) => void;
}

export interface Provider {
  readonly name: string;
  fetchModels(apiKey: string): Promise<ModelConfig[]>;
  streamChat(apiKey: string, params: StreamParams, callbacks: StreamCallbacks): { abort: () => void };
}

const providers: Record<LLMProvider, Provider> = {
  claude: new ClaudeProvider(),
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
  openrouter: new OpenRouterProvider(),
};

export function getProvider(provider: LLMProvider): Provider {
  return providers[provider];
}

export function getApiKey(settings: Settings): string {
  switch (settings.provider) {
    case 'claude':
      return settings.claudeApiKey;
    case 'gemini':
      return settings.geminiApiKey;
    case 'openai':
      return settings.openaiApiKey;
    case 'openrouter':
      return settings.openrouterApiKey;
  }
}
