import { memo } from 'react'
import Card from '../Card'
import Icon from '../Icon'
import { MiniLineChart } from '../Chart'
import { useGatewayPing, type PingStatus } from '../../hooks/useGatewayPing'

const STATUS_COLOR: Record<PingStatus, string> = {
  green:   '#30D158',
  yellow:  '#FF9F0A',
  red:     '#FF453A',
  unknown: '#8E8E93',
}

const STATUS_LABEL: Record<PingStatus, string> = {
  green:   'God',
  yellow:  'Langsom',
  red:     'Kritisk',
  unknown: 'Ukendt',
}

const SystemPuls = memo(function SystemPuls() {
  const { latency, history, status, isPinging } = useGatewayPing()
  const dotColor = STATUS_COLOR[status]

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Ikon */}
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `${dotColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="gauge" size={16} style={{ color: dotColor }} />
        </div>

        {/* Titel + undertekst */}
        <div style={{ flexShrink: 0 }}>
          <p className="text-sm font-semibold text-white">System Puls</p>
          <p className="caption text-xs">Gateway latency</p>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Pulserende statusprik + latency-tal */}
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
            {STATUS_LABEL[status]}
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
                Seneste {history.length} målinger
              </p>
              <MiniLineChart data={history} color={dotColor} width={180} height={32} />
            </div>
          ) : (
            <p className="caption text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Indsamler målinger...
            </p>
          )}
        </div>

        {/* Min / Maks / Gns */}
        {history.length >= 3 && (() => {
          const mn = Math.min(...history)
          const mx = Math.max(...history)
          const avg = Math.round(history.reduce((s, v) => s + v, 0) / history.length)
          return (
            <div style={{ display: 'flex', gap: 16, flexShrink: 0, marginLeft: 'auto' }}>
              {[{ label: 'Min', val: `${mn}ms` }, { label: 'Gns', val: `${avg}ms` }, { label: 'Maks', val: `${mx}ms` }].map(({ label, val }) => (
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
