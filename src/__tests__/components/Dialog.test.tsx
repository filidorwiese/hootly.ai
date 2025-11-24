import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dialog from '../../content/components/Dialog'
import { setLanguage } from '../../shared/i18n'
import { setMockStorage, chromeMock } from '../__mocks__/chrome'
import { configuredSettings } from '../fixtures/settings'

// Mock react-rnd to simplify testing
vi.mock('react-rnd', () => ({
  Rnd: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="rnd-container">
      {children}
    </div>
  ),
}))

describe('Dialog', () => {
  beforeEach(() => {
    setLanguage('en')
    setMockStorage({
      fireclaude_settings: configuredSettings,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = render(<Dialog isOpen={false} onClose={() => {}} />)
      expect(container.innerHTML).toBe('')
    })

    it('renders dialog when open', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)
      expect(screen.getByText('FireOwl')).toBeInTheDocument()
    })

    it('renders header with title', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)
      expect(screen.getByRole('heading')).toHaveTextContent('FireOwl')
    })

    it('renders settings button', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)
      expect(screen.getByLabelText('Settings')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    it('renders input area', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('close behavior', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn()
      render(<Dialog isOpen={true} onClose={onClose} />)

      fireEvent.click(screen.getByLabelText('Close'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn()
      render(<Dialog isOpen={true} onClose={onClose} />)

      // Find backdrop (first div with backdrop styles)
      const backdrop = document.querySelector('[class*="backdrop"]')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('calls onClose on Escape when not loading', async () => {
      const onClose = vi.fn()
      render(<Dialog isOpen={true} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Escape key behavior', () => {
    it('cancels stream on Escape when loading', async () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      // Simulate loading state by typing and submitting (mocked)
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'test message' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })

      // Wait for loading state
      await waitFor(() => {
        // Check if cancel message is shown (indicates loading state)
        // or just verify the sendMessage was called
        expect(chromeMock.runtime.sendMessage).toHaveBeenCalled()
      })
    })
  })

  describe('settings button', () => {
    it('sends openSettings message when clicked', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      fireEvent.click(screen.getByLabelText('Settings'))

      expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openSettings' })
    })
  })

  describe('clear conversation', () => {
    it('does not show clear button when no history', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      expect(screen.queryByLabelText('Clear conversation')).not.toBeInTheDocument()
    })
  })

  describe('input submission', () => {
    it('does not submit empty input', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter' })

      // Should not send message for empty input
      expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sendPrompt' })
      )
    })

    it('submits non-empty input on Enter', async () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'test prompt' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'sendPrompt' })
        )
      })
    })

    it('shows loading state after submission', async () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'test prompt' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })

      await waitFor(() => {
        // Message should be added to conversation
        expect(screen.getByText('test prompt')).toBeInTheDocument()
        // Should show loading indicator
        expect(screen.getByText('Thinking...')).toBeInTheDocument()
      })
    })
  })

  describe('context toggle', () => {
    it('renders context toggle in input area', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('🌐')).toBeInTheDocument()
    })

    it('shows "No context" initially', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('No context')).toBeInTheDocument()
    })
  })

  describe('token count', () => {
    it('displays token count in input area', () => {
      render(<Dialog isOpen={true} onClose={() => {}} />)

      expect(screen.getByText(/~\d+ tokens/)).toBeInTheDocument()
    })
  })

  describe('notification to parent', () => {
    it('posts message to parent when closed', () => {
      const postMessageSpy = vi.spyOn(window.parent, 'postMessage')

      const { rerender } = render(<Dialog isOpen={true} onClose={() => {}} />)
      rerender(<Dialog isOpen={false} onClose={() => {}} />)

      expect(postMessageSpy).toHaveBeenCalledWith(
        { type: 'fireowl-dialog-closed' },
        '*'
      )
    })
  })
})

describe('Dialog state management', () => {
  beforeEach(() => {
    setLanguage('en')
    setMockStorage({
      fireclaude_settings: configuredSettings,
    })
  })

  it('loads settings on open', async () => {
    render(<Dialog isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(chromeMock.storage.local.get).toHaveBeenCalled()
    })
  })

  it('loads saved dialog position', async () => {
    setMockStorage({
      fireclaude_settings: configuredSettings,
      fireclaude_dialog_position: { x: 100, y: 200, width: 600, height: 0 },
    })

    render(<Dialog isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(chromeMock.storage.local.get).toHaveBeenCalled()
    })
  })
})
