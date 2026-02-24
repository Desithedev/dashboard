import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import Icon from '../Icon'
import { MiniLineChart } from '../Chart'
import { useGatewayPing, type PingStatus } from '../../hooks/useGatewayPing'

const STATUS_COLOR: Record<PingStatus, string> = {
  green: '#30D158',
  yellow: '#FF9F0A',
  red: '#FF453A',
  unknown: '#8E8E93',
}

const SystemPuls = memo(function SystemPuls() {
  const { t } = useTranslation()
  const { latency, history, status, isPinging } = useGatewayPing()
  const dotColor = STATUS_COLOR[status]

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'green': return t('dashboard.good', 'Good')
      case 'yellow': return t('dashboard.slow', 'Slow')
      case 'red': return t('dashboard.critical', 'Critical')
      default: return t('dashboard.unknown', 'Unknown')
    }
  }, [status, t])

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `${dotColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="gauge" size={16} style={{ color: dotColor }} />
        </div>

        {/* Title + subtitle */}
        <div style={{ flexShrink: 0 }}>
          <p className="text-sm font-semibold text-white">{t('dashboard.systemPulse', 'System Pulse')}</p>
          <p className="caption text-xs">{t('dashboard.gatewayLatency', 'Gateway latency')}</p>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Pulsing status dot + latency value */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            className="sys-pulse-dot"
            style={{
              display: 'inline-block',
              width: 10, height: 10,
              borderRadius: '50%',
              background: dotColor,
              ['--pulse-color' as string]: dotColor,
            } as React.CSSProperties}
          />
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {latency !== null ? `${latency}ms` : '—'}
          </span>
          <span className="caption" style={{ fontSize: 11 }}>
            {statusLabel}
            {isPinging && (
              <span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.3)' }}>·</span>
            )}
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Sparkline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
          {history.length >= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <p className="caption" style={{ fontSize: 10, marginBottom: 2 }}>
                {t('dashboard.recentMeasurements', `Recent ${history.length} measurements`, { count: history.length })}
              </p>
              <MiniLineChart data={history} color={dotColor} width={180} height={32} />
            </div>
          ) : (
            <p className="caption text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {t('dashboard.collectingMeasurements', 'Collecting measurements...')}
            </p>
          )}
        </div>

        {/* Min / Max / Avg */}
        {history.length >= 3 && (() => {
          const mn = Math.min(...history)
          const mx = Math.max(...history)
          const avg = Math.round(history.reduce((s, v) => s + v, 0) / history.length)
          return (
            <div style={{ display: 'flex', gap: 16, flexShrink: 0, marginLeft: 'auto' }}>
              {[
                { label: t('dashboard.min', 'Min'), val: `${mn}ms` },
                { label: t('dashboard.avg', 'Avg'), val: `${avg}ms` },
                { label: t('dashboard.max', 'Max'), val: `${mx}ms` }
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p className="caption" style={{ fontSize: 10, marginBottom: 1 }}>{label}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{val}</p>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </Card>
  )
})

export default SystemPuls
