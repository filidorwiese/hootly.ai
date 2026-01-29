import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputArea from '../../content/components/InputArea'
import { setLanguage } from '../../shared/i18n'
import { DEFAULT_PERSONAS } from '../../shared/types'

describe('InputArea', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    contextEnabled: false,
    contextMode: 'none' as const,
    onContextToggle: vi.fn(),
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

    it('displays model selector when models and onSelectModel provided', () => {
      const models = [
        { id: 'claude-sonnet-4-5-20250514', name: 'Claude Sonnet 4.5', description: 'Latest Sonnet' }
      ]
      render(
        <InputArea
          {...defaultProps}
          modelId="claude-sonnet-4-5-20250514"
          provider="claude"
          models={models}
          onSelectModel={vi.fn()}
        />
      )

      // Model selector should render with formatted model name
      expect(screen.getByLabelText('Select model')).toBeInTheDocument()
      expect(screen.getByText('Claude Sonnet 4.5')).toBeInTheDocument()
    })

    it('does not display model selector when models not provided', () => {
      render(
        <InputArea
          {...defaultProps}
          modelId="claude-sonnet-4-5-20250514"
          provider="claude"
        />
      )

      // Model selector should not be visible without models
      expect(screen.queryByLabelText('Select model')).not.toBeInTheDocument()
    })

    it('does not display token count (UI-5)', () => {
      render(<InputArea {...defaultProps} />)

      expect(screen.queryByText(/tokens/i)).not.toBeInTheDocument()
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

  describe('persona selector in footer (UI-4)', () => {
    it('renders persona selector when persona props provided', () => {
      const onSelectPersona = vi.fn()
      render(
        <InputArea
          {...defaultProps}
          personas={DEFAULT_PERSONAS}
          selectedPersonaId="general"
          onSelectPersona={onSelectPersona}
        />
      )

      // Should show the General persona icon and name
      expect(screen.getByText('🦉')).toBeInTheDocument()
      expect(screen.getByText('General')).toBeInTheDocument()
    })

    it('does not render persona selector when persona props not provided', () => {
      render(<InputArea {...defaultProps} />)

      // Should not find any persona-specific elements
      expect(screen.queryByText('General')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Select persona')).not.toBeInTheDocument()
    })

    it('persona selector is in footer area not header', () => {
      const onSelectPersona = vi.fn()
      const { container } = render(
        <InputArea
          {...defaultProps}
          personas={DEFAULT_PERSONAS}
          selectedPersonaId="code-helper"
          onSelectPersona={onSelectPersona}
        />
      )

      // Persona selector should be rendered alongside context toggle in footer
      expect(screen.getByText('💻')).toBeInTheDocument()
      expect(screen.getByText('Code Helper')).toBeInTheDocument()

      // Both context toggle and persona selector should be siblings in the footer left group
      const contextToggle = screen.getByText('🌐')
      const personaButton = screen.getByLabelText('Select persona')

      // They should share a common ancestor (the footer left group)
      const contextAncestor = contextToggle.closest('button')?.parentElement?.parentElement
      const personaAncestor = personaButton.parentElement?.parentElement

      expect(contextAncestor).toBe(personaAncestor)
    })

    it('calls onSelectPersona when persona is selected', () => {
      const onSelectPersona = vi.fn()
      render(
        <InputArea
          {...defaultProps}
          personas={DEFAULT_PERSONAS}
          selectedPersonaId="general"
          onSelectPersona={onSelectPersona}
        />
      )

      // Click on persona selector to open dropdown
      fireEvent.click(screen.getByText('General'))

      // Click on Code Helper persona
      fireEvent.click(screen.getByText('Code Helper'))

      expect(onSelectPersona).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'code-helper', name: 'Code Helper' })
      )
    })

    it('shows all built-in personas in dropdown', () => {
      const onSelectPersona = vi.fn()
      render(
        <InputArea
          {...defaultProps}
          personas={DEFAULT_PERSONAS}
          selectedPersonaId="general"
          onSelectPersona={onSelectPersona}
        />
      )

      // Open dropdown
      fireEvent.click(screen.getByText('General'))

      // All 5 built-in personas should be visible
      expect(screen.getByText('Code Helper')).toBeInTheDocument()
      expect(screen.getByText('Writer')).toBeInTheDocument()
      expect(screen.getByText('Researcher')).toBeInTheDocument()
      expect(screen.getByText('Translator')).toBeInTheDocument()
    })
  })
})

describe('formatModelName via ModelSelector', () => {
  // Test model name formatting through the ModelSelector component in InputArea
  const renderWithModel = (modelId: string, provider: 'claude' | 'openai' | 'gemini' | 'openrouter') => {
    const models = [{ id: modelId, name: modelId, description: modelId }]
    render(
      <InputArea
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        contextEnabled={false}
        contextMode="none"
        onContextToggle={() => {}}
        modelId={modelId}
        provider={provider}
        models={models}
        onSelectModel={() => {}}
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
