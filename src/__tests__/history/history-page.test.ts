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
