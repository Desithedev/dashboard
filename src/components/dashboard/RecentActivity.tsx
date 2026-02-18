import { memo, useMemo } from 'react'
import Card from '../Card'
import Icon from '../Icon'
import ActivityEventRow, { type ActivityEvent } from './ActivityEventRow'
import type { ApiSession, CronJobApi } from '../../api/openclaw'

interface RecentActivityProps {
  sessions: ApiSession[]
  cronJobs: CronJobApi[]
}

const RecentActivity = memo(function RecentActivity({ sessions, cronJobs }: RecentActivityProps) {
  const events = useMemo<ActivityEvent[]>(() => {
    const allEvents: ActivityEvent[] = []

    sessions.forEach(s => {
      const isActive = Date.now() - s.updatedAt < 120000
      const sessionType = s.key.includes('subagent')
        ? 'Subagent'
        : s.key.includes('main')
        ? 'Hovedagent'
        : 'Session'
      const agentName = s.displayName || s.label || s.key.split(':')[1] || 'Unavngiven'

      if (isActive) {
        allEvents.push({
          id: `session-start-${s.key}`,
          type: 'session_start',
          timestamp: s.updatedAt,
          icon: 'play',
          title: `${agentName} startede`,
          description: `${sessionType} · ${s.channel || 'ingen kanal'}`,
        })
      } else {
        allEvents.push({
          id: `session-end-${s.key}`,
          type: 'session_end',
          timestamp: s.updatedAt,
          icon: 'checkmark-circle',
          title: `${agentName} afsluttede`,
          description: `${sessionType} · ${s.contextTokens ? `${Math.round(s.contextTokens / 1000)}k tokens` : 'Faerdig'}`,
        })
      }
    })

    cronJobs.forEach(job => {
      if (job.lastRun) {
        const lastRunTime = new Date(job.lastRun).getTime()
        if (!isNaN(lastRunTime)) {
          allEvents.push({
            id: `cron-${job.id}-${lastRunTime}`,
            type: 'cron_run',
            timestamp: lastRunTime,
            icon: 'timer',
            title: `${job.name || 'Planlagt job'} koerte`,
            description: typeof job.schedule === 'object'
              ? (job.schedule?.expr || job.schedule?.kind || 'Planlagt')
              : (job.schedule || 'Ukendt tidsplan'),
          })
        }
      }
    })

    return allEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  }, [sessions, cronJobs])

  if (events.length === 0) {
    return (
      <div className="mb-8">
        <Card title="Seneste Aktivitet" subtitle="Unified activity feed">
          <div className="text-center py-12 text-white/50 text-sm">
            <Icon name="info-circle" size={32} className="mb-3 opacity-30" style={{ display: 'inline-flex' }} />
            <p>Ingen aktivitet endnu</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <Card title="Seneste Aktivitet" subtitle={`${events.length} seneste haendelser`}>
        <div className="space-y-1">
          {events.map((event, index) => (
            <ActivityEventRow key={event.id} event={event} isLast={index === events.length - 1} />
          ))}
        </div>
      </Card>
    </div>
  )
})

export default RecentActivity
