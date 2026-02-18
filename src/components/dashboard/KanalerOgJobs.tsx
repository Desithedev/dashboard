import { memo } from 'react'
import Card from '../Card'
import StatusBadge from '../StatusBadge'
import type { Channel } from './types'
import type { CronJobApi } from '../../api/openclaw'

interface KanalerOgJobsProps {
  channels: Channel[]
  cronJobs: CronJobApi[]
  cronActiveCount: number
}

const KanalerOgJobs = memo(function KanalerOgJobs({
  channels,
  cronJobs,
  cronActiveCount,
}: KanalerOgJobsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Kanaler */}
      <Card title="Kanaler" subtitle={`${channels.filter(c => c.enabled).length} aktiverede`}>
        {channels.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">
            Ingen kanaler konfigureret
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

      {/* Planlagte Jobs */}
      <Card
        title="Planlagte Jobs"
        subtitle={`${cronActiveCount} aktive af ${cronJobs.length} total`}
      >
        {cronJobs.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">
            Ingen cron jobs konfigureret
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
                    {job.name || 'Unavngiven job'}
                  </p>
                  <p className="caption truncate">
                    {typeof job.schedule === 'object'
                      ? (job.schedule?.expr || job.schedule?.kind || 'Planlagt')
                      : (job.schedule || 'Ukendt tidsplan')}
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

export default KanalerOgJobs
