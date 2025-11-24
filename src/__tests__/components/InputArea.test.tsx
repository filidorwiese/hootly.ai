import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputArea from '../../content/components/InputArea'
import { setLanguage } from '../../shared/i18n'

describe('InputArea', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    contextEnabled: false,
    contextMode: 'none' as const,
    onContextToggle: vi.fn(),
    tokenCount: 0,
  }

  beforeEach(() => {
    setLanguage('en')
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders textarea with placeholder', () => {
      render(<InputArea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder')
    })

    it('displays token count', () => {
      render(<InputArea {...defaultProps} tokenCount={150} />)

      expect(screen.getByText('~150 tokens')).toBeInTheDocument()
    })

    it('displays model name when provided', () => {
      render(
        <InputArea
          {...defaultProps}
          modelId="claude-sonnet-4-5-20250514"
          provider="claude"
        />
      )

      expect(screen.getByText('Claude Sonnet 4.5')).toBeInTheDocument()
    })

    it('shows clear button when value exists and not disabled', () => {
      render(<InputArea {...defaultProps} value="test text" />)

      expect(screen.getByLabelText('Clear')).toBeInTheDocument()
    })

    it('hides clear button when value is empty', () => {
      render(<InputArea {...defaultProps} value="" />)

      expect(screen.queryByLabelText('Clear')).not.toBeInTheDocument()
    })

    it('hides clear button when disabled', () => {
      render(<InputArea {...defaultProps} value="test" disabled={true} />)

      expect(screen.queryByLabelText('Clear')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange when typing', async () => {
      const onChange = vi.fn()
      render(<InputArea {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'hello' } })

      expect(onChange).toHaveBeenCalledWith('hello')
    })

    it('calls onSubmit on Enter (without Shift)', () => {
      const onSubmit = vi.fn()
      render(<InputArea {...defaultProps} onSubmit={onSubmit} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('does NOT call onSubmit on Shift+Enter', () => {
      const onSubmit = vi.fn()
      render(<InputArea {...defaultProps} onSubmit={onSubmit} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('clears value when clear button clicked', () => {
      const onChange = vi.fn()
      render(<InputArea {...defaultProps} value="test" onChange={onChange} />)

      fireEvent.click(screen.getByLabelText('Clear'))

      expect(onChange).toHaveBeenCalledWith('')
    })

    it('calls onContextToggle when context toggle clicked', () => {
      const onContextToggle = vi.fn()
      render(<InputArea {...defaultProps} onContextToggle={onContextToggle} />)

      // Click the globe button (ContextToggle)
      const toggleButton = screen.getByText('🌐')
      fireEvent.click(toggleButton)

      expect(onContextToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<InputArea {...defaultProps} disabled={true} />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('enables textarea when disabled prop is false', () => {
      render(<InputArea {...defaultProps} disabled={false} />)

      expect(screen.getByRole('textbox')).not.toBeDisabled()
    })
  })

  describe('context toggle integration', () => {
    it('displays selection mode with char count', () => {
      render(
        <InputArea
          {...defaultProps}
          contextEnabled={true}
          contextMode="selection"
          selectionLength={250}
        />
      )

      expect(screen.getByText('Selection (250 chars)')).toBeInTheDocument()
    })

    it('displays fullpage mode', () => {
      render(
        <InputArea
          {...defaultProps}
          contextEnabled={true}
          contextMode="fullpage"
        />
      )

      expect(screen.getByText('Full page')).toBeInTheDocument()
    })
  })
})

describe('formatModelName', () => {
  // Test model name formatting through the component
  const renderWithModel = (modelId: string, provider?: 'claude' | 'openai' | 'gemini' | 'openrouter') => {
    render(
      <InputArea
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        contextEnabled={false}
        contextMode="none"
        onContextToggle={() => {}}
        tokenCount={0}
        modelId={modelId}
        provider={provider}
      />
    )
  }

  beforeEach(() => {
    setLanguage('en')
  })

  describe('Claude models', () => {
    it('formats claude-sonnet-4-5-20250514', () => {
      renderWithModel('claude-sonnet-4-5-20250514', 'claude')
      expect(screen.getByText('Claude Sonnet 4.5')).toBeInTheDocument()
    })

    it('displays claude-3-5-sonnet model ID (no regex match)', () => {
      renderWithModel('claude-3-5-sonnet-20241022', 'claude')
      // The regex expects claude-sonnet not claude-3-5-sonnet, so returns raw ID
      expect(screen.getByText('claude-3-5-sonnet-20241022')).toBeInTheDocument()
    })

    it('displays claude-3-opus model ID (no regex match)', () => {
      renderWithModel('claude-3-opus-20240229', 'claude')
      // The regex expects claude-opus not claude-3-opus, so returns raw ID
      expect(screen.getByText('claude-3-opus-20240229')).toBeInTheDocument()
    })
  })

  describe('OpenAI models', () => {
    it('formats gpt-4o', () => {
      renderWithModel('gpt-4o', 'openai')
      expect(screen.getByText('GPT 4o')).toBeInTheDocument()
    })

    it('formats o1-preview', () => {
      renderWithModel('o1-preview', 'openai')
      expect(screen.getByText('O1 Preview')).toBeInTheDocument()
    })
  })

  describe('Gemini models', () => {
    it('formats gemini-1.5-pro', () => {
      renderWithModel('gemini-1.5-pro', 'gemini')
      expect(screen.getByText('Gemini 1.5 Pro')).toBeInTheDocument()
    })
  })

  describe('OpenRouter models', () => {
    it('formats anthropic/claude-3.5-sonnet', () => {
      renderWithModel('anthropic/claude-3.5-sonnet', 'openrouter')
      expect(screen.getByText('Claude 3.5 Sonnet')).toBeInTheDocument()
    })
  })
})
