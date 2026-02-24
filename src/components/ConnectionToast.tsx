import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveData } from '../api/LiveDataContext'
import { useToast } from './Toast'

/**
 * ConnectionToast monitors LiveDataContext and shows toast notifications
 * when the API connection is lost (first time) and when restored.
 */
export default function ConnectionToast() {
  const { isConnected } = useLiveData()
  const { showToast } = useToast()
  const { t } = useTranslation()

  const wasConnected = useRef<boolean | null>(null)
  const hasShownErrorToast = useRef(false)

  useEffect(() => {
    // Skip first render (initialization)
    if (wasConnected.current === null) {
      wasConnected.current = isConnected
      return
    }

    // Connection lost → show error toast (only once)
    if (wasConnected.current && !isConnected && !hasShownErrorToast.current) {
      showToast('error', t('connection.lostToast'))
      hasShownErrorToast.current = true
    }

    // Connection recovered → show success toast
    if (!wasConnected.current && isConnected) {
      showToast('success', t('connection.restoredToast'))
      hasShownErrorToast.current = false
    }

    wasConnected.current = isConnected
  }, [isConnected, showToast, t])

  return null
}
