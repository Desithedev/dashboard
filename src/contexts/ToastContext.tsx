/**
 * ToastContext
 *
 * Re-eksporterer toast-systemet fra Toast.tsx for at følge
 * contexts/-konventionen. Brug `useToast` fra hooks/useToast.ts
 * eller importer direkte herfra.
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
