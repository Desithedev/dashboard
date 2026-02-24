import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../Card'
import StatusBadge from '../StatusBadge'
import type { Channel } from './types'
import type { CronJobApi } from '../../api/openclaw'

interface ChannelsAndJobsProps {
  channels: Channel[]
  cronJobs: CronJobApi[]
  cronActiveCount: number
}

const ChannelsAndJobs = memo(function ChannelsAndJobs({
  channels,
  cronJobs,
  cronActiveCount,
}: ChannelsAndJobsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Kanaler */}
      <Card
        title={t('dashboard.channels', 'Channels')}
        subtitle={t('dashboard.channelsSubtitle', '{{count}} activated', { count: channels.filter(c => c.enabled).length })}
      >
        {channels.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">
            {t('dashboard.noChannelsConfigured', 'No channels configured')}
          </div>
        ) : (
          <div className="space-y-3 min-w-0">
            {channels.map(ch => (
              <div
                key={ch.name}
                className="flex items-center justify-between py-2 glass-row min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge
                    status={
                      ch.status === 'ok' ? 'active' :
                        ch.status === 'warning' ? 'warning' :
                          ch.status === 'setup' ? 'idle' : 'paused'
                    }
                  />
                  <span className="text-sm font-medium truncate">{ch.name}</span>
                </div>
                <span className="caption truncate ml-2 flex-shrink-0">{ch.detail}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Scheduled Jobs */}
      <Card
        title={t('dashboard.cronJobs', 'Scheduled Jobs')}
        subtitle={t('dashboard.cronJobsCountSubtitle', '{{active}} active of {{total}} total', { active: cronActiveCount, total: cronJobs.length })}
      >
        {cronJobs.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">
            {t('cronJobs.noJobsTitle', 'No scheduled jobs yet')}
          </div>
        ) : (
          <div className="space-y-3 min-w-0">
            {cronJobs.slice(0, 5).map((job, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 glass-row min-w-0 overflow-hidden"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {job.name || t('dashboard.unnamed', 'Unnamed job')}
                  </p>
                  <p className="caption truncate">
                    {typeof job.schedule === 'object'
                      ? (job.schedule?.expr || job.schedule?.kind || t('dashboard.eventRan', 'Scheduled'))
                      : (job.schedule || t('dashboard.unknown', 'Unknown schedule'))}
                  </p>
                </div>
                <StatusBadge status={job.enabled === false ? 'paused' : 'active'} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
})

export default ChannelsAndJobs
