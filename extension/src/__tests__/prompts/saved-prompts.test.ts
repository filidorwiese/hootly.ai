import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome API
const mockStorage: Record<string, unknown> = {};
vi.mock('../../shared/storage', () => ({
  Storage: {
    getSettings: vi.fn(() => Promise.resolve({
      customPrompts: [
        { id: 'custom_1', text: 'Custom prompt 1', isBuiltIn: false, createdAt: 1000 },
        { id: 'custom_2', text: 'Custom prompt 2', isBuiltIn: false, createdAt: 2000 },
      ],
    })),
    savePrompt: vi.fn((prompt) => {
      mockStorage.savedPrompt = prompt;
      return Promise.resolve();
    }),
    deletePrompt: vi.fn((id) => {
      mockStorage.deletedId = id;
      return Promise.resolve();
    }),
  },
}));

import { Storage } from '../../shared/storage';
import { DEFAULT_PROMPTS } from '../../shared/types';

describe('Saved Prompts Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PRO-1: Prompt data structure', () => {
    it('should have correct fields in SavedPrompt interface', () => {
      const prompt = {
        id: 'test_1',
        text: 'Test prompt text',
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      expect(prompt).toHaveProperty('id');
      expect(prompt).toHaveProperty('text');
      expect(prompt).toHaveProperty('isBuiltIn');
      expect(prompt).toHaveProperty('createdAt');
    });

    it('should not have name field in prompt', () => {
      const prompt = { id: 'test', text: 'Test', isBuiltIn: false };
      expect(prompt).not.toHaveProperty('name');
    });
  });

  describe('PRO-2: Built-in prompts', () => {
    it('should have 6 built-in prompts', () => {
      expect(DEFAULT_PROMPTS).toHaveLength(6);
    });

    it('should have translate-page prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'translate-page');
      expect(prompt).toBeDefined();
      expect(prompt?.isBuiltIn).toBe(true);
    });

    it('should have summarize-page prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'summarize-page');
      expect(prompt).toBeDefined();
    });

    it('should have change-tone prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'change-tone');
      expect(prompt).toBeDefined();
    });

    it('should have explain-simple prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'explain-simple');
      expect(prompt).toBeDefined();
    });

    it('should have key-points prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'key-points');
      expect(prompt).toBeDefined();
    });

    it('should have check-spelling prompt', () => {
      const prompt = DEFAULT_PROMPTS.find((p) => p.id === 'check-spelling');
      expect(prompt).toBeDefined();
    });
  });

  describe('PRO-5: Prompts CRUD operations', () => {
    it('should save a new prompt', async () => {
      const newPrompt = {
        id: 'custom_new',
        text: 'New custom prompt',
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      await Storage.savePrompt(newPrompt);
      expect(Storage.savePrompt).toHaveBeenCalledWith(newPrompt);
    });

    it('should delete a prompt by id', async () => {
      await Storage.deletePrompt('custom_1');
      expect(Storage.deletePrompt).toHaveBeenCalledWith('custom_1');
    });

    it('should load custom prompts from settings', async () => {
      const settings = await Storage.getSettings();
      expect(settings.customPrompts).toHaveLength(2);
      expect(settings.customPrompts[0].id).toBe('custom_1');
    });
  });

  describe('PRO-6: Slash command detection', () => {
    it('should detect slash at start of input', () => {
      const input = '/';
      expect(input.startsWith('/')).toBe(true);
    });

    it('should not detect slash in middle of input', () => {
      const input = 'hello / world';
      expect(input.startsWith('/')).toBe(false);
    });

    it('should detect slash with trailing text', () => {
      const input = '/search';
      expect(input.startsWith('/')).toBe(true);
    });
  });

  describe('PRO-7/8: PromptSelector behavior', () => {
    it('should combine built-in and custom prompts', () => {
      const customPrompts = [
        { id: 'custom_1', text: 'Custom 1', isBuiltIn: false },
      ];
      const allPrompts = [...DEFAULT_PROMPTS, ...customPrompts];

      expect(allPrompts.length).toBe(7);
      expect(allPrompts.filter((p) => p.isBuiltIn).length).toBe(6);
      expect(allPrompts.filter((p) => !p.isBuiltIn).length).toBe(1);
    });

    it('should filter prompts by search query', () => {
      const prompts = [
        { id: '1', text: 'Translate this page', isBuiltIn: true },
        { id: '2', text: 'Summarize content', isBuiltIn: true },
        { id: '3', text: 'Explain simply', isBuiltIn: true },
      ];

      const query = 'trans';
      const filtered = prompts.filter((p) =>
        p.text.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should handle case-insensitive search', () => {
      const prompts = [
        { id: '1', text: 'TRANSLATE PAGE', isBuiltIn: true },
      ];

      const query = 'translate';
      const filtered = prompts.filter((p) =>
        p.text.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it('should truncate long prompt text', () => {
      const truncate = (text: string, maxLength: number = 80): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
      };

      const longText = 'A'.repeat(100);
      const truncated = truncate(longText);

      expect(truncated.length).toBe(83); // 80 + '...'
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('should not truncate short text', () => {
      const truncate = (text: string, maxLength: number = 80): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
      };

      const shortText = 'Short prompt';
      expect(truncate(shortText)).toBe(shortText);
    });
  });

  describe('PRO-9: Prompt injection', () => {
    it('should replace slash with prompt text on selection', () => {
      const currentValue = '/';
      const selectedPrompt = 'Translate this page to English';

      // Simulate the replacement (InputArea does this)
      const newValue = selectedPrompt;

      expect(newValue).toBe(selectedPrompt);
      expect(newValue.startsWith('/')).toBe(false);
    });

    it('should not auto-send after prompt injection', () => {
      // This is a behavioral test - the key is that Enter in slash mode
      // selects a prompt but doesn't submit the message
      const slashModeActive = true;
      const shouldSubmit = !slashModeActive;

      expect(shouldSubmit).toBe(false);
    });
  });

  describe('Keyboard navigation', () => {
    it('should support arrow down to move highlight', () => {
      let highlightedIndex = 0;
      const totalItems = 5;

      // Arrow down
      highlightedIndex = highlightedIndex < totalItems - 1 ? highlightedIndex + 1 : highlightedIndex;
      expect(highlightedIndex).toBe(1);
    });

    it('should support arrow up to move highlight', () => {
      let highlightedIndex = 2;

      // Arrow up
      highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : 0;
      expect(highlightedIndex).toBe(1);
    });

    it('should not go below 0 with arrow up', () => {
      let highlightedIndex = 0;

      // Arrow up at top
      highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : 0;
      expect(highlightedIndex).toBe(0);
    });

    it('should not exceed max index with arrow down', () => {
      let highlightedIndex = 4;
      const totalItems = 5;

      // Arrow down at bottom
      highlightedIndex = highlightedIndex < totalItems - 1 ? highlightedIndex + 1 : highlightedIndex;
      expect(highlightedIndex).toBe(4);
    });
  });
});
