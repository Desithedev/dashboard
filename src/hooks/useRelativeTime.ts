import { useState, useEffect } from 'react'
import { timeAgo } from '../utils/timeAgo'

/**
 * Formatér en dato som dansk relativ tidsstreng.
 * Delegates to the common timeAgo utility in src/utils/timeAgo.ts.
 */
export function formatRelativeTime(date: string | Date | number): string {
  return timeAgo(date)
}

/**
 * React hook der returnerer en levende relativ tidsstreng.
 * Opdateres automatisk hvert 30. sekund.
 */
export function useRelativeTime(date: string | Date | number | null | undefined): string {
  const [text, setText] = useState(() => date ? timeAgo(date) : '')

  useEffect(() => {
    if (!date) { setText(''); return }
    setText(timeAgo(date))
    const id = setInterval(() => setText(timeAgo(date)), 30_000)
    return () => clearInterval(id)
  }, [date])

  return text
}
