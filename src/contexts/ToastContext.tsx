/**
 * ToastContext
 *
 * Re-exports the toast system from Toast.tsx to follow
 * the project's architectural pattern. Use `useToast` from hooks/useToast.ts
 * or import directly from here.
 *
 * @example
 * import { ToastProvider, useToast } from '../contexts/ToastContext'
 */

export {
  ToastProvider,
  useToast,
  type ToastType,
  type ToastItem,
  type ToastContextValue,
} from '../components/Toast'
