// LLM Provider mocks for testing

import type { StreamCallbacks } from '../../shared/providers'

export const mockStreamChunks = ['Hello', ', ', 'this', ' is', ' a', ' test', ' response', '.']

export function createMockStreamResponse(chunks: string[] = mockStreamChunks) {
  return {
    chunks,
    fullText: chunks.join(''),
  }
}

export class MockClaudeProvider {
  async fetchModels() {
    return [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', created: Date.now() },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', created: Date.now() },
    ]
  }

  async streamChat(
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks,
    _abortSignal?: AbortSignal
  ) {
    for (const chunk of mockStreamChunks) {
      callbacks.onChunk(chunk)
    }
    callbacks.onComplete(mockStreamChunks.join(''))
  }
}

export class MockOpenAIProvider {
  async fetchModels() {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', created: Date.now() },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', created: Date.now() },
    ]
  }

  async streamChat(
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks,
    _abortSignal?: AbortSignal
  ) {
    for (const chunk of mockStreamChunks) {
      callbacks.onChunk(chunk)
    }
    callbacks.onComplete(mockStreamChunks.join(''))
  }
}

export class MockGeminiProvider {
  async fetchModels() {
    return [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', created: Date.now() },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', created: Date.now() },
    ]
  }

  async streamChat(
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks,
    _abortSignal?: AbortSignal
  ) {
    for (const chunk of mockStreamChunks) {
      callbacks.onChunk(chunk)
    }
    callbacks.onComplete(mockStreamChunks.join(''))
  }
}

export class MockOpenRouterProvider {
  async fetchModels() {
    return [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', created: Date.now() },
      { id: 'openai/gpt-4o', name: 'GPT-4o', created: Date.now() },
    ]
  }

  async streamChat(
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks,
    _abortSignal?: AbortSignal
  ) {
    for (const chunk of mockStreamChunks) {
      callbacks.onChunk(chunk)
    }
    callbacks.onComplete(mockStreamChunks.join(''))
  }
}

export function createAbortableStreamMock(chunks: string[], delayMs = 10) {
  return async (
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal
  ) => {
    for (const chunk of chunks) {
      if (abortSignal?.aborted) {
        callbacks.onError(new Error('Stream aborted'))
        return
      }
      await new Promise(resolve => setTimeout(resolve, delayMs))
      callbacks.onChunk(chunk)
    }
    callbacks.onComplete(chunks.join(''))
  }
}

export function createErrorStreamMock(errorMessage: string) {
  return async (
    _params: { messages: Array<{ role: string; content: string }>; model: string },
    callbacks: StreamCallbacks
  ) => {
    callbacks.onError(new Error(errorMessage))
  }
}
