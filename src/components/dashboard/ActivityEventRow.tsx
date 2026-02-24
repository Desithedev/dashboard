import { memo } from 'react'
import Icon from '../Icon'
import { useRelativeTime } from '../../hooks/useRelativeTime'

interface ActivityEvent {
  id: string
  type: 'session_start' | 'session_end' | 'cron_run' | 'error'
  timestamp: number
  icon: string
  title: string
  description: string
}

interface ActivityEventRowProps {
  event: ActivityEvent
  isLast: boolean
}

const ActivityEventRow = memo(function ActivityEventRow({ event, isLast }: ActivityEventRowProps) {
  const timeAgo = useRelativeTime(event.timestamp)

  const iconColor =
    event.type === 'session_start' ? '#34C759' :
      event.type === 'session_end' ? '#007AFF' :
        event.type === 'cron_run' ? '#FF9F0A' :
          '#FF3B30'

  return (
    <div className="relative flex gap-3 py-3">
      {/* Timeline line */}
      {!isLast && (
        <div
          style={{
            position: 'absolute', left: '11px', top: '36px', bottom: '-12px',
            width: '2px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        />
      )}

      {/* Icon circle */}
      <div
        style={{
          position: 'relative', flexShrink: 0,
          width: 24, height: 24, borderRadius: '50%',
          background: `${iconColor}15`,
          border: `2px solid ${iconColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Icon name={event.icon} size={12} style={{ color: iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm font-medium text-white truncate">{event.title}</p>
          <span className="caption text-xs flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="caption text-xs truncate">{event.description}</p>
      </div>
    </div>
  )
})

export default ActivityEventRow
export type { ActivityEvent }
