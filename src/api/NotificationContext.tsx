import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { useLiveData } from './LiveDataContext'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  source?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationState>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => { },
  markAsRead: () => { },
  markAllAsRead: () => { },
  clearAll: () => { },
  dismissNotification: () => { },
})

export function useNotifications() {
  return useContext(NotificationContext)
}

const STORAGE_KEY = 'openclaw-notifications'
const MAX_NOTIFICATIONS = 100

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return []
}

function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)))
  } catch { }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications)
  const { isConnected, sessions, cronJobs } = useLiveData()
  const prevConnected = useRef<boolean | null>(null)
  const prevSessionKeys = useRef<Set<string>>(new Set())
  const prevCronErrors = useRef<Set<string>>(new Set())

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => {
      const newNotif: Notification = {
        ...n,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        read: false,
      }
      const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS)
      saveNotifications(updated)
      return updated
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifications(updated)
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    saveNotifications([])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      saveNotifications(updated)
      return updated
    })
  }, [])

  useEffect(() => {
    if (prevConnected.current === null) {
      prevConnected.current = isConnected
      return
    }
    if (prevConnected.current && !isConnected) {
      addNotification({
        type: 'error',
        title: 'Gateway connection lost',
        message: 'The connection to OpenClaw Gateway is down. Check server status.',
        source: 'system',
      })
    } else if (!prevConnected.current && isConnected) {
      addNotification({
        type: 'success',
        title: 'Gateway connected',
        message: 'The connection to OpenClaw Gateway has been restored.',
        source: 'system',
      })
    }
    prevConnected.current = isConnected
  }, [isConnected, addNotification])

  useEffect(() => {
    if (!isConnected || sessions.length === 0) return
    const currentKeys = new Set(sessions.map(s => s.key))
    if (prevSessionKeys.current.size > 0) {
      for (const key of currentKeys) {
        if (!prevSessionKeys.current.has(key)) {
          const session = sessions.find(s => s.key === key)
          const name = session?.displayName || session?.label || key.split(':').pop() || key
          if (key.includes('subagent')) {
            addNotification({
              type: 'info',
              title: 'New subagent started',
              message: `${name} has been created.`,
              source: 'agents',
            })
          }
        }
      }
    }
    prevSessionKeys.current = currentKeys
  }, [sessions, isConnected, addNotification])

  useEffect(() => {
    if (!isConnected || cronJobs.length === 0) return
    const currentErrors = new Set<string>()
    for (const job of cronJobs as any[]) {
      if (job.lastError || job.status === 'failed') {
        const errorKey = `${job.id || job.name}-${job.lastError || 'failed'}`
        currentErrors.add(errorKey)
        if (!prevCronErrors.current.has(errorKey)) {
          addNotification({
            type: 'error',
            title: 'Cron job failed',
            message: `"${job.name || job.label || 'Unknown job'}" failed: ${job.lastError || 'Unknown error'}`,
            source: 'cron',
          })
        }
      }
    }
    prevCronErrors.current = currentErrors
  }, [cronJobs, isConnected, addNotification])

  useEffect(() => {
    if (!isConnected) return
    for (const session of sessions) {
      if (session.contextTokens && session.contextTokens > 150000) {
        const warnKey = `high-ctx-${session.key}`
        if (!(window as any)[warnKey]) {
          (window as any)[warnKey] = true
          addNotification({
            type: 'warning',
            title: 'High context usage',
            message: `Session "${session.displayName || session.label || session.key}" is using ${Math.round(session.contextTokens / 1000)}k context tokens.`,
            source: 'system',
          })
        }
      }
    }
  }, [sessions, isConnected, addNotification])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, dismissNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
