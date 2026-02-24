import { useState } from 'react'
import { useLiveData } from '../api/LiveDataContext'
import { useRelativeTime } from '../hooks/useRelativeTime'

export default function ConnectionStatus() {
  const { lastUpdated, consecutiveErrors, isConnected } = useLiveData()
  const [showTooltip, setShowTooltip] = useState(false)
  const relativeTime = useRelativeTime(lastUpdated)

  // Green=0 errors, Yellow=1-2, Red=3+
  const color = !isConnected || consecutiveErrors >= 3
    ? '#FF453A'
    : consecutiveErrors >= 1
      ? '#FFD60A'
      : '#30D158'

  const label = !isConnected
    ? 'Afbrudt'
    : consecutiveErrors >= 3
      ? 'Unstable connection'
      : consecutiveErrors >= 1
        ? 'Langsom forbindelse'
        : 'Forbundet'

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}60`,
          transition: 'background-color 300ms ease, box-shadow 300ms ease',
        }}
      />

      {/* Last updated text */}
      {lastUpdated && (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
          {relativeTime || 'lige nu'}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            padding: '6px 10px',
            borderRadius: 8,
            backgroundColor: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            whiteSpace: 'nowrap',
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {label}
          {lastUpdated && (
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: 4 }}>
              — Sidst opdateret: {relativeTime || 'lige nu'}
            </span>
          )}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid rgba(20, 20, 30, 0.95)',
            }}
          />
        </div>
      )}
    </div>
  )
}
