import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContextToggle from '../../content/components/ContextToggle'
import { setLanguage } from '../../shared/i18n'

describe('ContextToggle', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  describe('rendering states', () => {
    it('renders disabled state', () => {
      render(
        <ContextToggle
          enabled={false}
          mode="none"
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('No context')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Click to enable context')
    })

    it('renders selection mode', () => {
      render(
        <ContextToggle
          enabled={true}
          mode="selection"
          selectionLength={500}
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('Selection (500 chars)')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Click to switch to full page context')
    })

    it('renders fullpage mode', () => {
      render(
        <ContextToggle
          enabled={true}
          mode="fullpage"
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('Full page')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Click to disable context')
    })
  })

  describe('interactions', () => {
    it('calls onToggle when button clicked', () => {
      const onToggle = vi.fn()
      render(
        <ContextToggle
          enabled={false}
          mode="none"
          onToggle={onToggle}
        />
      )

      fireEvent.click(screen.getByRole('button'))
      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onToggle on each click', () => {
      const onToggle = vi.fn()
      render(
        <ContextToggle
          enabled={true}
          mode="selection"
          selectionLength={100}
          onToggle={onToggle}
        />
      )

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('button'))
      expect(onToggle).toHaveBeenCalledTimes(3)
    })
  })

  describe('edge cases', () => {
    it('handles selection mode without selectionLength', () => {
      render(
        <ContextToggle
          enabled={true}
          mode="selection"
          // selectionLength not provided
          onToggle={() => {}}
        />
      )

      // Should fall through to disabled state since selectionLength is falsy
      expect(screen.getByText('No context')).toBeInTheDocument()
    })

    it('handles zero selection length', () => {
      render(
        <ContextToggle
          enabled={true}
          mode="selection"
          selectionLength={0}
          onToggle={() => {}}
        />
      )

      // 0 is falsy, should show disabled state
      expect(screen.getByText('No context')).toBeInTheDocument()
    })

    it('displays SVG icon in button', () => {
      render(
        <ContextToggle
          enabled={false}
          mode="none"
          onToggle={() => {}}
        />
      )

      // Button should contain SVG icon (NoContextIcon), not emoji
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('state transitions', () => {
    it('updates display when props change', () => {
      const { rerender } = render(
        <ContextToggle
          enabled={false}
          mode="none"
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('No context')).toBeInTheDocument()

      rerender(
        <ContextToggle
          enabled={true}
          mode="selection"
          selectionLength={200}
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('Selection (200 chars)')).toBeInTheDocument()

      rerender(
        <ContextToggle
          enabled={true}
          mode="fullpage"
          onToggle={() => {}}
        />
      )

      expect(screen.getByText('Full page')).toBeInTheDocument()
    })
  })
})
