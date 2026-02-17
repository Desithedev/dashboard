import { useState, useCallback } from 'react'
import Card from '../components/Card'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import { useLiveData } from '../api/LiveDataContext'
import { fetchCronRuns, invokeToolRaw } from '../api/openclaw'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatRelativeTime } from '../hooks/useRelativeTime'
import DataFreshness from '../components/DataFreshness'
import { SkeletonRow, shimmerStyle } from '../components/SkeletonLoader'

interface CronRun {
  timestamp: string
  status: string
  duration?: number
  error?: string
}

/** Beregn næste kørsel fra schedule-feltet hvis API ikke angiver nextRun */
function calcNextRun(job: { schedule?: any; lastRun?: string; nextRun?: string }): string | null {
  if (job.nextRun) return job.nextRun

  const s = job.schedule
  if (!s) return null

  // everyMs-baseret: næste kørsel = sidst kørt + interval
  if (typeof s === 'object' && s.everyMs) {
    const base = job.lastRun ? new Date(job.lastRun).getTime() : Date.now()
    return new Date(base + (s.everyMs as number)).toISOString()
  }

  // Simpel cron-expression parser for minutbaserede mønstre
  const expr: string | undefined = typeof s === 'string' ? s : s.expr
  if (expr) {
    const parts = expr.trim().split(/\s+/)
    if (parts.length >= 5) {
      const now = new Date()
      const minutePart = parts[0]
      const hourPart = parts[1]

      // Hvert N. minut: */N
      const everyMinMatch = minutePart.match(/^\*\/(\d+)$/)
      if (everyMinMatch && hourPart === '*') {
        const n = parseInt(everyMinMatch[1], 10)
        const nowMs = now.getTime()
        const nextMs = nowMs + (n - (now.getMinutes() % n)) * 60_000 - now.getSeconds() * 1000
        return new Date(nextMs).toISOString()
      }

      // Fast minut/time: f.eks. "30 * * * *" (hvert 30. minut), "0 * * * *" (i starten af timen)
      const fixedMin = minutePart === '*' ? null : parseInt(minutePart, 10)
      if (!isNaN(fixedMin as number) && hourPart === '*') {
        const next = new Date(now)
        next.setSeconds(0, 0)
        next.setMinutes((fixedMin as number))
        if (next <= now) next.setHours(next.getHours() + 1)
        return next.toISOString()
      }
    }
  }

  return null
}

function formatSchedule(schedule: unknown): string {
  if (!schedule) return 'Ukendt'
  if (typeof schedule === 'string') return schedule
  if (typeof schedule === 'object' && schedule !== null) {
    const s = schedule as Record<string, unknown>
    if (s.everyMs) {
      const ms = s.everyMs as number
      if (ms < 60_000) return `Hvert ${ms / 1000}s`
      if (ms < 3_600_000) return `Hvert ${ms / 60_000} min`
      if (ms < 86_400_000) return `Hver ${ms / 3_600_000} time`
      return `Hver ${ms / 86_400_000} dag`
    }
    return (s.expr as string) || (s.kind as string) || JSON.stringify(s)
  }
  return String(schedule)
}

