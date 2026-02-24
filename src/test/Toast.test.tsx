import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
// @ts-ignore
import { screen, fireEvent, act } from '@testing-library/react'
import './mocks'
import { ToastProvider, useToast, ToastType } from '../components/Toast'

// ── Helper component to trigger toasts ──────────────────────────────────────
function ToastTrigger({ type, message }: { type: ToastType; message: string }) {
  const { showToast } = useToast()
  return (
    <button onClick={() => showToast(type, message)}>
      Show toast
    </button>
  )
}

function renderWithProvider(type: ToastType = 'info', message = 'Test message') {
  return render(
    <ToastProvider>
      <ToastTrigger type={type} message={message} />
    </ToastProvider>
  )
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Display', () => {
    it('does not show toast by default', () => {
      renderWithProvider()
      expect(screen.queryByText('Test message')).not.toBeInTheDocument()
    })

    it('shows toast after showToast is called', async () => {
      renderWithProvider('info', 'Hello toast')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Hello toast')).toBeInTheDocument()
    })

    it('shows success toast', async () => {
      renderWithProvider('success', 'Success!')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Success!')).toBeInTheDocument()
    })

    it('shows error toast', async () => {
      renderWithProvider('error', 'Something went wrong')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('shows warning toast', async () => {
      renderWithProvider('warning', 'Warning!')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Warning!')).toBeInTheDocument()
    })

    it('shows multiple toasts', async () => {
      render(
        <ToastProvider>
          <ToastTrigger type="info" message="Toast 1" />
          <ToastTrigger type="success" message="Toast 2" />
        </ToastProvider>
      )

      const btns = screen.getAllByText('Show toast')
      fireEvent.click(btns[0])
      fireEvent.click(btns[1])

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
    })
  })

  describe('Manual close', () => {
    it('can be closed manually via close button', async () => {
      renderWithProvider('info', 'Close me')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      const closeBtn = screen.getByRole('button', { name: /close notification/i })
      fireEvent.click(closeBtn)

      expect(screen.queryByText('Close me')).not.toBeInTheDocument()
    })
  })

  describe('Auto-dismiss', () => {
    it('disappears after TOAST_DURATION (4000ms)', async () => {
      renderWithProvider('info', 'Auto-dismiss test')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Auto-dismiss test')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(4100)
      })

      expect(screen.queryByText('Auto-dismiss test')).not.toBeInTheDocument()
    })

    it('remains visible before TOAST_DURATION expires', async () => {
      renderWithProvider('success', 'Still visible')
      fireEvent.click(screen.getByText('Show toast'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('Still visible')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.getByText('Still visible')).toBeInTheDocument()
    })
  })

  describe('Context error', () => {
    it('throws error when useToast is used without provider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => { })

      function BadComponent() {
        useToast()
        return null
      }

      expect(() => render(<BadComponent />)).toThrow(
        'useToast must be used within ToastProvider'
      )

      spy.mockRestore()
    })
  })

  describe('Queue', () => {
    it('handles more than 5 toasts via queue', async () => {
      function MultiTrigger() {
        const { showToast } = useToast()
        return (
          <button onClick={() => {
            for (let i = 1; i <= 7; i++) {
              showToast('info', `Toast ${i}`)
            }
          }}>
            Show many
          </button>
        )
      }

      render(
        <ToastProvider>
          <MultiTrigger />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show many'))

      await act(async () => {
        vi.advanceTimersByTime(50)
      })

      // MAX_VISIBLE = 5, so only 5 visible
      const toastTexts = Array.from(
        document.querySelectorAll('p')
      ).map(el => el.textContent).filter(t => t?.startsWith('Toast'))

      expect(toastTexts.length).toBeLessThanOrEqual(5)
    })
  })
})
