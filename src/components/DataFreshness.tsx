import { useState, useEffect } from 'react'
import Icon from './Icon'
import { useLiveData } from '../api/LiveDataContext'

interface DataFreshnessProps {
  className?: string
}

function formatSecondsAgo(secs: number | null): string {
  if (secs === null) return 'Ingen data'
  if (secs < 5) return 'lige nu'
  if (secs < 60) return `${secs} sek. siden`
  if (secs < 3600) return `${Math.floor(secs / 60)} min. siden`
  return `${Math.floor(secs / 3600)}t siden`
}

export default function DataFreshness({ className = '' }: DataFreshnessProps) {
  const { lastUpdated, isRefreshing, refresh } = useLiveData()
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null)

  useEffect(() => {
    const update = () => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
      } else {
        setSecondsAgo(null)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  // Dot color based on staleness
  const dotColor =
    secondsAgo === null
      ? '#636366'
      : secondsAgo < 10
      ? '#30D158'   // frisk — grøn
      : secondsAgo < 30
      ? '#30D158'   // stadig frisk — grøn
      : secondsAgo < 60
      ? '#FF9F0A'   // stale — gul
      : '#FF3B30'   // meget stale — rød

  const isPulsing = secondsAgo !== null && secondsAgo < 10

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl flex-shrink-0 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        maxWidth: 210,
      }}
    >
      {/* Status dot */}
      <span
        className={isPulsing ? 'df-dot-pulse' : ''}
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />

      {/* Clock icon */}
      <Icon
        name="clock"
        size={11}
        style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}
      />

      {/* Time text */}
      <span
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.45)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0,
        }}
      >
        {formatSecondsAgo(secondsAgo)}
      </span>

      {/* Refresh button */}
      <button
        onClick={() => refresh()}
        disabled={isRefreshing}
        title="Genindlæs data"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: isRefreshing ? 'wait' : 'pointer',
          color: 'rgba(255,255,255,0.5)',
          padding: 0,
          flexShrink: 0,
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => {
          if (!isRefreshing) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
        }}
      >
        <span className={isRefreshing ? 'df-spin' : ''} style={{ display: 'inline-flex' }}>
          <Icon name="refresh" size={11} />
        </span>
      </button>
    </div>
  )
}
