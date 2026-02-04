import OpenAI from 'openai';
import type { ModelConfig } from '../models';
import type { Provider, StreamParams, StreamCallbacks } from './index';

export class OpenAIProvider implements Provider {
  readonly name = 'OpenAI';

  async fetchModels(apiKey: string): Promise<ModelConfig[]> {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await client.models.list();

    return response.data
      .filter((model) => model.id.startsWith('gpt-') || model.id.startsWith('o1') || model.id.startsWith('o3'))
      .map((model) => ({
        id: model.id,
        name: model.id,
        description: model.id,
        created_at: new Date(model.created * 1000).toISOString(),
      }))
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }

  streamChat(apiKey: string, params: StreamParams, callbacks: StreamCallbacks): { abort: () => void } {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
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
