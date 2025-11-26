import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

// Helper to render Dialog and wait for async effects
async function renderDialog(props: { isOpen: boolean; onClose: () => void }) {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(<Dialog {...props} />)
    // Wait for async useEffects to settle
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  return result!
}

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
    it('renders nothing when closed', async () => {
      const { container } = await renderDialog({ isOpen: false, onClose: () => {} })
      expect(container.innerHTML).toBe('')
    })

    it('renders dialog when open', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })
      expect(screen.getByText('Hootly')).toBeInTheDocument()
    })

    it('renders header with title', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })
      expect(screen.getByRole('heading')).toHaveTextContent('Hootly')
    })

    it('renders settings button', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })
      expect(screen.getByLabelText('Settings')).toBeInTheDocument()
    })

    it('renders close button', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    it('renders input area', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('close behavior', () => {
    it('calls onClose when close button clicked', async () => {
      const onClose = vi.fn()
      await renderDialog({ isOpen: true, onClose })

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Close'))
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', async () => {
      const onClose = vi.fn()
      await renderDialog({ isOpen: true, onClose })

      const backdrop = document.querySelector('[class*="backdrop"]')
      if (backdrop) {
        await act(async () => {
          fireEvent.click(backdrop)
        })
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('calls onClose on Escape when not loading', async () => {
      const onClose = vi.fn()
      await renderDialog({ isOpen: true, onClose })

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Escape key behavior', () => {
    it('cancels stream on Escape when loading', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      const textarea = screen.getByRole('textbox')
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test message' } })
        fireEvent.keyDown(textarea, { key: 'Enter' })
      })

      await waitFor(() => {
        expect(chromeMock.runtime.sendMessage).toHaveBeenCalled()
      })
    })
  })

  describe('settings button', () => {
    it('sends openSettings message when clicked', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Settings'))
      })

      expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'openSettings' })
    })
  })

  describe('clear conversation', () => {
    it('does not show clear button when no history', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      expect(screen.queryByLabelText('Clear conversation')).not.toBeInTheDocument()
    })
  })

  describe('input submission', () => {
    it('does not submit empty input', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      const textarea = screen.getByRole('textbox')
      await act(async () => {
        fireEvent.keyDown(textarea, { key: 'Enter' })
      })

      expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'sendPrompt' })
      )
    })

    it('submits non-empty input on Enter', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      const textarea = screen.getByRole('textbox')
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test prompt' } })
        fireEvent.keyDown(textarea, { key: 'Enter' })
      })

      await waitFor(() => {
        expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'sendPrompt' })
        )
      })
    })

    it('shows loading state after submission', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      const textarea = screen.getByRole('textbox')
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'test prompt' } })
        fireEvent.keyDown(textarea, { key: 'Enter' })
      })

      await waitFor(() => {
        expect(screen.getByText('test prompt')).toBeInTheDocument()
        expect(screen.getByText('Thinking...')).toBeInTheDocument()
      })
    })
  })

  describe('context toggle', () => {
    it('renders context toggle in input area', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      expect(screen.getByText('🌐')).toBeInTheDocument()
    })

    it('shows "No context" initially', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      expect(screen.getByText('No context')).toBeInTheDocument()
    })
  })

  describe('token count', () => {
    it('displays token count in input area', async () => {
      await renderDialog({ isOpen: true, onClose: () => {} })

      expect(screen.getByText(/~\d+ tokens/)).toBeInTheDocument()
    })
  })

  describe('notification to parent', () => {
    it('posts message to parent when closed', async () => {
      const postMessageSpy = vi.spyOn(window.parent, 'postMessage')

      let rerender: ReturnType<typeof render>['rerender']
      await act(async () => {
        const result = render(<Dialog isOpen={true} onClose={() => {}} />)
        rerender = result.rerender
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        rerender(<Dialog isOpen={false} onClose={() => {}} />)
      })

      expect(postMessageSpy).toHaveBeenCalledWith(
        { type: 'hootly-dialog-closed' },
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
    await renderDialog({ isOpen: true, onClose: () => {} })

    expect(chromeMock.storage.local.get).toHaveBeenCalled()
  })

  it('loads saved dialog position', async () => {
    setMockStorage({
      fireclaude_settings: configuredSettings,
      fireclaude_dialog_position: { x: 100, y: 200, width: 600, height: 0 },
    })

    await renderDialog({ isOpen: true, onClose: () => {} })

    expect(chromeMock.storage.local.get).toHaveBeenCalled()
  })
})
