import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ModelConfig } from '../models';
import type { Provider, StreamParams, StreamCallbacks } from './index';

export class GeminiProvider implements Provider {
  readonly name = 'Gemini';

  async fetchModels(apiKey: string): Promise<ModelConfig[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key');
      }
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();

    return (data.models || [])
      .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model: any) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName || model.name.replace('models/', ''),
        description: model.description || model.name,
      }))
      .sort((a: ModelConfig, b: ModelConfig) => a.name.localeCompare(b.name));
  }

  streamChat(apiKey: string, params: StreamParams, callbacks: StreamCallbacks): { abort: () => void } {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: params.model });

    let aborted = false;

    const history = params.messages
      .filter((msg) => msg.role !== 'system' && msg.content.trim() !== '')
      .slice(0, -1)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const lastMessage = params.messages.filter((m) => m.content.trim()).slice(-1)[0];
    const userMessage = lastMessage?.content || '';

    let fullContent = '';

    (async () => {
      try {
        const chat = model.startChat({
          history: history as any,
          generationConfig: {
            maxOutputTokens: params.maxTokens,
            temperature: params.temperature,
          },
        });

        const result = await chat.sendMessageStream(userMessage);

        for await (const chunk of result.stream) {
          if (aborted) break;
          const text = chunk.text();
          if (text) {
            fullContent += text;
            callbacks.onText(text);
          }
        }

        if (!aborted) {
          callbacks.onEnd(fullContent);
        }
      } catch (error) {
        if (!aborted) {
          callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    })();

    return {
      abort: () => {
        aborted = true;
      },
    };
  }
}
