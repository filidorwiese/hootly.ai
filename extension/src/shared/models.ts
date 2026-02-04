export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

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

/**
 * Fetch available models from Anthropic API
 */
export async function fetchModels(apiKey: string): Promise<ModelConfig[]> {
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
      // Sort by created_at descending (newest first)
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
}

/**
 * Select a sensible default model from the available models
 * Prefers: claude-sonnet-4 > claude-3-5-sonnet > first available
 */
export function selectDefaultModel(models: ModelConfig[]): string | null {
  if (models.length === 0) return null;

  // Prefer Sonnet 4.5 or similar
  const sonnet4 = models.find((m) => m.id.includes('claude-sonnet-4') || m.id.includes('claude-4'));
  if (sonnet4) return sonnet4.id;

  // Fallback to Claude 3.5 Sonnet
  const sonnet35 = models.find((m) => m.id.includes('claude-3-5-sonnet'));
  if (sonnet35) return sonnet35.id;

  // Fallback to any Sonnet
  const anySonnet = models.find((m) => m.id.includes('sonnet'));
  if (anySonnet) return anySonnet.id;

  // Fallback to first model
  return models[0].id;
}

/**
 * Check if a model ID exists in the models list
 */
export function modelExists(models: ModelConfig[], modelId: string): boolean {
  return models.some((m) => m.id === modelId);
}
