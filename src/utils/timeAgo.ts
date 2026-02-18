/**
 * Fælles timeAgo utility — dansk relativ tidsformatering.
 * Bruges af hele Mission Kontrol UI.
 *
 * Accepterer: ISO-streng, Date-objekt eller Unix-timestamp (ms).
 * Output: "lige nu", "3 min siden", "2 timer siden", "i går", "5 dage siden", osv.
 */

export function timeAgo(date: string | Date | number): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  if (isNaN(then)) return ''

  const diffMs = now - then
  const future = diffMs < 0
  const absDiff = Math.abs(diffMs)

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (future) {
    if (minutes < 1) return 'lige nu'
    if (minutes < 60) return `om ${minutes} min`
    if (hours < 24) return `om ${hours} ${hours === 1 ? 'time' : 'timer'}`
    if (days === 1) return 'i morgen'
    return `om ${days} dage`
  }

  if (seconds < 60) return 'lige nu'
  if (minutes < 60) return `${minutes} min siden`
  if (hours < 24) return `${hours} ${hours === 1 ? 'time' : 'timer'} siden`
  if (days === 1) return 'i går'
  if (days < 30) return `${days} dage siden`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'måned' : 'måneder'} siden`
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'år' : 'år'} siden`
}

/**
 * Alias for backward-kompatibilitet med kode der bruger formatTimeAgo(timestamp: number).
 */
export const formatTimeAgo = timeAgo
