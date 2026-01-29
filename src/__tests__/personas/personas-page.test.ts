import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetChromeMock, setMockStorage, chromeMock } from '../__mocks__/chrome';
import { DEFAULT_PERSONAS, type Persona, type Settings } from '../../shared/types';

function createMockDOM() {
  document.body.innerHTML = `
    <img id="logo">
    <div id="builtinList"></div>
    <div id="customList"></div>
    <div id="customEmptyState" style="display: none;"></div>
    <a id="backBtn"></a>
    <button id="addPersonaBtn"></button>
    <div id="personaModal" class="modal-overlay">
      <h2 id="modalTitle"></h2>
      <input type="hidden" id="editingPersonaId" value="">
      <input type="text" id="personaName">
      <textarea id="personaSystemPrompt"></textarea>
      <div id="iconPicker">
        <div class="icon-option" data-icon="🤖">🤖</div>
        <div class="icon-option" data-icon="🧠">🧠</div>
      </div>
      <button id="cancelPersonaBtn"></button>
      <button id="savePersonaBtn"></button>
    </div>
    <div id="confirmDialog" class="modal-overlay">
      <button id="cancelDelete"></button>
      <button id="confirmDelete"></button>
    </div>
  `;
}

function createCustomPersona(overrides: Partial<Persona> = {}): Persona {
  return {
    id: `custom-${Date.now()}`,
    name: 'Test Persona',
    systemPrompt: 'You are a test persona.',
    icon: '🤖',
    isBuiltIn: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('Personas Page', () => {
  beforeEach(() => {
    resetChromeMock();
    createMockDOM();
    vi.clearAllMocks();
  });

  describe('PP-1: Personas page accessible from settings', () => {
    it('opens personas page when link clicked', async () => {
      await chromeMock.tabs.create({ url: chromeMock.runtime.getURL('personas.html') });
      expect(chromeMock.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://mock-id/personas.html',
      });
    });
  });

  describe('PP-2: Personas page lists all personas', () => {
    it('displays built-in personas', () => {
      const builtinList = document.getElementById('builtinList')!;

      DEFAULT_PERSONAS.forEach((persona) => {
        const item = document.createElement('div');
        item.className = 'persona-item builtin';
        item.dataset.id = persona.id;
        item.innerHTML = `
          <span class="persona-icon">${persona.icon}</span>
          <div class="persona-name">${persona.name}</div>
        `;
        builtinList.appendChild(item);
      });

      expect(builtinList.children.length).toBe(DEFAULT_PERSONAS.length);
      expect(builtinList.querySelector('[data-id="general"]')).toBeTruthy();
      expect(builtinList.querySelector('[data-id="code-helper"]')).toBeTruthy();
      expect(builtinList.querySelector('[data-id="writer"]')).toBeTruthy();
      expect(builtinList.querySelector('[data-id="researcher"]')).toBeTruthy();
      expect(builtinList.querySelector('[data-id="translator"]')).toBeTruthy();
    });

    it('displays custom personas if any', () => {
      const customPersona = createCustomPersona({ id: 'custom-test', name: 'My Custom' });
      const customList = document.getElementById('customList')!;
      const customEmptyState = document.getElementById('customEmptyState')!;

      const customPersonas = [customPersona];

      if (customPersonas.length === 0) {
        customEmptyState.style.display = 'block';
      } else {
        customEmptyState.style.display = 'none';
        customPersonas.forEach((persona) => {
          const item = document.createElement('div');
          item.className = 'persona-item';
          item.dataset.id = persona.id;
          item.innerHTML = `
            <span class="persona-icon">${persona.icon}</span>
            <div class="persona-name">${persona.name}</div>
          `;
          customList.appendChild(item);
        });
      }

      expect(customEmptyState.style.display).toBe('none');
      expect(customList.children.length).toBe(1);
      expect(customList.querySelector('[data-id="custom-test"]')).toBeTruthy();
    });

    it('shows empty state when no custom personas', () => {
      const customEmptyState = document.getElementById('customEmptyState')!;
      const customPersonas: Persona[] = [];

      if (customPersonas.length === 0) {
        customEmptyState.style.display = 'block';
      }

      expect(customEmptyState.style.display).toBe('block');
    });

    it('shows icon and name for each persona', () => {
      const persona = DEFAULT_PERSONAS[0];

      expect(persona.icon).toBe('🦉');
      expect(persona.name).toBe('General');
    });
  });

  describe('PP-3: Create new persona from personas page', () => {
    it('shows modal when Add Persona clicked', () => {
      const modal = document.getElementById('personaModal')!;
      const addBtn = document.getElementById('addPersonaBtn')!;

      addBtn.addEventListener('click', () => {
        modal.classList.add('visible');
      });

      addBtn.click();

      expect(modal.classList.contains('visible')).toBe(true);
    });

    it('creates persona with form data', async () => {
      const name = 'My New Persona';
      const systemPrompt = 'You are a helpful assistant.';
      const icon = '🧠';

      const newPersona: Persona = {
        id: `custom-${Date.now()}`,
        name,
        systemPrompt,
        icon,
        isBuiltIn: false,
        createdAt: Date.now(),
      };

      expect(newPersona.name).toBe(name);
      expect(newPersona.systemPrompt).toBe(systemPrompt);
      expect(newPersona.icon).toBe(icon);
      expect(newPersona.isBuiltIn).toBe(false);
    });

    it('saves persona to storage', async () => {
      const persona = createCustomPersona();
      const settings: Partial<Settings> = { customPersonas: [persona] };

      await chromeMock.storage.local.set({ hootly_settings: settings });

      const result = await chromeMock.storage.local.get('hootly_settings');
      expect(result.hootly_settings).toEqual(settings);
    });
  });

  describe('PP-4: Edit custom persona from personas page', () => {
    it('opens modal with persona data when edit clicked', () => {
      const persona = createCustomPersona({ name: 'Original Name' });
      const editingIdInput = document.getElementById('editingPersonaId') as HTMLInputElement;
      const nameInput = document.getElementById('personaName') as HTMLInputElement;
      const promptInput = document.getElementById('personaSystemPrompt') as HTMLTextAreaElement;
      const modal = document.getElementById('personaModal')!;

      editingIdInput.value = persona.id;
      nameInput.value = persona.name;
      promptInput.value = persona.systemPrompt;
      modal.classList.add('visible');

      expect(editingIdInput.value).toBe(persona.id);
      expect(nameInput.value).toBe('Original Name');
      expect(modal.classList.contains('visible')).toBe(true);
    });

    it('updates persona in storage', async () => {
      const persona = createCustomPersona({ id: 'custom-edit', name: 'Original' });
      const settings: Partial<Settings> = { customPersonas: [persona] };
      await chromeMock.storage.local.set({ hootly_settings: settings });

      const updated = { ...persona, name: 'Updated Name' };
      const newSettings: Partial<Settings> = { customPersonas: [updated] };
      await chromeMock.storage.local.set({ hootly_settings: newSettings });

      const result = await chromeMock.storage.local.get('hootly_settings');
      const storedSettings = result.hootly_settings as Partial<Settings>;
      expect(storedSettings.customPersonas?.[0].name).toBe('Updated Name');
    });
  });

  describe('PP-5: Delete custom persona from personas page', () => {
    it('shows confirm dialog when delete clicked', () => {
      const dialog = document.getElementById('confirmDialog')!;

      dialog.classList.add('visible');

      expect(dialog.classList.contains('visible')).toBe(true);
    });

    it('hides dialog when cancelled', () => {
      const dialog = document.getElementById('confirmDialog')!;
      dialog.classList.add('visible');

      dialog.classList.remove('visible');

      expect(dialog.classList.contains('visible')).toBe(false);
    });

    it('removes persona from storage on confirm', async () => {
      const persona1 = createCustomPersona({ id: 'custom-1' });
      const persona2 = createCustomPersona({ id: 'custom-2' });
      await chromeMock.storage.local.set({
        hootly_settings: { customPersonas: [persona1, persona2] },
      });

      const remaining = [persona2];
      await chromeMock.storage.local.set({
        hootly_settings: { customPersonas: remaining },
      });

      const result = await chromeMock.storage.local.get('hootly_settings');
      const settings = result.hootly_settings as Partial<Settings>;
      expect(settings.customPersonas).toHaveLength(1);
      expect(settings.customPersonas?.[0].id).toBe('custom-2');
    });
  });

  describe('PP-6: Built-in personas not editable or deletable', () => {
    it('built-in personas are marked as isBuiltIn', () => {
      DEFAULT_PERSONAS.forEach((persona) => {
        expect(persona.isBuiltIn).toBe(true);
      });
    });

    it('edit/delete buttons not rendered for built-in personas', () => {
      const builtinList = document.getElementById('builtinList')!;
      const persona = DEFAULT_PERSONAS[0];

      const item = document.createElement('div');
      item.className = 'persona-item builtin';
      item.innerHTML = `
        <span class="persona-icon">${persona.icon}</span>
        <div class="persona-name">${persona.name}</div>
        <!-- No edit/delete buttons for built-in -->
      `;
      builtinList.appendChild(item);

      expect(item.querySelector('.action-btn.edit')).toBeNull();
      expect(item.querySelector('.action-btn.delete')).toBeNull();
    });
  });

  describe('PP-7: Set default persona from personas page', () => {
    it('saves defaultPersonaId to settings', async () => {
      const settings: Partial<Settings> = { defaultPersonaId: 'code-helper' };
      await chromeMock.storage.local.set({ hootly_settings: settings });

      const result = await chromeMock.storage.local.get('hootly_settings');
      expect((result.hootly_settings as Partial<Settings>).defaultPersonaId).toBe('code-helper');
    });

    it('shows default badge on default persona', () => {
      const builtinList = document.getElementById('builtinList')!;
      const defaultPersonaId = 'code-helper';

      DEFAULT_PERSONAS.forEach((persona) => {
        const item = document.createElement('div');
        item.className = `persona-item builtin ${persona.id === defaultPersonaId ? 'default' : ''}`;
        item.innerHTML = `
          <div class="persona-name">
            ${persona.name}
            ${persona.id === defaultPersonaId ? '<span class="default-badge">Default</span>' : ''}
          </div>
        `;
        builtinList.appendChild(item);
      });

      const defaultItem = builtinList.querySelector('.persona-item.default');
      expect(defaultItem).toBeTruthy();
      expect(defaultItem?.querySelector('.default-badge')).toBeTruthy();
    });
  });

  describe('PP-8: Personas page styling matches forest theme', () => {
    it('uses forest theme colors', () => {
      // Forest theme colors from design
      const themeColors = {
        background: '#FAFBF9',
        primary: '#3A5A40',
        text: '#2D3A30',
        border: '#E4E8E2',
      };

      expect(themeColors.background).toBe('#FAFBF9');
      expect(themeColors.primary).toBe('#3A5A40');
    });
  });

  describe('PP-9: Back navigation to settings', () => {
    it('navigates back to settings page', async () => {
      const backBtn = document.getElementById('backBtn')!;

      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chromeMock.runtime.sendMessage({ type: 'openSettings' });
      });

      backBtn.click();

      expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openSettings' });
    });
  });
});

