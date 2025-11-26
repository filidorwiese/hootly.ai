import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Response from '../../content/components/Response'
import { setLanguage } from '../../shared/i18n'
import type { Message } from '../../shared/types'

describe('Response', () => {
  beforeEach(() => {
    setLanguage('en')
    vi.clearAllMocks()
  })

  const createMessage = (role: 'user' | 'assistant', content: string): Message => ({
    role,
    content,
  })

  describe('rendering', () => {
    it('renders empty when no conversation history and no current response', () => {
      const { container } = render(
        <Response
          conversationHistory={[]}
          currentResponse=""
          isLoading={false}
        />
      )
      expect(container.querySelector('[class*="messageContainer"]')).not.toBeInTheDocument()
    })

    it('renders user messages with correct label', () => {
      const history: Message[] = [createMessage('user', 'Hello')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      expect(screen.getByText(/You/)).toBeInTheDocument()
    })

    it('renders assistant messages with correct label', () => {
      const history: Message[] = [createMessage('assistant', 'Hi there')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      expect(screen.getByText(/Claude/)).toBeInTheDocument()
    })

    it('renders multiple messages in order', () => {
      const history: Message[] = [
        createMessage('user', 'First message'),
        createMessage('assistant', 'Second message'),
        createMessage('user', 'Third message'),
      ]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
      expect(screen.getByText('Third message')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows thinking indicator when loading with no response', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse=""
          isLoading={true}
        />
      )
      expect(screen.getByText('Thinking...')).toBeInTheDocument()
    })

    it('shows streaming indicator when loading with current response', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse="Partial response..."
          isLoading={true}
        />
      )
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
      expect(screen.getByText('Partial response...')).toBeInTheDocument()
    })

    it('does not show thinking indicator when not loading', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse=""
          isLoading={false}
        />
      )
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('shows error message when error prop is provided', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse=""
          isLoading={false}
          error="API key is invalid"
        />
      )
      expect(screen.getByText('API key is invalid')).toBeInTheDocument()
      expect(screen.getByText(/Error/)).toBeInTheDocument()
    })

    it('does not show error section when no error', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse=""
          isLoading={false}
          error={null}
        />
      )
      expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })
  })

  describe('markdown rendering', () => {
    it('renders bold text', () => {
      const history: Message[] = [createMessage('assistant', '**bold text**')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const strong = screen.getByText('bold text')
      expect(strong.tagName).toBe('STRONG')
    })

    it('renders italic text', () => {
      const history: Message[] = [createMessage('assistant', '*italic text*')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const em = screen.getByText('italic text')
      expect(em.tagName).toBe('EM')
    })

    it('renders inline code', () => {
      const history: Message[] = [createMessage('assistant', 'Use `console.log` for debugging')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const code = screen.getByText('console.log')
      expect(code.tagName).toBe('CODE')
    })

    it('renders code blocks', () => {
      const history: Message[] = [createMessage('assistant', '```javascript\nconst x = 1;\n```')]
      const { container } = render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      const code = pre?.querySelector('code')
      expect(code).toBeInTheDocument()
      expect(code?.classList.contains('hljs')).toBe(true)
    })

    it('renders lists', () => {
      const history: Message[] = [createMessage('assistant', '- Item 1\n- Item 2\n- Item 3')]
      const { container } = render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const ul = container.querySelector('ul')
      expect(ul).toBeInTheDocument()
      const items = container.querySelectorAll('li')
      expect(items).toHaveLength(3)
    })

    it('renders links', () => {
      const history: Message[] = [createMessage('assistant', '[Example](https://example.com)')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const link = screen.getByText('Example')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('syntax highlighting', () => {
    it('applies syntax highlighting to code blocks with language', () => {
      const history: Message[] = [createMessage('assistant', '```javascript\nconst x = 1;\n```')]
      const { container } = render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const code = container.querySelector('code')
      expect(code?.classList.contains('language-javascript')).toBe(true)
    })

    it('auto-detects language for code blocks without language', () => {
      const history: Message[] = [createMessage('assistant', '```\nfunction test() { return 42; }\n```')]
      const { container } = render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const code = container.querySelector('code')
      expect(code?.classList.contains('hljs')).toBe(true)
    })
  })

  describe('copy button', () => {
    const mockWriteText = vi.fn(() => Promise.resolve())

    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })
      mockWriteText.mockClear()
    })

    it('renders copy button for each message', () => {
      const history: Message[] = [
        createMessage('user', 'Hello'),
        createMessage('assistant', 'Hi there'),
      ]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const copyButtons = screen.getAllByTitle('Copy to clipboard')
      expect(copyButtons).toHaveLength(2)
    })

    it('copies message content to clipboard when clicked', async () => {
      const history: Message[] = [createMessage('assistant', 'Copy this text')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )

      const copyButton = screen.getByTitle('Copy to clipboard')
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(mockWriteText).toHaveBeenCalledWith('Copy this text')
    })

    it('shows checkmark after successful copy', async () => {
      vi.useFakeTimers()
      const history: Message[] = [createMessage('assistant', 'Copy this')]
      render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )

      const copyButton = screen.getByTitle('Copy to clipboard')
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(screen.getByText('✓')).toBeInTheDocument()
      expect(screen.getByTitle('Copied!')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByText('✓')).not.toBeInTheDocument()
      vi.useRealTimers()
    })

    it('renders copy button for streaming response', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse="Streaming content..."
          isLoading={true}
        />
      )
      const copyButton = screen.getByTitle('Copy to clipboard')
      expect(copyButton).toBeInTheDocument()
    })
  })

  describe('current response streaming', () => {
    it('renders current response as assistant message', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse="This is streaming..."
          isLoading={true}
        />
      )
      expect(screen.getByText('This is streaming...')).toBeInTheDocument()
      expect(screen.getByText(/Claude/)).toBeInTheDocument()
    })

    it('renders markdown in streaming response', () => {
      render(
        <Response
          conversationHistory={[]}
          currentResponse="**Bold** and *italic*"
          isLoading={true}
        />
      )
      expect(screen.getByText('Bold').tagName).toBe('STRONG')
      expect(screen.getByText('italic').tagName).toBe('EM')
    })
  })

  describe('auto-scroll', () => {
    it('has scrollable container', () => {
      const history: Message[] = [createMessage('assistant', 'Content')]
      const { container } = render(
        <Response
          conversationHistory={history}
          currentResponse=""
          isLoading={false}
        />
      )
      const scrollContainer = container.firstChild as HTMLElement
      expect(scrollContainer).toHaveStyle({ overflowY: 'auto' })
    })
  })
})
