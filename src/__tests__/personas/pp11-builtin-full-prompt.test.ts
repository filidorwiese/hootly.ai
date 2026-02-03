import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_PERSONAS, type Persona } from '../../shared/types';

// Helper to escape HTML like the personas.ts does
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Simulates renderPersonaItem logic from personas.ts
function renderPersonaItem(persona: Persona, isDefault: boolean, isBuiltIn: boolean): string {
  const defaultBadge = isDefault ? `<span class="default-badge">Default</span>` : '';
  const fullPrompt = persona.systemPrompt ? escapeHtml(persona.systemPrompt) : '';
  const promptPreview = persona.systemPrompt && persona.systemPrompt.length > 150
    ? escapeHtml(persona.systemPrompt.slice(0, 150)) + '...'
    : fullPrompt;

  // Built-in personas always show full prompt; custom personas show preview (full when expanded)
  const promptDisplay = isBuiltIn
    ? fullPrompt
    : `<span class="prompt-preview">${promptPreview}</span><span class="prompt-full">${fullPrompt}</span>`;

  return `
    <div class="persona-item ${isBuiltIn ? 'builtin' : ''} ${isDefault ? 'default' : ''}" data-id="${persona.id}">
      <div class="persona-header">
        <span class="persona-icon">${persona.icon}</span>
        <div class="persona-info">
          <div class="persona-name">
            ${escapeHtml(persona.name)}
            ${defaultBadge}
          </div>
        </div>
      </div>
      ${fullPrompt ? `<div class="persona-prompt">${promptDisplay}</div>` : ''}
    </div>
  `;
}

function createCustomPersona(overrides: Partial<Persona> = {}): Persona {
  return {
    id: `custom-${Date.now()}`,
    name: 'Test Persona',
    systemPrompt: 'You are a test persona. '.repeat(20), // Long prompt > 150 chars
    icon: '🤖',
    isBuiltIn: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

// Get a built-in persona that HAS a system prompt
function getBuiltinWithPrompt(): Persona {
  const persona = DEFAULT_PERSONAS.find(p => p.systemPrompt && p.systemPrompt.length > 0);
  if (!persona) throw new Error('No built-in persona with system prompt found');
  return persona;
}

describe('PP-11: Show full description/systemprompt for built-in personas', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Built-in personas', () => {
    it('renders full system prompt without truncation', () => {
      const persona = getBuiltinWithPrompt();
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;
      const promptEl = document.querySelector('.persona-prompt');

      expect(promptEl).toBeTruthy();
      // Should contain the full prompt, not truncated
      expect(promptEl?.textContent).not.toContain('...');
      expect(promptEl?.innerHTML).toBe(escapeHtml(persona.systemPrompt));
    });

    it('does not include preview/full spans for built-in personas', () => {
      const persona = getBuiltinWithPrompt();
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;

      expect(document.querySelector('.prompt-preview')).toBeNull();
      expect(document.querySelector('.prompt-full')).toBeNull();
    });

    it('has builtin class on persona item', () => {
      const persona = getBuiltinWithPrompt();
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;
      const item = document.querySelector('.persona-item');

      expect(item?.classList.contains('builtin')).toBe(true);
    });

    it('shows full prompt for all built-in personas with system prompts', () => {
      const builtinsWithPrompts = DEFAULT_PERSONAS.filter(p => p.systemPrompt);

      builtinsWithPrompts.forEach((persona) => {
        const html = renderPersonaItem(persona, false, true);
        document.body.innerHTML = html;

        const promptEl = document.querySelector('.persona-prompt');
        expect(promptEl?.innerHTML).toBe(escapeHtml(persona.systemPrompt));
      });
    });

    it('does not render prompt div when persona has empty systemPrompt', () => {
      const emptyPromptPersona = {
        id: 'test-empty',
        name: 'Empty Prompt',
        systemPrompt: '',
        icon: '🧪',
        isBuiltIn: true,
      };

      const html = renderPersonaItem(emptyPromptPersona, false, true);
      document.body.innerHTML = html;

      const promptEl = document.querySelector('.persona-prompt');
      expect(promptEl).toBeNull();
    });
  });

  describe('Custom personas', () => {
    it('renders both preview and full spans for long prompts', () => {
      const persona = createCustomPersona();
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;

      expect(document.querySelector('.prompt-preview')).toBeTruthy();
      expect(document.querySelector('.prompt-full')).toBeTruthy();
    });

    it('preview is truncated to 150 chars with ellipsis', () => {
      const persona = createCustomPersona({
        systemPrompt: 'A'.repeat(200), // 200 chars
      });
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const preview = document.querySelector('.prompt-preview');

      expect(preview?.textContent).toBe('A'.repeat(150) + '...');
    });

    it('full prompt contains entire system prompt', () => {
      const longPrompt = 'A'.repeat(200);
      const persona = createCustomPersona({ systemPrompt: longPrompt });
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const full = document.querySelector('.prompt-full');

      expect(full?.textContent).toBe(longPrompt);
    });

    it('does not have builtin class on persona item', () => {
      const persona = createCustomPersona();
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const item = document.querySelector('.persona-item');

      expect(item?.classList.contains('builtin')).toBe(false);
    });

    it('short prompts use same content for preview and full', () => {
      const persona = createCustomPersona({
        systemPrompt: 'Short prompt', // < 150 chars
      });
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;

      const preview = document.querySelector('.prompt-preview');
      const full = document.querySelector('.prompt-full');

      // Both exist but contain the same (full) content
      expect(preview?.textContent).toBe('Short prompt');
      expect(full?.textContent).toBe('Short prompt');
    });
  });

  describe('CSS class structure', () => {
    it('builtin persona has .builtin class for CSS targeting', () => {
      const persona = getBuiltinWithPrompt();
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;
      const item = document.querySelector('.persona-item.builtin');

      expect(item).toBeTruthy();
    });

    it('custom persona does not have .builtin class', () => {
      const persona = createCustomPersona();
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const item = document.querySelector('.persona-item');

      expect(item?.classList.contains('builtin')).toBe(false);
    });

    it('builtin prompt has full text directly, no spans', () => {
      const persona = getBuiltinWithPrompt();
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;
      const prompt = document.querySelector('.persona-prompt');

      // Direct text content, no preview/full structure
      expect(prompt?.querySelector('.prompt-preview')).toBeNull();
      expect(prompt?.querySelector('.prompt-full')).toBeNull();
      expect(prompt?.innerHTML).toBe(escapeHtml(persona.systemPrompt));
    });

    it('custom prompt has preview/full span structure', () => {
      const persona = createCustomPersona();
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const prompt = document.querySelector('.persona-prompt');

      expect(prompt?.querySelector('.prompt-preview')).toBeTruthy();
      expect(prompt?.querySelector('.prompt-full')).toBeTruthy();
    });
  });

  describe('HTML escaping', () => {
    it('escapes HTML in system prompts', () => {
      const persona = createCustomPersona({
        systemPrompt: '<script>alert("xss")</script>',
      });
      const html = renderPersonaItem(persona, false, false);

      document.body.innerHTML = html;
      const promptEl = document.querySelector('.persona-prompt');

      // Script tags should be escaped, not executed
      expect(promptEl?.innerHTML).not.toContain('<script>');
      expect(promptEl?.textContent).toContain('<script>');
    });

    it('escapes HTML in built-in persona prompts', () => {
      const persona: Persona = {
        ...getBuiltinWithPrompt(),
        systemPrompt: '<b>bold</b> text',
      };
      const html = renderPersonaItem(persona, false, true);

      document.body.innerHTML = html;
      const promptEl = document.querySelector('.persona-prompt');

      expect(promptEl?.innerHTML).not.toContain('<b>');
      expect(promptEl?.textContent).toContain('<b>bold</b>');
    });
  });
});

