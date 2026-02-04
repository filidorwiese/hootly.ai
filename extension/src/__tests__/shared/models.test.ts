import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { selectDefaultModel, modelExists, fetchModels, type ModelConfig } from '../../shared/models'

describe('selectDefaultModel', () => {
  it('returns null for empty model list', () => {
    expect(selectDefaultModel([])).toBeNull()
  })

  it('prefers claude-sonnet-4 models', () => {
    const models: ModelConfig[] = [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: '' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '' },
    ]
    expect(selectDefaultModel(models)).toBe('claude-sonnet-4-20250514')
  })

  it('prefers claude-4 models', () => {
    const models: ModelConfig[] = [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
      { id: 'claude-4-20250601', name: 'Claude 4', description: '' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '' },
    ]
    expect(selectDefaultModel(models)).toBe('claude-4-20250601')
  })

  it('falls back to claude-3-5-sonnet if no claude-4', () => {
    const models: ModelConfig[] = [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '' },
    ]
    expect(selectDefaultModel(models)).toBe('claude-3-5-sonnet-20241022')
  })

  it('falls back to any sonnet if no 3.5-sonnet', () => {
    const models: ModelConfig[] = [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: '' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '' },
    ]
    expect(selectDefaultModel(models)).toBe('claude-3-sonnet-20240229')
  })

  it('falls back to first model if no sonnet', () => {
    const models: ModelConfig[] = [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '' },
    ]
    expect(selectDefaultModel(models)).toBe('claude-3-opus-20240229')
  })
})

describe('modelExists', () => {
  const models: ModelConfig[] = [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '' },
  ]

  it('returns true for existing model', () => {
    expect(modelExists(models, 'claude-3-opus-20240229')).toBe(true)
    expect(modelExists(models, 'claude-3-5-sonnet-20241022')).toBe(true)
  })

  it('returns false for non-existing model', () => {
    expect(modelExists(models, 'claude-3-haiku-20240307')).toBe(false)
    expect(modelExists(models, 'gpt-4')).toBe(false)
  })

  it('returns false for empty list', () => {
    expect(modelExists([], 'claude-3-opus-20240229')).toBe(false)
  })

  it('requires exact match', () => {
    expect(modelExists(models, 'claude-3-opus')).toBe(false)
    expect(modelExists(models, 'CLAUDE-3-OPUS-20240229')).toBe(false)
  })
})

describe('fetchModels', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and transforms models correctly', async () => {
    const mockResponse = {
      data: [
        {
          id: 'claude-3-5-sonnet-20241022',
          display_name: 'Claude 3.5 Sonnet',
          created_at: '2024-10-22',
          type: 'model',
        },
        {
          id: 'claude-3-opus-20240229',
          display_name: 'Claude 3 Opus',
          created_at: '2024-02-29',
          type: 'model',
        },
      ],
      has_more: false,
      first_id: null,
      last_id: null,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await fetchModels('test-api-key')

    expect(fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': 'test-api-key',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    })

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('claude-3-5-sonnet-20241022')
    expect(result[0].name).toBe('Claude 3.5 Sonnet')
  })

  it('filters out non-model types', async () => {
    const mockResponse = {
      data: [
        { id: 'claude-3-opus', display_name: 'Opus', created_at: '2024-01-01', type: 'model' },
        { id: 'some-other', display_name: 'Other', created_at: '2024-01-01', type: 'embedding' },
      ],
      has_more: false,
      first_id: null,
      last_id: null,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await fetchModels('test-api-key')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('claude-3-opus')
  })

  it('throws error for 401 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    await expect(fetchModels('invalid-key')).rejects.toThrow('Invalid API key')
  })

  it('throws error for other HTTP errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    await expect(fetchModels('test-key')).rejects.toThrow('Failed to fetch models: 500')
  })

  it('sorts models by created_at descending', async () => {
    const mockResponse = {
      data: [
        { id: 'old', display_name: 'Old', created_at: '2024-01-01', type: 'model' },
        { id: 'new', display_name: 'New', created_at: '2024-12-01', type: 'model' },
        { id: 'mid', display_name: 'Mid', created_at: '2024-06-01', type: 'model' },
      ],
      has_more: false,
      first_id: null,
      last_id: null,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await fetchModels('test-key')
    expect(result[0].id).toBe('new')
    expect(result[1].id).toBe('mid')
    expect(result[2].id).toBe('old')
  })
})
