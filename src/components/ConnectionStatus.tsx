import { useState, useEffect } from 'react'
import { useConnectionStatus, ConnectionStatus as Status } from '../hooks/useConnectionStatus'

export default function ConnectionStatus() {
  const { status, latency } = useConnectionStatus()
  const [showTooltip, setShowTooltip] = useState(false)

  const colors: Record<Status, string> = {
    connected: '#30D158',
    slow: '#FFD60A',
    disconnected: '#FF453A',
  }

  const labels: Record<Status, string> = {
    connected: 'Forbundet',
    slow: 'Langsom forbindelse',
    disconnected: 'Afbrudt',
  }

  const formatLatency = (ms: number | null): string => {
    if (ms === null) return ''
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

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
          backgroundColor: colors[status],
          boxShadow: `0 0 8px ${colors[status]}60`,
          transition: 'background-color 300ms ease, box-shadow 300ms ease',
        }}
      />

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
            animation: 'tooltipFadeIn 150ms ease-out',
          }}
        >
          {labels[status]}
          {latency !== null && status !== 'disconnected' && (
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: 4 }}>
              ({formatLatency(latency)})
            </span>
          )}
          {/* Tooltip arrow */}
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

      {/* Add animation keyframes to document head if not already present */}
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
