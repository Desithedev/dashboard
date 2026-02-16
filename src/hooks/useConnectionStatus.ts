import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '../api/LiveDataContext'

export type ConnectionStatus = 'connected' | 'slow' | 'disconnected'

interface ConnectionStatusData {
  status: ConnectionStatus
  latency: number | null
}

export function useConnectionStatus(): ConnectionStatusData {
  const { isConnected, lastUpdated, isRefreshing } = useLiveData()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [latency, setLatency] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const lastRequestTime = useRef<number>(Date.now())
  const lastResponseTime = useRef<number>(Date.now())

  // Track navigator.onLine events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Track when refresh starts
  useEffect(() => {
    if (isRefreshing) {
      lastRequestTime.current = Date.now()
    }
  }, [isRefreshing])

  // Track response time when lastUpdated changes
  useEffect(() => {
    if (lastUpdated && !isRefreshing) {
      lastResponseTime.current = Date.now()
      const responseTime = lastResponseTime.current - lastRequestTime.current
      
      // Only update latency if it's a reasonable value (not from initial load)
      if (responseTime > 0 && responseTime < 60000) {
        setLatency(responseTime)
      }
    }
  }, [lastUpdated, isRefreshing])

  // Determine status based on connection state, network status, and latency
  useEffect(() => {
    if (!isOnline || !isConnected) {
      setStatus('disconnected')
    } else if (latency !== null && latency > 2000) {
      setStatus('slow')
    } else {
      setStatus('connected')
    }
  }, [isOnline, isConnected, latency])

  return { status, latency }
}
