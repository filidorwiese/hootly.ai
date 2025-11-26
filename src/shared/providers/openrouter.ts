import OpenAI from 'openai';
import type { ModelConfig } from '../models';
import type { Provider, StreamParams, StreamCallbacks } from './index';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  created?: number;
}

export class OpenRouterProvider implements Provider {
  readonly name = 'OpenRouter';

  async fetchModels(apiKey: string): Promise<ModelConfig[]> {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();

    return (data.data || []).map((model: OpenRouterModel) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || model.id,
      created_at: model.created ? new Date(model.created * 1000).toISOString() : undefined,
    }));
  }

  streamChat(apiKey: string, params: StreamParams, callbacks: StreamCallbacks): { abort: () => void } {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/user/hootly',
        'X-Title': 'Hootly',
      },
    });

    const controller = new AbortController();

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }

    for (const msg of params.messages) {
      if (msg.content.trim() !== '') {
        messages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }

    let fullContent = '';

    (async () => {
      try {
        const stream = await client.chat.completions.create(
          {
            model: params.model,
            max_tokens: params.maxTokens,
            temperature: params.temperature,
            messages,
            stream: true,
          },
          { signal: controller.signal }
        );

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            fullContent += text;
            callbacks.onText(text);
          }
        }

        callbacks.onEnd(fullContent);
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    })();

    return {
      abort: () => controller.abort(),
    };
  }
}
