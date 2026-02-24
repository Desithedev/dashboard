import { useState, useEffect, useRef, useCallback } from 'react'
import { invokeToolRaw } from '../api/openclaw'

const MAX_HISTORY = 20
const PING_INTERVAL_MS = 10_000 // 10 sekunder mellem hvert ping

export type PingStatus = 'green' | 'yellow' | 'red' | 'unknown'

export interface GatewayPingData {
  /** Latest measured latency in ms. null = not yet measured. */
  latency: number | null
  /** Ring buffer with the latest MAX_HISTORY measurements. Reset on page refresh. */
  history: number[]
  /** Color code based on latency: <200ms=green, <500ms=yellow, >=500ms=red */
  status: PingStatus
  /** True mens et ping-kald er i gang */
  isPinging: boolean
}

function latencyToStatus(ms: number | null): PingStatus {
  if (ms === null) return 'unknown'
  if (ms < 200) return 'green'
  if (ms < 500) return 'yellow'
  return 'red'
}

/**
 * Measures response time (performance.now) for a light `session_status` call to the Gateway.
 * Stores the 20 most recent measurements in the component's state (reset on page refresh).
 * Automatically polls every 10 seconds.
 */
export function useGatewayPing(): GatewayPingData {
  const [latency, setLatency] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [isPinging, setIsPinging] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ping = useCallback(async () => {
    setIsPinging(true)
    const start = performance.now()
    try {
      await invokeToolRaw('session_status', {})
      const ms = Math.round(performance.now() - start)
      setLatency(ms)
      setHistory(prev => [...prev, ms].slice(-MAX_HISTORY))
    } catch {
      // On error, no measurement is added — existing latency is retained
    } finally {
      setIsPinging(false)
    }
  }, [])

  useEffect(() => {
    ping() // Initial ping immediately on mount
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [ping])

  return {
    latency,
    history,
    status: latencyToStatus(latency),
    isPinging,
  }
}
