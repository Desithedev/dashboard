import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import Icon from '../Icon'
import ActivityEventRow, { type ActivityEvent } from './ActivityEventRow'
import type { ApiSession, CronJobApi } from '../../api/openclaw'

interface RecentActivityProps {
  sessions: ApiSession[]
  cronJobs: CronJobApi[]
}

const RecentActivity = memo(function RecentActivity({ sessions, cronJobs }: RecentActivityProps) {
  const { t } = useTranslation()

  const events = useMemo<ActivityEvent[]>(() => {
    const allEvents: ActivityEvent[] = []

    sessions.forEach(s => {
      const isActive = Date.now() - s.updatedAt < 120000
      const sessionType = s.key.includes('subagent')
        ? t('dashboard.subAgent', 'Sub-agent')
        : s.key.includes('main')
          ? t('dashboard.mainAgent', 'Main Agent')
          : t('dashboard.session', 'Session')
      const agentName = s.displayName || s.label || s.key.split(':')[1] || t('dashboard.unnamed', 'Unnamed')

      if (isActive) {
        allEvents.push({
          id: `session-start-${s.key}`,
          type: 'session_start',
          timestamp: s.updatedAt,
          icon: 'play',
          title: t('dashboard.eventStarted', '{{name}} started', { name: agentName }),
          description: `${sessionType} · ${s.channel || t('dashboard.noChannel', 'no channel')}`,
        })
      } else {
        allEvents.push({
          id: `session-end-${s.key}`,
          type: 'session_end',
          timestamp: s.updatedAt,
          icon: 'checkmark-circle',
          title: t('dashboard.eventFinished', '{{name}} finished', { name: agentName }),
          description: `${sessionType} · ${s.contextTokens ? `${Math.round(s.contextTokens / 1000)}k tokens` : t('common.completed', 'Finished')}`,
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
            title: t('dashboard.eventRan', '{{name}} ran', { name: job.name || t('cronJobs.title', 'Scheduled job') }),
            description: typeof job.schedule === 'object'
              ? (job.schedule?.expr || job.schedule?.kind || t('dashboard.eventRan', 'Scheduled'))
              : (job.schedule || t('dashboard.unknown', 'Unknown schedule')),
          })
        }
      }
    })

    return allEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  }, [sessions, cronJobs, t])

  if (events.length === 0) {
    return (
      <div className="mb-8">
        <Card title={t('dashboard.recentActivity', 'Recent Activity')} subtitle="Unified activity feed">
          <div className="text-center py-12 text-white/50 text-sm">
            <Icon name="info-circle" size={32} className="mb-3 opacity-30" style={{ display: 'inline-flex' }} />
            <p>{t('dashboard.noActivityYet', 'No activity yet')}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <Card title={t('dashboard.recentActivity', 'Recent Activity')} subtitle={t('dashboard.recentEvents', '{{count}} recent events', { count: events.length })}>
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
