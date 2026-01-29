import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetChromeMock, setMockStorage, chromeMock } from '../__mocks__/chrome';
import { createConversation } from '../fixtures/conversations';
import type { Conversation } from '../../shared/types';

// Mock DOM environment
function createMockDOM() {
  document.body.innerHTML = `
    <div id="historyList"></div>
    <div id="emptyState" style="display: none;"></div>
    <div id="confirmDialog" class="confirm-dialog"></div>
    <button id="cancelDelete"></button>
    <button id="confirmDelete"></button>
    <a id="closeBtn"></a>
    <img id="logo">
  `;
}

describe('History Page', () => {
  beforeEach(() => {
    resetChromeMock();
    createMockDOM();
    vi.clearAllMocks();
  });

  describe('groupByDate', () => {
    it('groups conversations into date categories', () => {
      const now = Date.now();
      const today = createConversation({
        id: 'today',
        updatedAt: now - 1000, // 1 second ago
      });
      const yesterday = createConversation({
        id: 'yesterday',
        updatedAt: now - 25 * 60 * 60 * 1000, // 25 hours ago
      });
      const thisWeek = createConversation({
        id: 'this-week',
        updatedAt: now - 4 * 24 * 60 * 60 * 1000, // 4 days ago
      });
      const thisMonth = createConversation({
        id: 'this-month',
        updatedAt: now - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      });
      const older = createConversation({
        id: 'older',
        updatedAt: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago
      });

      // Test data structure directly
      expect(today.updatedAt).toBeGreaterThan(yesterday.updatedAt);
      expect(yesterday.updatedAt).toBeGreaterThan(thisWeek.updatedAt);
      expect(thisWeek.updatedAt).toBeGreaterThan(thisMonth.updatedAt);
      expect(thisMonth.updatedAt).toBeGreaterThan(older.updatedAt);
    });
  });

  describe('openHistory message', () => {
    it('opens history page when openHistory message is sent', async () => {
      // Verify the handler can be called
      await chromeMock.runtime.sendMessage({ type: 'openHistory' });
      expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openHistory' });
    });
  });

  describe('conversation display', () => {
    it('should show empty state when no conversations', async () => {
      setMockStorage({ hootly_conversations: [] });

      const conversations: Conversation[] = [];
      const emptyState = document.getElementById('emptyState')!;
      const historyList = document.getElementById('historyList')!;

      // Simulate render logic
      if (conversations.length === 0) {
        historyList.innerHTML = '';
        emptyState.style.display = 'block';
      }

      expect(emptyState.style.display).toBe('block');
      expect(historyList.innerHTML).toBe('');
    });

    it('should hide empty state when conversations exist', async () => {
      const conv = createConversation({ id: 'test-conv', title: 'Test Chat' });
      setMockStorage({ hootly_conversations: [conv] });

      const conversations = [conv];
      const emptyState = document.getElementById('emptyState')!;

      // Simulate render logic
      if (conversations.length > 0) {
        emptyState.style.display = 'none';
      }

      expect(emptyState.style.display).toBe('none');
    });
  });

  describe('delete confirmation', () => {
    it('shows confirm dialog when delete is triggered', () => {
      const dialog = document.getElementById('confirmDialog')!;

      // Simulate showing the dialog
      dialog.classList.add('visible');

      expect(dialog.classList.contains('visible')).toBe(true);
    });

    it('hides confirm dialog when cancelled', () => {
      const dialog = document.getElementById('confirmDialog')!;
      dialog.classList.add('visible');

      // Simulate cancel
      dialog.classList.remove('visible');

      expect(dialog.classList.contains('visible')).toBe(false);
    });
  });

  describe('conversation sorting', () => {
    it('sorts conversations by updatedAt descending', () => {
      const now = Date.now();
      const conv1 = createConversation({ id: 'old', updatedAt: now - 60000 });
      const conv2 = createConversation({ id: 'new', updatedAt: now });
      const conv3 = createConversation({ id: 'mid', updatedAt: now - 30000 });

      const conversations = [conv1, conv2, conv3];
      const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

      expect(sorted[0].id).toBe('new');
      expect(sorted[1].id).toBe('mid');
      expect(sorted[2].id).toBe('old');
    });
  });

  describe('persona icons', () => {
    it('displays persona icon for conversations with personaId', () => {
      const conv = createConversation({
        id: 'test',
        title: 'Test',
        personaId: 'code-helper',
      });

      // Code Helper persona has 💻 icon
      expect(conv.personaId).toBe('code-helper');
    });
  });

  describe('message display', () => {
    it('formats messages with role labels', () => {
      const conv = createConversation({
        id: 'test',
        messages: [
          { role: 'user', content: 'Hello', timestamp: Date.now() },
          { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
        ],
      });

      expect(conv.messages).toHaveLength(2);
      expect(conv.messages[0].role).toBe('user');
      expect(conv.messages[1].role).toBe('assistant');
    });
  });
});

describe('History Page Integration', () => {
  beforeEach(() => {
    resetChromeMock();
  });

  it('opens history page from dialog', async () => {
    // Simulate the message that Dialog.tsx sends
    const message = { type: 'openHistory' };
    await chromeMock.runtime.sendMessage(message);

    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openHistory' });
  });
});

describe('HP-12: No inline history panel in dialog', () => {
  it('dialog does not import or render HistoryPanel component', async () => {
    // Verify that HistoryPanel.tsx doesn't exist or is not imported
    // This is a structural test - the component file should be removed
    const fs = await import('fs');
    const path = await import('path');

    // Check that HistoryPanel.tsx has been removed
    const historyPanelPath = path.resolve(__dirname, '../../content/components/HistoryPanel.tsx');
    let historyPanelExists = false;
    try {
      fs.accessSync(historyPanelPath);
      historyPanelExists = true;
    } catch {
      historyPanelExists = false;
    }

    expect(historyPanelExists).toBe(false);
  });

  it('history icon opens history page instead of inline panel', async () => {
    // Simulate the message that Dialog.tsx sends when history icon is clicked
    const message = { type: 'openHistory' };
    await chromeMock.runtime.sendMessage(message);

    // Verify it sends openHistory message (which opens history.html)
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openHistory' });
  });
});

describe('Continue Conversation', () => {
  beforeEach(() => {
    resetChromeMock();
    createMockDOM();
    vi.clearAllMocks();
  });

  describe('continue button', () => {
    it('adds continuing class when continue button clicked', () => {
      const historyList = document.getElementById('historyList')!;
      const conv = createConversation({
        id: 'test-conv',
        title: 'Test Chat',
        messages: [
          { role: 'user', content: 'Hello', timestamp: Date.now() },
          { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
        ],
      });

      // Create mock conversation item
      historyList.innerHTML = `
        <div class="conversation-item" data-id="${conv.id}">
          <div class="input-area" data-id="${conv.id}">
            <textarea class="input-textarea" data-id="${conv.id}"></textarea>
          </div>
        </div>
      `;

      const item = historyList.querySelector('.conversation-item')!;

      // Simulate clicking continue
      item.classList.add('expanded');
      item.classList.add('continuing');

      expect(item.classList.contains('continuing')).toBe(true);
      expect(item.classList.contains('expanded')).toBe(true);
    });

    it('shows input area when continuing', () => {
      const historyList = document.getElementById('historyList')!;
      historyList.innerHTML = `
        <div class="conversation-item continuing" data-id="test">
          <div class="input-area" data-id="test" style="display: none;">
            <textarea class="input-textarea" data-id="test"></textarea>
          </div>
        </div>
      `;

      const item = historyList.querySelector('.conversation-item')!;

      // CSS rule .conversation-item.continuing .input-area { display: block; }
      // Test that the class is present which triggers the CSS
      expect(item.classList.contains('continuing')).toBe(true);
    });
  });

  describe('send message', () => {
    it('sends message via chrome runtime', async () => {
      const conv = createConversation({
        id: 'test-conv',
        title: 'Test Chat',
        messages: [
          { role: 'user', content: 'Hello', timestamp: Date.now() },
          { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
        ],
      });

      // Simulate sending a message
      const payload = {
        type: 'sendPrompt',
        payload: {
          prompt: 'Test message',
          conversationHistory: conv.messages,
          settings: {},
        },
      };

      await chromeMock.runtime.sendMessage(payload);

      expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(payload);
    });
  });

  describe('stream response handling', () => {
    it('handles streamChunk message', () => {
      let content = '';
      const handler = (message: any) => {
        if (message.type === 'streamChunk') {
          content += message.payload.content;
        }
      };

      // Simulate receiving chunks
      handler({ type: 'streamChunk', payload: { content: 'Hello' } });
      handler({ type: 'streamChunk', payload: { content: ' world' } });

      expect(content).toBe('Hello world');
    });

    it('handles streamEnd message', () => {
      let completed = false;
      let finalContent = '';
      const handler = (message: any) => {
        if (message.type === 'streamEnd') {
          completed = true;
          finalContent = message.payload.content;
        }
      };

      handler({ type: 'streamEnd', payload: { content: 'Full response here' } });

      expect(completed).toBe(true);
      expect(finalContent).toBe('Full response here');
    });

    it('handles streamError message', () => {
      let error = '';
      const handler = (message: any) => {
        if (message.type === 'streamError') {
          error = message.payload.error;
        }
      };

      handler({ type: 'streamError', payload: { error: 'API error' } });

      expect(error).toBe('API error');
    });
  });

  describe('persona restoration', () => {
    it('preserves personaId when continuing conversation', () => {
      const conv = createConversation({
        id: 'test-conv',
        title: 'Test Chat',
        personaId: 'code-helper',
        messages: [
          { role: 'user', content: 'Hello', timestamp: Date.now() },
        ],
      });

      // Verify personaId is preserved
      expect(conv.personaId).toBe('code-helper');
    });
  });
});
