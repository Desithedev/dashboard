import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
// @ts-ignore
import { screen, fireEvent, act } from '@testing-library/react'
import './mocks'
import Modal from '../components/Modal'

function renderModal(overrides: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  }
  return render(<Modal {...defaults} {...overrides} />)
}

describe('Modal', () => {
  describe('Rendering', () => {
    it('does not render when open=false', () => {
      renderModal({ open: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders dialog when open=true', () => {
      renderModal()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('shows title correctly', () => {
      renderModal({ title: 'My Dialog' })
      expect(screen.getByText('My Dialog')).toBeInTheDocument()
    })

    it('shows children', () => {
      renderModal({ children: <p>Hello world</p> })
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      renderModal({ title: 'Aria Test' })
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })

    it('shows description as sr-only when provided', () => {
      renderModal({ description: 'Hidden description' })
      const desc = screen.getByText('Hidden description')
      expect(desc).toHaveClass('sr-only')
    })
  })

  describe('Open/Close', () => {
    it('closes on background click', () => {
      const onClose = vi.fn()
      const { container } = renderModal({ onClose })
      // Click on overlay (first fixed div)
      const overlay = container.querySelector('.modal-backdrop') as HTMLElement
      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on click inside dialog', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.click(screen.getByRole('dialog'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('closes on close button click', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Escape key', () => {
    it('closes modal on Escape', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on other keys', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'a' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Focus trap', () => {
    it('focuses first focusable element when modal opens', async () => {
      renderModal({
        children: (
          <div>
            <button>First button</button>
            <button>Second button</button>
          </div>
        ),
      })
      // requestAnimationFrame is synchronous in jsdom, but we wait a bit
      await act(async () => {
        await new Promise(r => setTimeout(r, 50))
      })
      // Close button is the first focusable element in the dialog
      const closeBtn = screen.getByRole('button', { name: /close/i })
      expect(document.activeElement).toBe(closeBtn)
    })

    it('wraps Tab key around to first element from last', () => {
      const onClose = vi.fn()
      renderModal({
        onClose,
        children: <button>Only button</button>,
      })

      // Focus close button (first)
      const closeBtn = screen.getByRole('button', { name: /close/i })
      closeBtn.focus()

      // Tab from first element → does not wrap (no loop from first)
      fireEvent.keyDown(document, { key: 'Tab' })
      // No error, onClose not called
      expect(onClose).not.toHaveBeenCalled()
    })

    it('receives modal-close event', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      window.dispatchEvent(new Event('modal-close'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Reopening', () => {
    it('switches from closed to open', () => {
      const { rerender } = renderModal({ open: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(
        <Modal open={true} onClose={vi.fn()} title="Test Modal">
          <p>New content</p>
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
