import { useState, useEffect, useRef, useCallback } from 'react'
import { invokeToolRaw } from '../api/openclaw'

const MAX_HISTORY = 20
const PING_INTERVAL_MS = 10_000 // 10 sekunder mellem hvert ping

export type PingStatus = 'green' | 'yellow' | 'red' | 'unknown'

export interface GatewayPingData {
  /** Seneste målt latency i ms. null = endnu ikke målt. */
  latency: number | null
  /** Ringbuffer med de seneste MAX_HISTORY målinger. Nulstilles ved page refresh. */
  history: number[]
  /** Farvekode baseret på latency: <200ms=green, <500ms=yellow, >=500ms=red */
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
 * Måler responstid (performance.now) på et let `session_status`-kald til Gateway.
 * Gemmer de seneste 20 målinger i komponentens state (nulstilles ved page refresh).
 * Poller automatisk hvert 10. sekund.
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
      // Ved fejl tilføjes ingen måling — eksisterende latency bibeholdes
    } finally {
      setIsPinging(false)
    }
  }, [])

  useEffect(() => {
    ping() // Første ping straks ved mount
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