export default function CronJobs() {
  usePageTitle('Planlagte Jobs')

  const { isConnected, cronJobs, isLoading, refresh } = useLiveData()
  const { showToast } = useToast()

  // Udvalgt job (inline historik)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [runs, setRuns] = useState<Record<string, CronRun[]>>({})
  const [loadingRuns, setLoadingRuns] = useState<Record<string, boolean>>({})

  // Knaptilstande per job
  const [runningJobs, setRunningJobs] = useState<Record<string, boolean>>({})
  const [togglingJobs, setTogglingJobs] = useState<Record<string, boolean>>({})

  const jobs = Array.isArray(cronJobs) ? cronJobs : []

  /** Vis/skjul seneste kørsler for et job */
  const toggleJobHistory = useCallback(async (jobId: string) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null)
      return
    }
    setSelectedJobId(jobId)

    if (!runs[jobId]) {
      setLoadingRuns(prev => ({ ...prev, [jobId]: true }))
      try {
        const data = await fetchCronRuns(jobId)
        setRuns(prev => ({ ...prev, [jobId]: (data || []).slice(0, 5) }))
      } catch {
        setRuns(prev => ({ ...prev, [jobId]: [] }))
      } finally {
        setLoadingRuns(prev => ({ ...prev, [jobId]: false }))
      }
    }
  }, [selectedJobId, runs])

  /** Kør et job med det samme */
  const runJobNow = useCallback(async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation()
    if (runningJobs[jobId]) return
    setRunningJobs(prev => ({ ...prev, [jobId]: true }))
    try {
      await invokeToolRaw('cron', { action: 'run', jobId })
      showToast('success', 'Job startet')
      // Genindlæs historik for dette job
      setRuns(prev => ({ ...prev, [jobId]: [] }))
      setTimeout(() => {
        fetchCronRuns(jobId)
          .then(data => setRuns(prev => ({ ...prev, [jobId]: (data || []).slice(0, 5) })))
          .catch(() => {})
        refresh()
      }, 1500)
    } catch (err: any) {
      showToast('error', `Kunne ikke starte job: ${err?.message || 'Ukendt fejl'}`)
    } finally {
      setRunningJobs(prev => ({ ...prev, [jobId]: false }))
    }
  }, [runningJobs, showToast, refresh])

  /** Skift aktiveret/deaktiveret status */
  const toggleEnabled = useCallback(async (e: React.MouseEvent, jobId: string, currentEnabled: boolean) => {
    e.stopPropagation()
    if (togglingJobs[jobId]) return
    setTogglingJobs(prev => ({ ...prev, [jobId]: true }))
    try {
      await invokeToolRaw('cron', { action: 'update', jobId, enabled: !currentEnabled })
      showToast('success', currentEnabled ? 'Job deaktiveret' : 'Job aktiveret')
      refresh()
    } catch (err: any) {
      showToast('error', `Kunne ikke opdatere job: ${err?.message || 'Ukendt fejl'}`)
    } finally {
      setTogglingJobs(prev => ({ ...prev, [jobId]: false }))
    }
  }, [togglingJobs, showToast, refresh])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="text-xl sm:text-2xl font-bold">Planlagte Jobs</h1>
        {!isConnected && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-orange-400"
            style={{ background: 'rgba(255,149,0,0.1)' }}
          >
            Offline
          </span>
        )}
        <DataFreshness className="ml-auto" />
      </div>
      <p className="caption mb-6">
        {isLoading ? 'Indlæser...' : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`}
        {isConnected && <span className="text-green-400 ml-1">(live)</span>}
      </p>

      {/* Handlingsknapper */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => showToast('info', 'Denne funktion kommer snart')}
          style={{
            minHeight: '44px',
            background: '#007AFF',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Opret Job
        </button>
        <button
          onClick={() => showToast('info', 'Denne funktion kommer snart')}
          style={{
            minHeight: '44px',
            background: 'rgba(0,122,255,0.1)',
            color: '#007AFF',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(0,122,255,0.2)',
            cursor: 'pointer',
          }}
        >
          Alarmregler
        </button>
      </div>

      {/* Indlæsnings-skeleton */}
      {isLoading ? (
        <Card>
          <style>{shimmerStyle}</style>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
          </div>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-4">
            <Icon name="clock" size={40} className="text-white/30 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Ingen planlagte jobs endnu
            </p>
            <p className="caption max-w-md mx-auto">
              Planlagte jobs giver dig mulighed for at automatisere gentagne opgaver som rapporter, sundhedstjek, backups og mere.
              Klik "Opret Job" for at komme i gang.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const isEnabled = job.enabled !== false
            const isSelected = selectedJobId === job.id
            const isRunning = !!runningJobs[job.id]
            const isToggling = !!togglingJobs[job.id]
            const nextRun = calcNextRun(job)
            const jobRuns = runs[job.id] || []
            const jobLoadingRuns = !!loadingRuns[job.id]

            return (
              <div key={job.id || i}>
                <Card>
                  {/* Øverste række: info + handlinger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Venstre: status + navn + schedule */}
                    <div
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleJobHistory(job.id)}
                    >
                      <StatusBadge status={isEnabled ? 'active' : 'paused'} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{job.name || job.id}</p>
                        <p className="caption font-mono">{formatSchedule(job.schedule)}</p>
                      </div>
                    </div>

                    {/* Højre: tider + knapper */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      {/* Sidst kørt */}
                      {job.lastRun && (
                        <div className="text-left sm:text-right hidden sm:block">
                          <p className="text-sm font-medium">{formatRelativeTime(job.lastRun)}</p>
                          <p className="caption">sidst kørt</p>
                        </div>
                      )}

                      {/* Næste kørsel */}
                      {nextRun ? (
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium" style={{ color: '#34C759' }}>
                            {formatRelativeTime(nextRun)}
                          </p>
                          <p className="caption">næste kørsel</p>
                        </div>
                      ) : (
                        <div className="text-left sm:text-right hidden sm:block">
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>—</p>
                          <p className="caption">næste kørsel</p>
                        </div>
                      )}

                      {/* Kør nu knap */}
                      <button
                        onClick={(e) => runJobNow(e, job.id)}
                        disabled={isRunning}
                        title="Kør nu"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          minHeight: '36px',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: '1px solid rgba(52,199,89,0.3)',
                          background: isRunning ? 'rgba(52,199,89,0.05)' : 'rgba(52,199,89,0.1)',
                          color: '#34C759',
                          cursor: isRunning ? 'not-allowed' : 'pointer',
                          opacity: isRunning ? 0.6 : 1,
                          transition: 'background 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Icon
                          name={isRunning ? 'arrow-path' : 'play'}
                          size={14}
                          className={isRunning ? 'animate-spin' : ''}
                        />
                        <span className="hidden sm:inline">Kør nu</span>
                      </button>

                      {/* Enable / Disable toggle */}
                      <button
                        onClick={(e) => toggleEnabled(e, job.id, isEnabled)}
                        disabled={isToggling}
                        title={isEnabled ? 'Deaktiver job' : 'Aktiver job'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          minHeight: '36px',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: `1px solid ${isEnabled ? 'rgba(255,255,255,0.12)' : 'rgba(0,122,255,0.3)'}`,
                          background: isEnabled ? 'rgba(255,255,255,0.06)' : 'rgba(0,122,255,0.1)',
                          color: isEnabled ? 'rgba(255,255,255,0.5)' : '#007AFF',
                          cursor: isToggling ? 'not-allowed' : 'pointer',
                          opacity: isToggling ? 0.6 : 1,
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isToggling ? (
                          <Icon name="arrow-path" size={14} className="animate-spin" />
                        ) : (
                          <Icon name={isEnabled ? 'pause' : 'play'} size={14} />
                        )}
                        <span className="hidden sm:inline">
                          {isEnabled ? 'Deaktiver' : 'Aktiver'}
                        </span>
                      </button>

                      {/* Historik-toggle (chevron) */}
                      <button
                        onClick={() => toggleJobHistory(job.id)}
                        title="Seneste kørsler"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        <Icon name="chevron-right" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Inline: Seneste kørsler */}
                  {isSelected && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className="caption mb-3" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="clock" size={12} />
                        Seneste 5 kørsler
                      </p>

                      {jobLoadingRuns ? (
                        <div className="text-center py-6">
                          <Icon name="arrow-path" size={20} className="text-white/30 animate-spin mx-auto" />
                          <p className="caption mt-2">Indlæser historik...</p>
                        </div>
                      ) : jobRuns.length === 0 ? (
                        <div
                          className="text-center py-6 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          <Icon name="clock" size={20} className="text-white/20 mx-auto mb-2" />
                          <p className="caption">Ingen kørsler registreret endnu</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {jobRuns.map((run, ri) => (
                            <div
                              key={ri}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <Icon
                                  name={run.status === 'success' ? 'check-circle' : 'exclamation-triangle'}
                                  size={14}
                                  style={{ color: run.status === 'success' ? '#34C759' : '#FF453A', flexShrink: 0 }}
                                />
                                <span
                                  className="font-mono text-xs truncate"
                                  style={{ color: 'rgba(255,255,255,0.5)' }}
                                >
                                  {run.timestamp ? formatRelativeTime(run.timestamp) : '—'}
                                </span>
                                {run.error && (
                                  <span className="text-xs truncate" style={{ color: '#FF453A' }}>
                                    {run.error}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                {run.duration != null && (
                                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    {run.duration}ms
                                  </span>
                                )}
                                <span
                                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    background: run.status === 'success'
                                      ? 'rgba(52,199,89,0.1)'
                                      : 'rgba(255,69,58,0.1)',
                                    color: run.status === 'success' ? '#34C759' : '#FF453A',
                                  }}
                                >
                                  {run.status === 'success' ? 'OK' : run.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
