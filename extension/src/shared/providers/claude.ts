import Anthropic from '@anthropic-ai/sdk';
import type { ModelConfig } from '../models';
import type { Provider, StreamParams, StreamCallbacks } from './index';

interface AnthropicModel {
  id: string;
  display_name: string;
  created_at: string;
  type: string;
}

interface AnthropicModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export class ClaudeProvider implements Provider {
  readonly name = 'Claude';

  async fetchModels(apiKey: string): Promise<ModelConfig[]> {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: AnthropicModelsResponse = await response.json();

    return data.data
      .filter((model) => model.type === 'model')
      .map((model) => ({
        id: model.id,
        name: model.display_name,
        description: model.id,
        created_at: model.created_at,
      }))
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }

  streamChat(apiKey: string, params: StreamParams, callbacks: StreamCallbacks): { abort: () => void } {
    const client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const messages: Anthropic.MessageParam[] = params.messages
      .filter((msg) => msg.role !== 'system' && msg.content.trim() !== '')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const stream = client.messages.stream({
      model: params.model,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      system: params.systemPrompt || undefined,
      messages,
    });

    let fullContent = '';

    stream.on('text', (text) => {
      fullContent += text;
      callbacks.onText(text);
    });

    stream.on('end', () => {
      callbacks.onEnd(fullContent);
    });

    stream.on('error', (error) => {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    });

    return {
      abort: () => stream.controller.abort(),
    };
  }
}
