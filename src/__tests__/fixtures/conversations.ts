// Test fixtures for Conversations and Messages

import type { Conversation, Message, PageContext } from '../../shared/types'

export const samplePageContext: PageContext = {
  url: 'https://example.com/article',
  title: 'Sample Article',
  selection: 'This is selected text from the page.',
}

export const fullPageContext: PageContext = {
  url: 'https://example.com/docs',
  title: 'Documentation Page',
  fullPage: 'Full page content goes here. It can be quite long and contain multiple paragraphs.',
  metadata: {
    description: 'Documentation for the example project',
    keywords: 'docs, example, testing',
  },
}

export const userMessage: Message = {
  role: 'user',
  content: 'What is this page about?',
  timestamp: Date.now() - 60000,
  context: samplePageContext,
}

export const assistantMessage: Message = {
  role: 'assistant',
  content: 'This page appears to be a sample article about testing.',
  timestamp: Date.now() - 30000,
}

export const emptyConversation: Conversation = {
  id: 'conv-empty-123',
  title: 'New Conversation',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
}

export const singleMessageConversation: Conversation = {
  id: 'conv-single-456',
  title: 'Quick Question',
  createdAt: Date.now() - 120000,
  updatedAt: Date.now() - 60000,
  messages: [userMessage],
}

export const fullConversation: Conversation = {
  id: 'conv-full-789',
  title: 'Sample Discussion',
  createdAt: Date.now() - 300000,
  updatedAt: Date.now(),
  messages: [userMessage, assistantMessage],
}

export const longConversation: Conversation = {
  id: 'conv-long-101',
  title: 'Extended Chat',
  createdAt: Date.now() - 600000,
  updatedAt: Date.now(),
  messages: [
    { role: 'user', content: 'First question', timestamp: Date.now() - 500000 },
    { role: 'assistant', content: 'First answer', timestamp: Date.now() - 490000 },
    { role: 'user', content: 'Follow up', timestamp: Date.now() - 400000 },
    { role: 'assistant', content: 'Follow up response', timestamp: Date.now() - 390000 },
    { role: 'user', content: 'Another question', timestamp: Date.now() - 300000 },
    { role: 'assistant', content: 'Another answer', timestamp: Date.now() - 290000 },
    { role: 'user', content: 'Final question', timestamp: Date.now() - 200000 },
    { role: 'assistant', content: 'Final response', timestamp: Date.now() - 190000 },
  ],
}

export const oldConversation: Conversation = {
  id: 'conv-old-202',
  title: 'Old Discussion',
  createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
  updatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  messages: [userMessage],
}

export function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    ...overrides,
  }
}

export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    role: 'user',
    content: 'Test message content',
    timestamp: Date.now(),
    ...overrides,
  }
}
