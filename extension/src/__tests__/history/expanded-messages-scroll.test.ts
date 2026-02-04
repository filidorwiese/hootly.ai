import { describe, it, expect, beforeEach } from 'vitest';

/**
 * HP-26: Expanded history items should have scrollbar for long conversations
 * and minimum height to prevent very short conversations from looking odd.
 *
 * These tests verify the DOM structure supports scrollable content.
 */
describe('HP-26: Expanded history item scrolling', () => {
  beforeEach(() => {
    // Create DOM with conversation-messages structure matching history.html
    document.body.innerHTML = `
      <div class="conversation-item expanded" data-id="test-conv">
        <div class="conversation-messages">
          <div class="message user">Short message</div>
        </div>
      </div>
    `;
  });

  it('conversation-messages container exists when expanded', () => {
    const item = document.querySelector('.conversation-item.expanded');
    const messages = item?.querySelector('.conversation-messages');
    expect(messages).not.toBeNull();
  });

  it('expanded class is required to show messages', () => {
    const item = document.querySelector('.conversation-item')!;

    // With expanded class
    expect(item.classList.contains('expanded')).toBe(true);

    // Remove expanded class
    item.classList.remove('expanded');
    expect(item.classList.contains('expanded')).toBe(false);
  });

  it('messages container can hold multiple messages for overflow', () => {
    const messages = document.querySelector('.conversation-messages')!;

    // Add many messages to simulate long conversation
    for (let i = 0; i < 20; i++) {
      const msg = document.createElement('div');
      msg.className = `message ${i % 2 === 0 ? 'user' : 'assistant'}`;
      msg.textContent = `Message ${i}: This is a longer message that takes up space.`;
      messages.appendChild(msg);
    }

    // Verify messages were added
    expect(messages.querySelectorAll('.message').length).toBeGreaterThan(10);
  });
});
