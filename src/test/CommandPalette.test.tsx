import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import './mocks'
import { ToastProvider } from '../components/Toast'
import CommandPalette from '../components/CommandPalette'

function renderPalette(overrides: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    onNavigate: vi.fn(),
  }
  return render(
    <ToastProvider>
      <CommandPalette {...defaults} {...overrides} />
    </ToastProvider>
  )
}

describe('CommandPalette', () => {
  describe('Rendering', () => {
    it('does not render when open=false', () => {
      renderPalette({ open: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders dialog when open=true', () => {
      renderPalette()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has search input', () => {
      renderPalette()
      // The mock returns 'commandPalette.placeholder' if no fallback is provided, 
      // but in the component we should ideally have fallbacks or the keys.
      // Let's assume the keys for now to be safe.
      expect(screen.getByPlaceholderText('commandPalette.placeholder')).toBeInTheDocument()
    })

    it('shows "Pages" section header', () => {
      renderPalette()
      expect(screen.getByText('commandPalette.sectionPages')).toBeInTheDocument()
    })

    it('shows "Actions" section header', () => {
      renderPalette()
      expect(screen.getByText('commandPalette.sectionActions')).toBeInTheDocument()
    })

    it('shows nav items by default', () => {
      renderPalette()
      expect(screen.getByText('nav.item.dashboard')).toBeInTheDocument()
      expect(screen.getByText('nav.item.tasks')).toBeInTheDocument()
      expect(screen.getByText('nav.item.settings')).toBeInTheDocument()
    })

    it('shows keyboard hints in footer', () => {
      renderPalette()
      expect(screen.getByText('commandPalette.hintNavigate')).toBeInTheDocument()
      expect(screen.getByText('commandPalette.hintSelect')).toBeInTheDocument()
      expect(screen.getByText('commandPalette.hintClose')).toBeInTheDocument()
    })
  })

  describe('Searching', () => {
    it('filters nav pages by search', async () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.change(input, { target: { value: 'tasks' } })

      await waitFor(() => {
        expect(screen.getByText('nav.item.tasks')).toBeInTheDocument()
        expect(screen.queryByText('nav.item.dashboard')).not.toBeInTheDocument()
      })
    })

    it('filters actions by search', async () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.change(input, { target: { value: 'github' } })

      await waitFor(() => {
        expect(screen.getByText('commandPalette.actions.openGitHub')).toBeInTheDocument()
        expect(screen.queryByText('nav.item.dashboard')).not.toBeInTheDocument()
      })
    })

    it('shows "No results" when none found', async () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.change(input, { target: { value: 'XXXXXXXXXX' } })

      await waitFor(() => {
        expect(screen.getByText('commandPalette.noResults')).toBeInTheDocument()
      })
    })

    it('fuzzy matches pages', async () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.change(input, { target: { value: 'dshboard' } }) // fuzzy for "dashboard"

      await waitFor(() => {
        expect(screen.getByText('nav.item.dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard navigation', () => {
    it('closes on backdrop click', () => {
      const onClose = vi.fn()
      const { container } = renderPalette({ onClose })
      const backdrop = container.firstChild as HTMLElement
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('navigates down with ArrowDown', () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      const options = screen.getAllByRole('option')
      // Second element is now selected (index 1)
      expect(options[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('navigates up with ArrowUp from position 1', () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.keyDown(input, { key: 'ArrowDown' }) // → index 1
      fireEvent.keyDown(input, { key: 'ArrowUp' })   // → index 0

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('does not navigate below index 0 with ArrowUp', () => {
      renderPalette()
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      fireEvent.keyDown(input, { key: 'ArrowUp' }) // already at 0

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('selects current element with Enter', () => {
      const onNavigate = vi.fn()
      renderPalette({ onNavigate })
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      // First element is 'dashboard'
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onNavigate).toHaveBeenCalledWith('dashboard')
    })

    it('resets search when dialog opens', () => {
      const { rerender } = renderPalette({ open: false })
      rerender(
        <ToastProvider>
          <CommandPalette open={true} onClose={vi.fn()} onNavigate={vi.fn()} />
        </ToastProvider>
      )
      const input = screen.getByPlaceholderText('commandPalette.placeholder')
      expect(input).toHaveValue('')
    })
  })

  describe('Navigation and actions', () => {
    it('calls onNavigate and onClose when clicking a page', () => {
      const onNavigate = vi.fn()
      const onClose = vi.fn()
      renderPalette({ onNavigate, onClose })

      fireEvent.click(screen.getByText('nav.item.tasks'))
      expect(onNavigate).toHaveBeenCalledWith('tasks')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('selection changes on hover', () => {
      renderPalette()
      const options = screen.getAllByRole('option')
      fireEvent.mouseEnter(options[2])
      expect(options[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('does not close when clicking inside dialog', () => {
      const onClose = vi.fn()
      renderPalette({ onClose })
      fireEvent.click(screen.getByRole('dialog'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
