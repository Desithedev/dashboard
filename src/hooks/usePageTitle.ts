import { useEffect } from 'react'
import { useLiveData } from '../api/LiveDataContext'
import { useNotifications } from '../api/NotificationContext'

/**
 * Custom hook that sets the document title with connection status and unread notifications.
 *
 * Format examples:
 *   "(3) ⚠ Dashboard — Mission Kontrol"  (unread + disconnected)
 *   "(3) Dashboard — Mission Kontrol"     (unread, connected)
 *   "⚠ Dashboard — Mission Kontrol"       (disconnected, none unread)
 *   "Dashboard — Mission Kontrol"         (connected, none unread)
 *
 * @param title - The name of the page
 */
export function usePageTitle(title: string) {
  const { isConnected } = useLiveData()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const countPrefix = unreadCount > 0 ? `(${unreadCount}) ` : ''
    const warningPrefix = !isConnected ? '\u26a0 ' : ''
    document.title = `${countPrefix}${warningPrefix}${title} \u2014 Mission Kontrol`

    return () => {
      document.title = 'Mission Kontrol'
    }
  }, [title, isConnected, unreadCount])
}
