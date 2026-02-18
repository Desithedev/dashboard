import { memo } from 'react'
import Card from '../Card'
import Icon from '../Icon'

interface Handling {
  icon: string
  title: string
  description: string
  hash: string
  accentColor: string
}

const HANDLINGER: Handling[] = [
  {
    icon: 'sparkle',
    title: 'Ny Workshop prompt',
    description: 'Skriv og test AI prompts',
    hash: 'workshop',
    accentColor: '#AF52DE',
  },
  {
    icon: 'doc-text',
    title: 'Se Journal',
    description: 'Gennemse agent aktivitet',
    hash: 'journal',
    accentColor: '#007AFF',
  },
  {
    icon: 'timer',
    title: 'Cron Jobs',
    description: 'Planlagte automatiseringer',
    hash: 'cron',
    accentColor: '#FF9F0A',
  },
  {
    icon: 'chart-bar',
    title: 'API Forbrug',
    description: 'Token og omkostningsoversigt',
    hash: 'api',
    accentColor: '#34C759',
  },
]

const HurtigeHandlinger = memo(function HurtigeHandlinger() {
  return (
    <Card title="Hurtige handlinger" subtitle="Genveje til vigtige sider" className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {HANDLINGER.map(h => (
          <button
            key={h.hash}
            onClick={() => { window.location.hash = h.hash }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 10, padding: '16px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.boxShadow = `0 0 24px ${h.accentColor}20`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `${h.accentColor}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={h.icon} size={17} style={{ color: h.accentColor }} />
            </div>
            <div style={{ minWidth: 0, width: '100%' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.title}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, margin: 0 }}>
                {h.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
})

export default HurtigeHandlinger