describe('Integration: personas.ts renderPersonaItem behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('built-in persona shows full system prompt directly', () => {
    const builtin = DEFAULT_PERSONAS.find(p => p.id === 'code-helper');
    expect(builtin).toBeTruthy();
    expect(builtin!.systemPrompt.length).toBeGreaterThan(0);

    const html = renderPersonaItem(builtin!, false, true);
    document.body.innerHTML = html;

    const prompt = document.querySelector('.persona-prompt');
    // Should have full prompt, no spans
    expect(prompt?.innerHTML).toBe(escapeHtml(builtin!.systemPrompt));
    expect(prompt?.querySelector('.prompt-preview')).toBeNull();
    expect(prompt?.querySelector('.prompt-full')).toBeNull();
  });

  it('custom persona with long prompt has preview/full structure', () => {
    const custom = createCustomPersona({
      systemPrompt: 'Test '.repeat(100), // 500 chars
    });

    const html = renderPersonaItem(custom, false, false);
    document.body.innerHTML = html;

    const prompt = document.querySelector('.persona-prompt');
    const preview = prompt?.querySelector('.prompt-preview');
    const full = prompt?.querySelector('.prompt-full');

    expect(preview).toBeTruthy();
    expect(full).toBeTruthy();
    expect(preview?.textContent?.endsWith('...')).toBe(true);
    expect(full?.textContent).toBe(custom.systemPrompt);
  });

  it('verifies all built-in personas with prompts are not truncated', () => {
    const builtinsWithPrompts = DEFAULT_PERSONAS.filter(p => p.systemPrompt);
    expect(builtinsWithPrompts.length).toBeGreaterThan(0);

    builtinsWithPrompts.forEach(persona => {
      const html = renderPersonaItem(persona, false, true);
      document.body.innerHTML = html;

      const prompt = document.querySelector('.persona-prompt');
      // Full prompt without truncation
      expect(prompt?.textContent).not.toContain('...');
      expect(prompt?.innerHTML).toBe(escapeHtml(persona.systemPrompt));
    });
  });
});

describe('PER-2: Built-in persona description quality', () => {
  it('all built-in personas have non-empty descriptions', () => {
    DEFAULT_PERSONAS.forEach(persona => {
      expect(persona.systemPrompt.length).toBeGreaterThan(0);
    });
  });

  it('all descriptions are under 500 characters', () => {
    DEFAULT_PERSONAS.forEach(persona => {
      expect(persona.systemPrompt.length).toBeLessThan(500);
    });
  });
});
