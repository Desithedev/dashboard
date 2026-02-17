import { useEffect } from 'react'
import { useLiveData } from '../api/LiveDataContext'
import { useNotifications } from '../api/NotificationContext'

/**
 * Custom hook der sætter document title med connection status og ulæste notifikationer.
 * Format: "(3) ● Mission Kontrol — Oversigt" (forbundet, ulæste)
 *         "● Mission Kontrol — Oversigt"     (forbundet)
 *         "○ Mission Kontrol — Oversigt"     (ikke forbundet)
 *
 * @param title - Sidens navn på dansk
 */
export function usePageTitle(title: string) {
  const { isConnected } = useLiveData()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const statusDot = isConnected ? '\u25cf' : '\u25cb'
    const prefix = unreadCount > 0 ? `(${unreadCount}) ` : ''
    document.title = `${prefix}${statusDot} Mission Kontrol \u2014 ${title}`

    return () => {
      document.title = 'Mission Kontrol'
    }
  }, [title, isConnected, unreadCount])
}
