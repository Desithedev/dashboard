import { memo } from 'react'
import Card from '../Card'
import StatusBadge from '../StatusBadge'
import type { ApiSession } from '../../api/openclaw'
import { formatTimeAgo } from './utils'

interface LiveAktivitetOgSessionerProps {
  sessions: ApiSession[]
}

const LiveAktivitetOgSessioner = memo(function LiveAktivitetOgSessioner({
  sessions,
}: LiveAktivitetOgSessionerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Live Aktivitet */}
      <Card title="Live Aktivitet" subtitle="Seneste agent-handlinger">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">Ingen aktivitet</div>
        ) : (
          <div className="space-y-3 min-w-0">
            {sessions.slice(0, 5).map(s => {
              const isActive = Date.now() - s.updatedAt < 120000
              const timeAgo = formatTimeAgo(s.updatedAt)
              const sessionType = s.key.includes('subagent')
                ? 'Subagent'
                : s.key.includes('main')
                ? 'Hovedagent'
                : 'Session'
              const agentName = s.displayName || s.label || s.key.split(':')[1] || 'Unavngiven'

              return (
                <div key={s.key} className="py-2 glass-row min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <StatusBadge status={isActive ? 'running' : 'completed'} />
                      <span className="text-sm font-medium truncate">{agentName}</span>
                      <span className="caption text-xs flex-shrink-0">· {sessionType}</span>
                    </div>
                    <span className="caption text-xs flex-shrink-0 ml-2">{timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs min-w-0 overflow-hidden">
                    <span className="caption flex-shrink-0">{s.channel || 'ingen kanal'}</span>
                    <span className="text-white/20 flex-shrink-0">·</span>
                    <span className="font-mono caption truncate">{s.model}</span>
                    {s.contextTokens && (
                      <>
                        <span className="text-white/20 flex-shrink-0">·</span>
                        <span className="caption flex-shrink-0">
                          {Math.round(s.contextTokens / 1000)}k ctx
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Sessioner */}
      <Card title="Sessioner" subtitle={`${sessions.length} live sessioner`}>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">Ingen aktive sessioner</div>
        ) : (
          <div className="space-y-3 min-w-0">
            {sessions.map(s => {
              const isActive = Date.now() - s.updatedAt < 120000
              const timeAgo = formatTimeAgo(s.updatedAt)
              return (
                <div
                  key={s.key}
                  className="flex items-center justify-between py-2 glass-row min-w-0 overflow-hidden gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {s.displayName || s.label || (s.key === 'agent:main:main' ? 'Hovedagent' : s.key)}
                    </p>
                    <p className="caption truncate">{s.key} · {s.channel || 'ingen kanal'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="caption hidden sm:inline">{timeAgo}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-lg truncate max-w-[120px]"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      {s.model}
                    </span>
                    {s.contextTokens && (
                      <span className="caption hidden md:inline">
                        {Math.round(s.contextTokens / 1000)}k ctx
                      </span>
                    )}
                    <StatusBadge status={isActive ? 'running' : 'completed'} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
})

export default LiveAktivitetOgSessioner
