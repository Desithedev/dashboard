import i18n from '../i18n'

/**
 * Shared timeAgo utility with simple i18n support.
 * Used throughout the Mission Kontrol UI.
 *
 * Accepts: ISO string, Date object or Unix timestamp (ms).
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

  const t = i18n.t

  if (future) {
    if (minutes < 1) return t('dates.soon')
    if (minutes < 60) return t('dates.inMinutes', { count: minutes })
    if (hours < 24) {
      const key = hours === 1 ? 'dates.inHours' : 'dates.inHoursPlural'
      return t(key, { count: hours })
    }
    if (days === 1) return t('dates.tomorrow')
    return t('dates.inDays', { count: days })
  }

  if (seconds < 60) return t('dates.justNow')
  if (minutes < 60) return t('dates.minutesAgo', { count: minutes })
  if (hours < 24) {
    const key = hours === 1 ? 'dates.hoursAgo' : 'dates.hoursAgoPlural'
    return t(key, { count: hours })
  }
  if (days === 1) return t('dates.yesterday')
  if (days < 30) return t('dates.daysAgo', { count: days })

  const months = Math.floor(days / 30)
  if (months < 12) return t('dates.monthsAgo', { count: months })

  const years = Math.floor(days / 365)
  return t('dates.yearsAgo', { count: years })
}

/**
 * Alias for backward compatibility with code using formatTimeAgo(timestamp: number).
 */
export const formatTimeAgo = timeAgo