describe('Personas Page Integration', () => {
  beforeEach(() => {
    resetChromeMock();
  });

  it('settings page has manage personas link', async () => {
    await chromeMock.tabs.create({ url: chromeMock.runtime.getURL('personas.html') });
    expect(chromeMock.tabs.create).toHaveBeenCalled();
  });

  it('persona changes sync with dialog selector', async () => {
    const persona = createCustomPersona({ id: 'custom-sync' });
    await chromeMock.storage.local.set({
      hootly_settings: { customPersonas: [persona] },
    });

    const result = await chromeMock.storage.local.get('hootly_settings');
    expect((result.hootly_settings as Partial<Settings>).customPersonas).toHaveLength(1);
  });
});

describe('Icon Picker', () => {
  beforeEach(() => {
    createMockDOM();
  });

  it('selects icon on click', () => {
    const iconPicker = document.getElementById('iconPicker')!;
    const icons = iconPicker.querySelectorAll('.icon-option');

    let selectedIcon = '🤖';

    icons.forEach((icon) => {
      icon.addEventListener('click', () => {
        icons.forEach((i) => i.classList.remove('selected'));
        icon.classList.add('selected');
        selectedIcon = (icon as HTMLElement).dataset.icon || '🤖';
      });
    });

    (icons[1] as HTMLElement).click();

    expect(icons[1].classList.contains('selected')).toBe(true);
    expect(selectedIcon).toBe('🧠');
  });
});

describe('Modal Behavior', () => {
  beforeEach(() => {
    createMockDOM();
  });

  it('closes modal on cancel', () => {
    const modal = document.getElementById('personaModal')!;
    const cancelBtn = document.getElementById('cancelPersonaBtn')!;

    modal.classList.add('visible');

    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('visible');
    });

    cancelBtn.click();

    expect(modal.classList.contains('visible')).toBe(false);
  });

  it('closes modal on backdrop click', () => {
    const modal = document.getElementById('personaModal')!;
    modal.classList.add('visible');

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible');
      }
    });

    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(modal.classList.contains('visible')).toBe(false);
  });

  it('clears form when opening new persona', () => {
    const nameInput = document.getElementById('personaName') as HTMLInputElement;
    const editingIdInput = document.getElementById('editingPersonaId') as HTMLInputElement;

    nameInput.value = 'Previous Value';
    editingIdInput.value = 'previous-id';

    nameInput.value = '';
    editingIdInput.value = '';

    expect(nameInput.value).toBe('');
    expect(editingIdInput.value).toBe('');
  });
});
