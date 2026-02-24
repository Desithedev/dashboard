import { useCallback } from 'react'
import { useToast as useToastContext } from '../components/Toast'

/**
 * Convenience hook that exposes toast.success(), toast.error() etc.
 *
 * @example
 * const toast = useToast()
 * toast.success('Copied to clipboard')
 * toast.error('Something went wrong')
 * toast.warning('Be aware')
 * toast.info('Action received')
 */
export function useToast() {
  const { showToast } = useToastContext()

  const success = useCallback(
    (message: string) => showToast('success', message),
    [showToast]
  )
  const error = useCallback(
    (message: string) => showToast('error', message),
    [showToast]
  )
  const warning = useCallback(
    (message: string) => showToast('warning', message),
    [showToast]
  )
  const info = useCallback(
    (message: string) => showToast('info', message),
    [showToast]
  )

  return { success, error, warning, info, showToast }
}
